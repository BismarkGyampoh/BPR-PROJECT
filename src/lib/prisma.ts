import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `prisma` across hot-reloaded dev sessions
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
