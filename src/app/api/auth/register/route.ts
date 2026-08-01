import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, issueSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";
import { normalizeGhanaPhone } from "@/lib/phone";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ ok: false, error: "Invalid Ghana phone number" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return NextResponse.json({ ok: false, error: "Phone already registered" }, { status: 409 });

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      phone,
      password: passwordHash,
      role: "CUSTOMER",
    },
  });

  const { token, expires } = await issueSession(user.id);
  const res = NextResponse.json({
    ok: true,
    role: user.role,
    redirect: "/dashboard",
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
