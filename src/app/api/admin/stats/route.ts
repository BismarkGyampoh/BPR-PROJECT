import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/stats — KPI summary for the admin dashboard (BPR §10 KPIs)
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [ordersPending, deliveredToday, inventoryToGrade, inTransit, subscriptionsActive, paymentsToday] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED", deliveredAt: { gte: today } } }),
      prisma.inventoryItem.count({ where: { status: { in: ["HARVESTED"] } } }),
      prisma.delivery.count({ where: { status: "IN_TRANSIT" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.payment.count({ where: { status: "SUCCESS", paidAt: { gte: today } } }),
    ]);

  return NextResponse.json({
    ordersPending,
    deliveredToday,
    inventoryToGrade,
    inTransit,
    subscriptionsActive,
    paymentsToday,
  });
}
