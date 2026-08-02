"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckCircleIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { GHS } from "@/lib/utils";
import type { CratePlan, CrateItem, ProduceItem, User } from "@prisma/client";

type Plan = CratePlan & { items: (CrateItem & { produceItem: ProduceItem })[] };

interface AddressLike {
  line1?: string;
  area?: string;
  landmark?: string;
}

export default function CheckoutForm({ plan, user }: { plan: Plan; user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialAddress = (user.address as AddressLike | null) ?? {};

  const [address, setAddress] = useState({
    line1: initialAddress.line1 ?? "",
    area: initialAddress.area ?? "",
    landmark: initialAddress.landmark ?? "",
  });

  const [qtys, setQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(plan.items.map((i) => [i.produceItemId, i.defaultQty ?? 0])),
  );

  const totalItems = plan.items.length;
  const selectedCount = Object.values(qtys).filter((q) => q > 0).length;

  const setQty = (produceItemId: string, value: number) =>
    setQtys((q) => ({ ...q, [produceItemId]: Math.max(0, value) }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.line1 || !address.area) {
      setError("Delivery address is required");
      return;
    }
    if (selectedCount === 0) {
      setError("Select at least one item");
      return;
    }
    if (selectedCount > plan.maxItems) {
      setError(`You can choose up to ${plan.maxItems} item types`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cratePlanId: plan.id,
          deliveryAddress: address,
          items: Object.entries(qtys)
            .filter(([, q]) => q > 0)
            .map(([produceItemId, qty]) => ({ produceItemId, qty })),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Subscription failed");
      router.push(`/track/${data.orderId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-6">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Step 02 · Make it yours</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-primary-deep">Customize your {plan.name} crate</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Adjust quantities or set an item to 0 to skip. Required items are marked in the list.</p>
          </div>
          <div className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-muted">Weekly subscription</div>
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.72fr] lg:gap-12">
        <section aria-labelledby="produce-heading" className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="produce-heading" className="font-display text-2xl font-semibold text-ink">Choose your produce</h2>
            <span className="font-mono text-xs text-muted">{selectedCount}/{plan.maxItems} selected</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {plan.items.map((item, index) => {
              const required = !item.isOptional;
              const inputId = `qty-${item.produceItemId}`;
              return (
                <div key={item.id} className={`flex items-center justify-between gap-4 px-4 py-4 sm:px-5 ${index > 0 ? "border-t border-line" : ""}`}>
                  <label htmlFor={inputId} className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{item.produceItem.name}</span>
                    <span className="mt-1 block text-xs text-muted">{item.produceItem.unit}{required ? " · Required" : " · Optional"}</span>
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    min={required ? 1 : 0}
                    value={qtys[item.produceItemId] ?? 0}
                    onChange={(e) => setQty(item.produceItemId, Number(e.target.value))}
                    aria-label={`${item.produceItem.name} quantity`}
                    className="h-10 w-20 rounded-xl border border-line bg-canvas px-2 text-right font-mono text-sm text-ink outline-hidden transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted">{selectedCount} of {totalItems} items selected. You can choose up to {plan.maxItems} item types.</p>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="site-panel overflow-hidden">
            <div className="bg-primary-deep px-5 py-5 text-white sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your order</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold">{plan.name} crate</h2>
                <p className="font-mono text-xl font-semibold">{GHS.format(plan.basePrice)}</p>
              </div>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <fieldset className="space-y-4">
                <legend className="mb-1 font-display text-xl font-semibold text-ink">Delivery details</legend>
                <div>
                  <label htmlFor="address-line1" className="mb-2 block text-sm font-semibold text-ink">Address (line 1)</label>
                  <div className="relative"><MapPinIcon className="pointer-events-none absolute left-3 top-3 size-4 text-muted" aria-hidden="true" /><input id="address-line1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className="input pl-10" required /></div>
                </div>
                <div>
                  <label htmlFor="address-area" className="mb-2 block text-sm font-semibold text-ink">Area / Town</label>
                  <input id="address-area" value={address.area} onChange={(e) => setAddress((a) => ({ ...a, area: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label htmlFor="address-landmark" className="mb-2 block text-sm font-semibold text-ink">Landmark (optional)</label>
                  <input id="address-landmark" value={address.landmark} onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))} className="input" />
                </div>
              </fieldset>
              <div className="flex items-start gap-3 rounded-2xl bg-surface-muted p-3 text-xs leading-5 text-muted">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Paid via Mobile Money to <strong className="font-semibold text-ink">{user.phone ?? "your saved phone"}</strong>.</span>
              </div>
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing…" : `Pay ${GHS.format(plan.basePrice)} & subscribe`}
                {!loading && <ArrowRightIcon className="ml-2 size-4" aria-hidden="true" />}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted"><CheckCircleIcon className="size-4 text-primary" aria-hidden="true" /> Pause, skip, or customize each cycle.</div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
