import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/crates — public catalog of active crate plans (BPR report §4.3)
export async function GET() {
  const plans = await prisma.cratePlan.findMany({
    where: { isActive: true },
    include: {
      items: {
        include: { produceItem: true },
        orderBy: { produceItemId: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(plans);
}
