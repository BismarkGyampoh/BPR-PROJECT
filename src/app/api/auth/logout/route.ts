import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revokeSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  const res = NextResponse.json({ ok: true, redirect: "/login" });
  res.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  return res;
}
