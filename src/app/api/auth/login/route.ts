import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, issueSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";
import { normalizeGhanaPhone } from "@/lib/phone";
import { z } from "zod";

const bodySchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Phone and password are required" }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ ok: false, error: "Invalid Ghana phone number" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user?.password) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.password);
  if (!ok) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });

  const { token, expires } = await issueSession(user.id);
  const res = NextResponse.json({
    ok: true,
    role: user.role,
    redirect: user.role === "ADMIN" ? "/admin" : "/dashboard",
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    expires,
    path: "/",
  });
  return res;
}
