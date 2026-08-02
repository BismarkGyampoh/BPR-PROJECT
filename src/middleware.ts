import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getCurrentUser } from "@/lib/auth";

function isProtected(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/customize") ||
    pathname.startsWith("/track") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/rider")
  );
}

export async function middleware(req: NextRequest) {
  // This middleware reads the session from the DB (via Prisma) to enforce
  // admin-only routes. Prisma requires the Node.js runtime, so opt out of
  // the Edge runtime here.
  const { pathname } = req.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const user = await getCurrentUser(token);
    if (!user || user.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = user ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/rider")) {
    const user = await getCurrentUser(token);
    if (!user || user.role !== "DELIVERY") {
      const url = req.nextUrl.clone();
      url.pathname = user ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export const runtime = "nodejs";
