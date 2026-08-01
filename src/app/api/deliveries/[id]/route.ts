import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

// GET single delivery; PATCH — assign driver / advance status
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const delivery = await prisma.delivery.findUnique({
    where: { id },
    include: { orders: { include: { order: true } }, driver: true, route: true },
  });
  if (!delivery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(delivery);
}

const patchSchema = z.object({
  status: z.enum(["PENDING", "ASSIGNED", "PICKED", "IN_TRANSIT", "COMPLETED", "CANCELED"]).optional(),
  driverId: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.driverId) data.driverId = parsed.data.driverId;
  if (parsed.data.startedAt) data.startedAt = new Date(parsed.data.startedAt);
  if (parsed.data.completedAt) data.completedAt = new Date(parsed.data.completedAt);

  const delivery = await prisma.delivery.update({ where: { id }, data });

  // When a delivery completes, mark all its orders DELIVERED (BPR to-be final step)
  if (parsed.data.status === "COMPLETED") {
    const links = await prisma.deliveryOrder.findMany({ where: { deliveryId: id } });
    await prisma.order.updateMany({
      where: { id: { in: links.map((l) => l.orderId) } },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
  }
  return NextResponse.json(delivery);
}
