import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import type { InventoryStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/inventory — list harvest inventory with optional ?status= filter
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") as InventoryStatus | null;
  const inventory = await prisma.inventoryItem.findMany({
    where: status ? { status } : {},
    include: { produceItem: true, farm: true },
    orderBy: { harvestDate: "desc" },
  });
  return NextResponse.json(inventory);
}

// POST /api/inventory — record a new harvest receipt (BPR to-be step 2/3)
const receiptSchema = z.object({
  produceItemId: z.string(),
  farmerId: z.string().optional(),
  batchNo: z.string().optional(),
  harvestDate: z.string(),
  weight: z.number().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = receiptSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const item = await prisma.inventoryItem.create({
    data: {
      produceItemId: parsed.data.produceItemId,
      farmerId: parsed.data.farmerId,
      batchNo: parsed.data.batchNo,
      harvestDate: new Date(parsed.data.harvestDate),
      weight: parsed.data.weight,
      status: "HARVESTED",
    },
  });
  return NextResponse.json(item, { status: 201 });
}
