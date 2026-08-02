"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface InvItem { id: string; batchNo?: string | null; status: string; grade?: string | null; harvestDate: string; weight?: number | null; produceItem: { name: string; unit: string }; farm?: { name: string } | null; }
const STATUSES = ["HARVESTED", "GRADED", "PACKED", "DISPATCHED", "DELIVERED", "RETURNED"];
const GRADES = ["A", "B", "C_REJECT"];

export default function AdminInventory() {
  const [items, setItems] = useState<InvItem[]>([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); const res = await fetch("/api/inventory", { cache: "no-store" }); const data = await res.json(); if (res.ok) setItems(data); setLoading(false); };
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string, grade: string) => { await fetch(`/api/inventory/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, grade: grade || undefined }) }); load(); };
  if (loading) return <p className="text-sm text-muted">Loading inventory…</p>;
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Harvest control</p><h1 className="mt-2 font-display text-4xl font-semibold text-primary-deep">Inventory</h1><p className="mt-2 text-sm text-muted">Harvest → grade → pack.</p></div><Button variant="outline" size="sm" onClick={load}><ArrowPathIcon className="mr-2 size-4" aria-hidden="true" /> Refresh</Button></header><div className="overflow-hidden rounded-2xl border border-line bg-surface"><div className="overflow-x-auto"><table className="ops-table"><thead><tr><th>Produce</th><th>Farm</th><th>Batch</th><th>Harvested</th><th>Status</th><th>Grade</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="hover:bg-surface-muted/50"><td><p className="font-semibold text-ink">{item.produceItem.name}</p><p className="mt-1 text-xs text-muted">{item.produceItem.unit}{item.weight ? ` · ${item.weight}` : ""}</p></td><td className="text-muted">{item.farm?.name ?? "—"}</td><td className="font-mono text-xs text-muted">{item.batchNo ?? "—"}</td><td className="whitespace-nowrap text-xs text-muted">{new Date(item.harvestDate).toLocaleDateString("en-GB")}</td><td><div className="space-y-2"><StatusBadge status={item.status} /><select aria-label={`Update ${item.produceItem.name} status`} defaultValue={item.status} onChange={(e) => update(item.id, e.target.value, item.grade ?? "A")} className="block rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-ink outline-hidden focus:border-primary">{STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></div></td><td><select aria-label={`Update ${item.produceItem.name} grade`} defaultValue={item.grade ?? ""} onChange={(e) => update(item.id, item.status, e.target.value)} className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-ink outline-hidden focus:border-primary"><option value="">—</option>{GRADES.map((grade) => <option key={grade} value={grade}>{grade.replace("_", " ")}</option>)}</select></td><td><Button size="sm" variant="ghost" onClick={load}>Refresh</Button></td></tr>)}{items.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm text-muted">No harvest receipts yet.</td></tr>}</tbody></table></div></div></div>;
}
