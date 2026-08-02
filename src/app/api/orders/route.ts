import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/orders — customers see their own orders; admins see all
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: user.role === "ADMIN" ? {} : { subscription: { userId: user.id } },
    include: {
      subscription: { include: { cratePlan: true, user: { select: { name: true, phone: true } } } },
      items: { include: { produceItem: true } },
      payments: true,
      feedbacks: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
