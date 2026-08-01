"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { User } from "@prisma/client";

export default function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const baseLinks = [
    { href: "/", label: "Home" },
    { href: "/crates", label: "Crate Plans" },
  ];
  if (user) {
    if (user.role === "ADMIN") baseLinks.push({ href: "/admin", label: "Admin" });
    else baseLinks.push({ href: "/dashboard", label: "My Crate" });
  }

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-line/90 bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-18 w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="FreshCrate home">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:rotate-6">
            F
          </span>
          <span className="font-display text-xl font-semibold tracking-[-0.03em] text-primary-deep sm:text-2xl">
            FreshCrate
          </span>
        </Link>

        <div className="hidden items-center gap-2 text-xs text-muted lg:flex">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Harvested to order in Greater Accra
        </div>

        <nav aria-label="Primary navigation" className="flex items-center gap-1.5 text-sm">
          {baseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={clsx(
                "rounded-full px-3.5 py-2 font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-ink sm:px-4",
                isActive(link.href) && "bg-surface text-primary-deep shadow-xs",
              )}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={onLogout}
              className="rounded-full px-3.5 py-2 font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-ink sm:px-4"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-deep hover:shadow-md focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-primary/25"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
