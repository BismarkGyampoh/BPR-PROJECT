import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRightIcon, CommandLineIcon } from "@heroicons/react/24/outline";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-deep text-white"><CommandLineIcon className="size-5" aria-hidden="true" /></span>
          <div><p className="eyebrow">Operations console</p><p className="mt-1 text-sm text-muted">FreshCrate / Greater Accra</p></div>
        </div>
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted hover:text-primary">View customer site <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" /></Link>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[210px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24"><AdminNav /></aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
