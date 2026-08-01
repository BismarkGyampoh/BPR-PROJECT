import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/deliveries — list deliveries (admin)
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deliveries = await prisma.delivery.findMany({
    include: { orders: { include: { order: true } }, driver: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deliveries);
}

// POST /api/deliveries — batch orders into a zone delivery (BPR to-be step 5)
const createSchema = z.object({
  zone: z.string(),
  orderIds: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { zone, orderIds } = parsed.data;
  // verify orders are PICKED or PACKED
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, status: { in: ["PACKED", "PICKED"] } },
  });
  if (orders.length !== orderIds.length) {
    return NextResponse.json({ error: "Some orders are not ready for dispatch" }, { status: 400 });
  }

  const delivery = await prisma.delivery.create({
    data: {
      zone,
      status: "ASSIGNED",
      orders: {
        create: orderIds.map((oid, idx) => ({ order: { connect: { id: oid } }, stopSequence: idx })),
      },
    },
  });
  // advance those orders to OUT_FOR_DELIVERY
  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { status: "OUT_FOR_DELIVERY" },
  });
  return NextResponse.json(delivery, { status: 201 });
}
