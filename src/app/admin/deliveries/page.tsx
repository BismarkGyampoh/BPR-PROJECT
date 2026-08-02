"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowPathIcon, TruckIcon, UserIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ZONES } from "@/lib/zones";

interface Order {
  id: string;
  status: string;
  scheduledDate: string;
  subscription: { cratePlan: { name: string }; user: { name?: string | null; phone?: string | null } };
}
interface Delivery {
  id: string;
  zone: string;
  status: string;
  driverId?: string | null;
  driver?: { name?: string | null } | null;
  estMinutes?: number | null;
  orders: Array<{ orderId: string }>;
}
interface Rider {
  id: string;
  name: string | null;
  phone: string;
}

export default function AdminDeliveries() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [driverAssigns, setDriverAssigns] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    const [or, de, rd] = await Promise.all([
      fetch("/api/orders", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/deliveries", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/fleet", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ]);
    if (Array.isArray(or)) setOrders(or);
    if (Array.isArray(de)) setDeliveries(de);
    if (Array.isArray(rd)) setRiders(rd as Rider[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const dispatchedIds = new Set(deliveries.flatMap((d) => d.orders.map((o) => o.orderId)));
  const ready = orders.filter(
    (o) => (o.status === "PACKED" || o.status === "PICKED") && !dispatchedIds.has(o.id),
  );

  const createDelivery = async () => {
    if (!zone || picked.size === 0) return;
    await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone, orderIds: Array.from(picked) }),
    });
    setPicked(new Set());
    setZone("");
    load();
  };

  const assignDriver = (deliveryId: string) => {
    const driverId = driverAssigns[deliveryId];
    if (!driverId) return;
    startTransition(async () => {
      await fetch(`/api/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      setDriverAssigns((d) => {
        const copy = { ...d };
        delete copy[deliveryId];
        return copy;
      });
      load();
    });
  };

  const complete = async (id: string) => {
    await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", completedAt: new Date().toISOString() }),
    });
    load();
  };

  if (loading) return <p className="text-sm text-muted">Loading deliveries…</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Route planning</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-primary-deep">Deliveries</h1>
          <p className="mt-2 text-sm text-muted">Batch ready orders by zone and assign to riders.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={isPending}>
          <ArrowPathIcon className="-ml-1 mr-2 size-4" aria-hidden="true" />
          {isPending ? "Refreshing…" : "Refresh"}
        </Button>
      </header>

      <section className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-primary-deep p-6 text-white">
          <TruckIcon className="size-6 text-accent" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Batch a route</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">Select packed orders and assign their delivery zone.</p>
        </div>
        <div className="space-y-4 bg-surface p-6">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Delivery zone</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="input text-sm"
            >
              <option value="">Select zone</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.label}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-line bg-canvas p-2 text-sm">
            {ready.map((order) => (
              <label
                key={order.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface"
              >
                <input
                  type="checkbox"
                  checked={picked.has(order.id)}
                  onChange={(e) => {
                    const next = new Set(picked);
                    if (e.target.checked) next.add(order.id);
                    else next.delete(order.id);
                    setPicked(next);
                  }}
                  className="size-4 accent-primary"
                />
                <span className="font-mono text-xs">#{order.id.slice(0, 8)}</span>
                <span className="truncate text-muted">
                  {order.subscription.user.name ?? "—"} · {order.subscription.cratePlan.name}
                </span>
              </label>
            ))}
            {ready.length === 0 && <p className="px-2 py-3 text-muted">No orders ready for dispatch.</p>}
          </div>
          <Button size="sm" onClick={createDelivery} disabled={!zone || picked.size === 0}>
            Create delivery ({picked.size})
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Orders</th>
                <th>Driver</th>
                <th>Assign</th>
                <th>Status</th>
                <th>ETA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-surface-muted/50">
                  <td className="font-semibold text-ink">{delivery.zone}</td>
                  <td className="font-mono text-sm text-muted">{delivery.orders.length}</td>
                  <td>
                    {delivery.driver ? (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <UserIcon className="size-4 text-muted" aria-hidden="true" />
                        {delivery.driver.name ?? "—"}
                      </span>
                    ) : (
                      <span className="text-sm text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {delivery.status === "IN_TRANSIT" || delivery.status === "COMPLETED" ? (
                      <span className="text-xs text-muted">—</span>
                    ) : (
                      <>
                        <select
                          value={driverAssigns[delivery.id] ?? ""}
                          onChange={(e) =>
                            setDriverAssigns((d) => ({ ...d, [delivery.id]: e.target.value }))
                          }
                          className="input text-xs"
                        >
                          <option value="">Select rider</option>
                          {riders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name ?? r.phone}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          disabled={!driverAssigns[delivery.id] || isPending}
                          onClick={() => assignDriver(delivery.id)}
                        >
                          {isPending ? "…" : "Assign"}
                        </Button>
                      </>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="font-mono text-xs text-muted">
                    {delivery.estMinutes ? `${delivery.estMinutes} min` : "—"}
                  </td>
                  <td>
                    {delivery.status === "IN_TRANSIT" && (
                      <Button size="sm" variant="outline" onClick={() => complete(delivery.id)}>
                        Mark completed
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted">
                    No deliveries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
