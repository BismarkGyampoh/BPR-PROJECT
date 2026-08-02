"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { GHS } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Order {
  id: string;
  status: string;
  scheduledDate: string;
  totalValue: number;
  subscription: { cratePlan: { name: string }; user: { name?: string | null; phone?: string | null } };
  items: Array<{ produceItem: { name: string } }>;
}

const STATUSES = ["PENDING", "PICKED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); const res = await fetch("/api/orders", { cache: "no-store" }); const data = await res.json(); if (res.ok) setOrders(data); setLoading(false); };
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => { await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); load(); };

  if (loading) return <p className="text-sm text-muted">Loading orders…</p>;
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Workflow queue</p><h1 className="mt-2 font-display text-4xl font-semibold text-primary-deep">Orders</h1><p className="mt-2 text-sm text-muted">Pick → pack → dispatch → deliver.</p></div><Button variant="outline" size="sm" onClick={load}><ArrowPathIcon className="mr-2 size-4" aria-hidden="true" /> Refresh</Button></header><div className="overflow-hidden rounded-2xl border border-line bg-surface"><div className="overflow-x-auto"><table className="ops-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Scheduled</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="hover:bg-surface-muted/50"><td className="font-mono text-xs font-semibold text-ink">#{order.id.slice(0, 8)}</td><td><p className="font-semibold text-ink">{order.subscription.user.name ?? "—"}</p><p className="mt-1 text-xs text-muted">{order.subscription.cratePlan.name}</p></td><td className="text-muted">{order.items.length} line(s)</td><td className="whitespace-nowrap text-xs text-muted">{new Date(order.scheduledDate).toLocaleDateString("en-GB")}</td><td className="font-mono font-semibold text-ink">{GHS.format(order.totalValue)}</td><td><div className="flex flex-wrap items-center gap-2"><StatusBadge status={order.status} /><select aria-label={`Update order ${order.id} status`} defaultValue={order.status} onChange={(e) => update(order.id, e.target.value)} className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-ink outline-hidden focus:border-primary">{STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></div></td></tr>)}{orders.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-muted">No orders.</td></tr>}</tbody></table></div></div></div>;
}
