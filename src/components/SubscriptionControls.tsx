"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PauseIcon, PlayIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import type { SubscriptionStatus } from "@prisma/client";

interface SubscriptionControlsProps {
  subscriptionId: string;
  status: SubscriptionStatus;
}

export default function SubscriptionControls({ subscriptionId, status }: SubscriptionControlsProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const updateStatus = (action: "PAUSE" | "RESUME" | "CANCEL") => {
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update subscription");
      } else {
        setCurrentStatus(data.status);
      }
    });
  };

  const isPaused = currentStatus === "PAUSED";
  const isCanceled = currentStatus === "CANCELED";

  if (isCanceled) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-surface-muted p-4 text-sm text-muted">
        <p className="font-semibold text-ink">Subscription canceled</p>
        <p className="mt-1">Your subscription has been canceled. You can resubscribe at any time from the crates page.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {error && (
        <p role="alert" className="w-full text-sm text-red-700">
          {error}
        </p>
      )}
      {isPaused ? (
        <>
          <Button size="sm" variant="outline" onClick={() => updateStatus("RESUME")} disabled={isPending}>
            <PlayIcon className="mr-2 size-4" aria-hidden="true" />
            {isPending ? "Resuming…" : "Resume subscription"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => updateStatus("CANCEL")} disabled={isPending}>
            <XCircleIcon className="mr-2 size-4" aria-hidden="true" />
            {isPending ? "Canceling…" : "Cancel subscription"}
          </Button>
        </>
      ) : (
        <>
          <Button size="sm" variant="outline" onClick={() => updateStatus("PAUSE")} disabled={isPending}>
            <PauseIcon className="mr-2 size-4" aria-hidden="true" />
            {isPending ? "Pausing…" : "Pause subscription"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => updateStatus("CANCEL")} disabled={isPending}>
            <XCircleIcon className="mr-2 size-4" aria-hidden="true" />
            {isPending ? "Canceling…" : "Cancel subscription"}
          </Button>
        </>
      )}
      <Link href="/customize" className="text-sm font-semibold text-primary hover:text-primary-deep">
        Customize items instead
      </Link>
    </div>
  );
}
