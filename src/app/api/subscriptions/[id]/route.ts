import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/subscriptions/[id] — subscription detail (owner or admin)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      cratePlan: {
        include: { items: { include: { produceItem: true } } },
      },
      customItems: { include: { produceItem: true } },
      orders: { orderBy: { createdAt: "desc" } },
      payments: true,
    },
  });
  if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (subscription.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(subscription);
}

// PATCH /api/subscriptions/[id] — update plan, custom items, or status
const patchSchema = z.object({
  cratePlanId: z.string().optional(),
  customItems: z
    .array(z.object({ produceItemId: z.string(), qty: z.number().min(0) }))
    .optional(),
  action: z.enum(["PAUSE", "RESUME", "CANCEL", "NONE"]).optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { cratePlanId, customItems, action } = parsed.data;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { cratePlan: { include: { items: { include: { produceItem: true } } } } },
  });
  if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (subscription.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    if (cratePlanId) {
      if (cratePlanId !== subscription.cratePlanId) {
        await tx.subscription.update({
          where: { id },
          data: { cratePlanId },
        });
      }
    }

    if (customItems) {
      await tx.subscriptionItem.deleteMany({ where: { subscriptionId: id } });
      await tx.subscriptionItem.createMany({
        data: customItems
          .filter((i) => i.qty > 0)
          .map((i) => ({
            subscriptionId: id,
            produceItemId: i.produceItemId,
            qty: i.qty,
            action: "KEEP",
          })),
      });
    }

    if (action === "PAUSE") {
      await tx.subscription.update({ where: { id }, data: { status: "PAUSED", pausedAt: new Date() } });
    } else if (action === "RESUME") {
      await tx.subscription.update({ where: { id }, data: { status: "ACTIVE", pausedAt: null, nextBillingAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });
    } else if (action === "CANCEL") {
      await tx.subscription.update({ where: { id }, data: { status: "CANCELED", cancelledAt: new Date() } });
    }
  });

  const updated = await prisma.subscription.findUnique({
    where: { id },
    include: {
      cratePlan: { include: { items: { include: { produceItem: true } } } },
      customItems: { include: { produceItem: true } },
    },
  });
  return NextResponse.json(updated);
}
