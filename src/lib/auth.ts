import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { normalizeGhanaPhone } from "@/lib/phone";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";

export const SESSION_COOKIE = "fc_sess";
export const SESSION_TTL_MS = 30 * 24 * 3600 * 1000; // 30 days

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue);
}

export async function issueSession(userId: string): Promise<{ token: string; expires: Date }> {
  const token = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { sessionToken: token, userId, expires },
  });
  return { token, expires };
}

export async function revokeSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { sessionToken: token } });
}

export async function getCurrentUser(token?: string | null): Promise<User | null> {
  if (!token) return null;
  const sess = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });
  if (!sess || sess.expires < new Date()) {
    if (sess) await prisma.session.deleteMany({ where: { sessionToken: token } });
    return null;
  }
  return sess.user;
}

export { normalizeGhanaPhone };
export type { Role, User };

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return getCurrentUser(token);
}

export async function requireAuth(redirectTo = "/login"): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
  return user;
}
