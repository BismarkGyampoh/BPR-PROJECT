"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { GHS } from "@/lib/utils";
import type { CratePlan, CrateItem, ProduceItem, Subscription, SubscriptionItem } from "@prisma/client";

type PlanWithItems = CratePlan & {
  items: (CrateItem & { produceItem: ProduceItem })[];
};

type SubWithPlan = Subscription & {
  cratePlan: PlanWithItems;
  customItems: SubscriptionItem[];
};

interface CustomizeFormProps {
  subscription: SubWithPlan;
  plans: PlanWithItems[];
}

export default function CustomizeForm({ subscription, plans }: CustomizeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const currentQty = (produceItemId: string) => {
    const existing = subscription.customItems.find((i) => i.produceItemId === produceItemId);
    if (existing) return existing.qty;
    const planItem = subscription.cratePlan.items.find((i) => i.produceItemId === produceItemId);
    return planItem?.defaultQty ?? 0;
  };

  const [selectedPlanId, setSelectedPlanId] = useState(subscription.cratePlanId);
  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    subscription.cratePlan.items.forEach((i) => {
      map[i.produceItemId] = currentQty(i.produceItemId);
    });
    return map;
  });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? subscription.cratePlan;

  const setQty = (produceItemId: string, value: number) =>
    setQtys((q) => ({ ...q, [produceItemId]: Math.max(0, value) }));

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setSelectedPlanId(planId);
    const newQtys: Record<string, number> = {};
    plan.items.forEach((i) => {
      newQtys[i.produceItemId] = i.defaultQty ?? 0;
    });
    setQtys(newQtys);
  };

  const selectedCount = Object.values(qtys).filter((q) => q > 0).length;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selectedCount === 0) {
      setError("Select at least one item");
      return;
    }
    if (selectedCount > selectedPlan.maxItems) {
      setError(`You can choose up to ${selectedPlan.maxItems} item types`);
      return;
    }

    const items = Object.entries(qtys)
      .filter(([, q]) => q > 0)
      .map(([produceItemId, qty]) => ({ produceItemId, qty }));

    startTransition(async () => {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cratePlanId: selectedPlanId, customItems: items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update subscription");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-semibold text-muted transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="mr-2 size-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <header className="border-b border-line pb-8">
        <p className="eyebrow">Manage your crate</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-primary-deep">
          Customize your subscription
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Switch your crate plan or adjust which produce items you receive each cycle. Changes take
          effect for your next delivery.
        </p>
      </header>

      <section className="site-panel p-6 sm:p-8" aria-labelledby="plan-heading">
        <h2 id="plan-heading" className="font-display text-2xl font-semibold text-ink">
          Crate plan
        </h2>
        <p className="mt-2 text-sm text-muted">
          Currently: <span className="font-semibold text-ink">{subscription.cratePlan.name}</span>
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const active = plan.name === subscription.cratePlan.name;
            const selected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handlePlanChange(plan.id)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  selected
                    ? "border-primary bg-surface-muted shadow-sm"
                    : active
                      ? "border-primary/45"
                      : "border-line hover:border-primary/40"
                }`}
              >
                <h3 className="font-display text-xl font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1 font-mono text-lg font-semibold text-primary">
                  {GHS.format(plan.basePrice)}
                </p>
                <p className="mt-2 text-xs text-muted">{plan.description}</p>
                <span
                  className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
                    active ? "text-amber-700" : "text-muted"
                  }`}
                >
                  {active && <SwatchIcon className="size-3.5" aria-hidden="true" />}
                  {active ? "Your current plan" : selected ? "Selected" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="site-panel overflow-hidden p-6 sm:p-8" aria-labelledby="items-heading">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
            <h2 id="items-heading" className="font-display text-2xl font-semibold text-ink">
              Your produce selection
            </h2>
            <span className="font-mono text-xs text-muted">
              {selectedCount}/{selectedPlan.maxItems} selected
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
            {selectedPlan.items.map((item, index) => {
              const required = !item.isOptional;
              const inputId = `qty-${item.produceItemId}`;
              const qty = qtys[item.produceItemId] ?? 0;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 ${
                    index > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <label htmlFor={inputId} className="min-w-0">
                    <span className="block font-semibold text-ink">{item.produceItem.name}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {item.produceItem.unit}
                      {required ? " · Required" : " · Optional"}
                    </span>
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    min={required ? 1 : 0}
                    max={99}
                    value={qty}
                    onChange={(e) => setQty(item.produceItemId, Number(e.target.value))}
                    aria-label={`${item.produceItem.name} quantity`}
                    className="h-10 w-20 rounded-xl border border-line bg-canvas px-2 text-right font-mono text-sm text-ink outline-hidden transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                  />
                </div>
              );
            })}
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CheckCircleIcon className="size-4 text-primary" aria-hidden="true" />
            Pause, skip, or customize each cycle.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xl font-semibold text-ink">
              {GHS.format(selectedPlan.basePrice)}
            </span>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
              {!isPending && <ArrowRightIcon className="ml-2 size-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
