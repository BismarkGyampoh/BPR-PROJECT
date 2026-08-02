"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, CubeIcon, CreditCardIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

interface Stats {
  ordersPending: number;
  deliveredToday: number;
  inventoryToGrade: number;
  inTransit: number;
  subscriptionsActive: number;
  paymentsToday: number;
}

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (res.status === 401) router.replace("/login");
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };
   useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cards = stats ? [
    { label: "Orders pending", value: stats.ordersPending, Icon: CubeIcon, tone: "text-accent" },
    { label: "Delivered today", value: stats.deliveredToday, Icon: TruckIcon, tone: "text-primary" },
    { label: "Produce to grade", value: stats.inventoryToGrade, Icon: CubeIcon, tone: "text-orange-700" },
    { label: "In-transit deliveries", value: stats.inTransit, Icon: TruckIcon, tone: "text-primary" },
    { label: "Active subscriptions", value: stats.subscriptionsActive, Icon: CreditCardIcon, tone: "text-primary" },
    { label: "Payments today", value: stats.paymentsToday, Icon: CreditCardIcon, tone: "text-primary" },
  ] : [];

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 animate-pulse rounded-lg bg-surface-muted" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-28 animate-pulse rounded-2xl bg-surface-muted" /><div className="h-28 animate-pulse rounded-2xl bg-surface-muted" /><div className="h-28 animate-pulse rounded-2xl bg-surface-muted" /></div></div>;

  return (
    <div className="space-y-8">
      <header><p className="eyebrow">Today&apos;s pulse</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-primary-deep">Admin overview</h1><p className="mt-2 text-sm text-muted">A live view of the harvest-to-doorstep flow.</p></header>
      <section className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-3" aria-label="Operations metrics">
        {cards.map(({ label, value, Icon, tone }) => <div key={label} className="bg-surface p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p><Icon className={`size-5 ${tone}`} aria-hidden="true" /></div><p className="mt-4 font-mono text-3xl font-semibold text-ink">{String(value).padStart(2, "0")}</p></div>)}
      </section>
      <section className="rounded-3xl bg-primary-deep p-6 text-white sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Keep the chain moving</p><div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><h2 className="font-display text-3xl font-semibold">Pick, pack, dispatch, deliver.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Use the operational queues below to keep each crate inside the 48-hour promise.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/orders"><Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white hover:text-primary-deep">Review orders <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" /></Button></Link><Link href="/admin/inventory"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Grade inventory</Button></Link></div></div></section>
    </div>
  );
}
