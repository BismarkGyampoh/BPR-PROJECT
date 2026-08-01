import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requestToPay } from "@/lib/momo";
import { z } from "zod";

// POST /api/subscribe — creates a Subscription + first Order + MoMo payment intent
// Maps BPR to-be steps: demand forecast → harvest → hub → crate assembly → request-to-pay
const Body = z.object({
  cratePlanId: z.string(),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    area: z.string().min(1),
    landmark: z.string().optional(),
  }),
  items: z
    .array(z.object({ produceItemId: z.string(), qty: z.number().min(0) }))
    .optional()
    .default([]),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { cratePlanId, deliveryAddress, items } = parsed.data;
  const plan = await prisma.cratePlan.findUnique({
    where: { id: cratePlanId },
    include: { items: { include: { produceItem: true } } },
  });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  if (!user.phone) return NextResponse.json({ error: "Phone number is required to pay with MoMo" }, { status: 400 });

  // Build order items from plan defaults merged with the user's selections (customize)
  const orderItems: Array<{ produceItemId: string; qty: number; unitPrice: number }> = [];
  for (const ci of plan.items) {
    const override = items.find((i) => i.produceItemId === ci.produceItemId);
    const qty = override ? override.qty : ci.defaultQty ?? 0;
    if (qty > 0) orderItems.push({ produceItemId: ci.produceItemId, qty, unitPrice: ci.produceItem.unitPrice });
  }
  const totalValue = orderItems.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

  const nextBilling = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const scheduled = new Date(Date.now() + 48 * 3600 * 1000);

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      cratePlanId: plan.id,
      status: "PENDING",
      frequency: plan.frequency,
      startDate: new Date(),
      nextBillingAt: nextBilling,
      deliveryAddress,
      paymentMethod: "MOMO",
      customItems: {
        create: orderItems.map((oi) => ({ produceItemId: oi.produceItemId, qty: oi.qty, action: "KEEP" })),
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      subscriptionId: subscription.id,
      status: "PENDING",
      scheduledDate: scheduled,
      totalValue,
    },
  });

  const momo = await requestToPay({
    amount: plan.basePrice,
    currency: plan.currency,
    phone: user.phone,
    externalId: order.id,
    payerMessage: `FreshCrate ${plan.name} crate`,
    payeeNote: `Order #${order.id.slice(0, 8)} subscription payment`,
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      subscriptionId: subscription.id,
      provider: "MTN_MOMO",
      amount: plan.basePrice,
      currency: plan.currency,
      status: "PENDING",
      mtnRequestId: momo.referenceId,
    },
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    subscriptionId: subscription.id,
    paymentId: payment.id,
    amount: plan.basePrice,
    currency: plan.currency,
    mtnReferenceId: momo.referenceId,
    simulated: momo.simulated,
  });
}
