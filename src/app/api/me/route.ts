import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json(null);
  return NextResponse.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    address: user.address,
  });
}
