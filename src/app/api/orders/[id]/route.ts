import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/orders/[id] — order detail (owner or admin)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      subscription: { include: { cratePlan: true, user: { select: { name: true, phone: true } } } },
      items: { include: { produceItem: true } },
       payments: true,
      deliveries: { include: { delivery: true } },
      feedbacks: { include: { user: { select: { name: true } } } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.subscription.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(order);
}

// PATCH /api/orders/[id] — admin advances order status through the BPR to-be flow
const patchSchema = z.object({
  status: z.enum(["PENDING", "PICKED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELED"]).optional(),
  deliveredAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.data.status) data.status = body.data.status;
  if (body.data.deliveredAt) data.deliveredAt = new Date(body.data.deliveredAt);

  const order = await prisma.order.update({ where: { id }, data });
  if (body.data.status === "OUT_FOR_DELIVERY") {
    // link to a delivery record if one exists
    const delivery = await prisma.delivery.findFirst({ where: { orders: { some: { orderId: id } } } });
    if (delivery) await prisma.delivery.update({ where: { id: delivery.id }, data: { status: "IN_TRANSIT" } });
  }
  return NextResponse.json(order);
}
