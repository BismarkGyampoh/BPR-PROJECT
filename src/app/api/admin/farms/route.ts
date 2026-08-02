import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/farms — list farms; POST — add a farm
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const farms = await prisma.farm.findMany({ include: { produceItems: true } });
  return NextResponse.json(farms);
}

const farmSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().min(1),
  phone: z.string().min(1),
  location: z.string().min(1),
  region: z.string().default("Greater Accra"),
  certification: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = farmSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const farm = await prisma.farm.create({ data: parsed.data });
  return NextResponse.json(farm, { status: 201 });
}
