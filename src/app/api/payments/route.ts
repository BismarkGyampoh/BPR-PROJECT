import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/payments — list payments (admin: all; customer: own)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: user.role === "ADMIN" ? {} : { subscription: { userId: user.id } },
    include: {
      order: { include: { subscription: { include: { user: { select: { name: true, phone: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}
