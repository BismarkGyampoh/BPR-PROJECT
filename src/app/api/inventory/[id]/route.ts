import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import type { InventoryStatus, Grade } from "@prisma/client";
import { z } from "zod";

// GET /api/inventory/[id] — single batch; PATCH — grade / advance status
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { produceItem: true, farm: true, orderItems: { include: { orderItem: { include: { produceItem: true } } } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

const patchSchema = z.object({
  status: z.enum(["HARVESTED", "GRADED", "PACKED", "DISPATCHED", "DELIVERED", "RETURNED"]).optional(),
  grade: z.enum(["A", "B", "C_REJECT"]).optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const data: { status?: InventoryStatus; grade?: Grade } = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.grade) data.grade = parsed.data.grade;

  const item = await prisma.inventoryItem.update({ where: { id }, data });
  return NextResponse.json(item);
}
