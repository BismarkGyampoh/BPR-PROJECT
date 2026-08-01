"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ArchiveBoxIcon, BanknotesIcon, ClipboardDocumentListIcon, HomeIcon, MapIcon, TruckIcon } from "@heroicons/react/24/outline";

const nav = [
  { href: "/admin", label: "Overview", Icon: HomeIcon },
  { href: "/admin/farms", label: "Farms", Icon: MapIcon },
  { href: "/admin/inventory", label: "Inventory", Icon: ArchiveBoxIcon },
  { href: "/admin/orders", label: "Orders", Icon: ClipboardDocumentListIcon },
  { href: "/admin/deliveries", label: "Deliveries", Icon: TruckIcon },
  { href: "/admin/payments", label: "Payments", Icon: BanknotesIcon },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Operations navigation" className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
      {nav.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
