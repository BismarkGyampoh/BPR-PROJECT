"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { GHS } from "@/lib/utils";

interface PaymentState {
  status?: string;
  amount?: number;
  [k: string]: unknown;
}

export default function PaymentStatus({ paymentId }: { paymentId: string }) {
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [loading, setLoading] = useState(true);

  const poll = async () => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, { cache: "no-store" });
      const data = await res.json();
      setPayment(data);
    } catch {
      // keep polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    poll();
    const t = setInterval(() => {
      if (payment?.status === "SUCCESS" || payment?.status === "FAILED") return;
      poll();
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, paymentId]);

  if (loading || !payment) return <p className="inline-flex items-center gap-2 text-xs text-muted"><ClockIcon className="size-4" aria-hidden="true" /> Checking payment status…</p>;

  const status = payment.status ?? "PENDING";
  const isSuccess = status === "SUCCESS";
  const isFailed = status === "FAILED";
  const badge = isSuccess ? "bg-emerald-100 text-emerald-800" : isFailed ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
  const Icon = isSuccess ? CheckCircleIcon : isFailed ? ExclamationCircleIcon : ClockIcon;

  return (
    <div className="text-right text-xs">
      <span className={`status-pill ${badge}`}><Icon className="size-3.5" aria-hidden="true" />{status === "PENDING" ? "Pending — complete your MoMo payment" : isSuccess ? "Paid" : "Failed"}</span>
      {isSuccess && typeof payment.amount === "number" && <span className="mt-1 block text-muted">{GHS.format(payment.amount)} paid</span>}
      {isFailed && <span className="mt-1 block text-red-600">Retry at checkout.</span>}
    </div>
  );
}
