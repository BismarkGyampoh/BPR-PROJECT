"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { GHS } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Payment { id: string; amount: number; currency: string; status: string; provider: string; paidAt?: string | null; createdAt: string; order?: { subscription?: { user?: { name?: string | null; phone?: string | null } } }; }
export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); const res = await fetch("/api/payments", { cache: "no-store" }); const data = await res.json(); if (res.ok) setPayments(data); setLoading(false); };
  useEffect(() => { load(); }, []);
  if (loading) return <p className="text-sm text-muted">Loading payments…</p>;
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Money movement</p><h1 className="mt-2 font-display text-4xl font-semibold text-primary-deep">Payments</h1><p className="mt-2 text-sm text-muted">Mobile Money and card settlement activity.</p></div><Button variant="outline" size="sm" onClick={load}><ArrowPathIcon className="mr-2 size-4" aria-hidden="true" /> Refresh</Button></header><div className="overflow-hidden rounded-2xl border border-line bg-surface"><div className="overflow-x-auto"><table className="ops-table"><thead><tr><th>Customer</th><th>Amount</th><th>Provider</th><th>Status</th><th>Paid at</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="hover:bg-surface-muted/50"><td><p className="font-semibold text-ink">{payment.order?.subscription?.user?.name ?? "—"}</p><p className="mt-1 text-xs text-muted">{payment.order?.subscription?.user?.phone ?? "No phone"}</p></td><td className="font-mono font-semibold text-ink">{GHS.format(payment.amount)}</td><td className="text-xs uppercase tracking-[0.1em] text-muted">{payment.provider}</td><td><StatusBadge status={payment.status} /></td><td className="whitespace-nowrap text-xs text-muted">{payment.paidAt ? new Date(payment.paidAt).toLocaleString("en-GB") : "—"}</td></tr>)}{payments.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-sm text-muted">No payments.</td></tr>}</tbody></table></div></div></div>;
}
