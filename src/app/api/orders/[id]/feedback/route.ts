import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/orders/[id]/feedback — fetch existing feedback for an order
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id },
    select: { subscription: { select: { userId: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.subscription.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const feedback = await prisma.feedback.findMany({
    where: { orderId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(feedback);
}

// POST /api/orders/[id]/feedback — submit feedback (customer only, order must be DELIVERED)
const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id },
    select: { subscription: { select: { userId: true } }, status: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.subscription.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Feedback can only be submitted for delivered orders" }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.feedback.findUnique({
    where: { orderId_userId: { orderId: id, userId: user.id } },
  });

  let feedback;
  if (existing) {
    feedback = await prisma.feedback.update({
      where: { id: existing.id },
      data: { rating: parsed.data.rating, comment: parsed.data.comment },
    });
  } else {
    feedback = await prisma.feedback.create({
      data: {
        orderId: id,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });
  }

  return NextResponse.json(feedback, { status: existing ? 200 : 201 });
}
