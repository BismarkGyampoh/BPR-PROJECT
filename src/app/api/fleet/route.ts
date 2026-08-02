import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/fleet — admin-only: list all delivery riders
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const riders = await prisma.user.findMany({
    where: { role: "DELIVERY" },
    select: { id: true, name: true, phone: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(riders);
}
