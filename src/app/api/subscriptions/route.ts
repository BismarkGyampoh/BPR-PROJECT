import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/subscriptions — list the current user's subscriptions with full plan details
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    include: {
      cratePlan: {
        include: { items: { include: { produceItem: true } } },
      },
      customItems: { include: { produceItem: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscriptions);
}
