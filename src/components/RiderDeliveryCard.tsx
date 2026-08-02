"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon, MapPinIcon, PhoneIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface DeliveryOrder {
  orderId: string;
  stopSequence: number;
  order: {
    id: string;
    totalValue: number;
    scheduledDate: Date;
    subscription: {
      cratePlan: { name: string };
      user: { name?: string | null; phone?: string | null };
    };
    items: Array<{ produceItem: { name: string; unit: string }; qty: number }>;
  };
}

interface Delivery {
  id: string;
  zone: string;
  status: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  orders: DeliveryOrder[];
}

interface RiderDeliveryCardProps {
  delivery: Delivery;
}

export default function RiderDeliveryCard({ delivery }: RiderDeliveryCardProps) {
  const [currentStatus, setCurrentStatus] = useState(delivery.status);
  const [isPending, startTransition] = useTransition();

  const updateStatus = (status: string) => {
    startTransition(async () => {
      const body: Record<string, string> = { status };
      if (status === "PICKED") body.startedAt = new Date().toISOString();
      if (status === "IN_TRANSIT") body.startedAt = new Date().toISOString();
      if (status === "COMPLETED") body.completedAt = new Date().toISOString();

      const res = await fetch(`/api/deliveries/${delivery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) setCurrentStatus(data.status);
    });
  };

  const showStart = currentStatus === "ASSIGNED" || currentStatus === "PICKED";
  const showInTransit = currentStatus === "PICKED";
  const showComplete = currentStatus === "IN_TRANSIT";

  return (
    <article className="site-panel overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-primary">#{delivery.id.slice(0, 8)}</span>
            <StatusBadge status={currentStatus} />
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{delivery.zone}</h3>
          <p className="mt-1 text-sm text-muted">
            {delivery.startedAt && `Started ${delivery.startedAt.toLocaleTimeString("en-GB")}`}
            {delivery.completedAt && ` · Completed ${delivery.completedAt.toLocaleTimeString("en-GB")}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showStart && (
            <Button size="sm" onClick={() => updateStatus("PICKED")} disabled={isPending}>
              <TruckIcon className="mr-2 size-4" aria-hidden="true" />
              {isPending ? "Updating…" : "Start pickup"}
            </Button>
          )}
          {showInTransit && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("IN_TRANSIT")} disabled={isPending}>
              <MapPinIcon className="mr-2 size-4" aria-hidden="true" />
              {isPending ? "Updating…" : "Out for delivery"}
            </Button>
          )}
          {showComplete && (
            <Button size="sm" onClick={() => updateStatus("COMPLETED")} disabled={isPending}>
              <CheckCircleIcon className="mr-2 size-4" aria-hidden="true" />
              {isPending ? "Updating…" : "Mark delivered"}
            </Button>
          )}
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {delivery.orders
          .slice()
          .sort((a, b) => a.stopSequence - b.stopSequence)
          .map((do_) => (
            <li key={do_.orderId} className="border-t border-line pt-4 first:border-0 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-primary">Stop {do_.stopSequence + 1}</p>
                  <p className="mt-1 font-semibold text-ink">{do_.order.subscription.user.name ?? "—"}</p>
                  <p className="mt-1 text-sm text-muted">{do_.order.subscription.user.phone ?? ""}</p>
                  <p className="mt-1 text-xs text-muted">{do_.order.subscription.cratePlan.name} crate</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">₵{do_.order.totalValue}</span>
                  <PhoneIcon className="size-4 text-muted" aria-label="phone" />
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {do_.order.items.map((item) => (
                  <li key={item.produceItem.name} className="flex justify-between text-xs">
                    <span className="text-muted">{item.produceItem.name}</span>
                    <span className="font-mono text-ink">{item.qty} {item.produceItem.unit}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </article>
  );
}
