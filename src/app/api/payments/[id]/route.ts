import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/momo";

// GET /api/payments/[id] — returns status, polling the MoMo gateway if still pending.
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: { include: { subscription: true } } },
  });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.order?.subscription?.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let updated: typeof payment | null = payment;
  if (payment.status === "PENDING" && payment.mtnRequestId) {
    try {
      const status = await getPaymentStatus(payment.mtnRequestId);
      const code = (status.status as string) || (status.statusCode as string) || "";
      if (code === "SUCCESS" || code === "SUCCESSFUL") {
        await prisma.$transaction([
          prisma.payment.update({ where: { id }, data: { status: "SUCCESS", paidAt: new Date() } }),
          prisma.subscription.update({
            where: { id: payment.subscriptionId! },
            data: { status: "ACTIVE" },
          }),
          prisma.order.update({ where: { id: payment.orderId! }, data: { status: "PICKED" } }),
        ]);
        updated = await prisma.payment.findUnique({
          where: { id },
          include: { order: { include: { subscription: true } } },
        });
      } else if (code === "FAILED") {
        await prisma.payment.update({ where: { id }, data: { status: "FAILED", failureReason: "Gateway declined" } });
        updated = await prisma.payment.findUnique({
          where: { id },
          include: { order: { include: { subscription: true } } },
        });
      }
    } catch {
      // gateway unreachable — keep PENDING, client can retry
    }
  }

  if (!updated) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  return NextResponse.json(updated);
}
