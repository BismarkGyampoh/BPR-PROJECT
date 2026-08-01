import { ArrowLeftIcon, CheckIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import PaymentStatus from "@/components/PaymentStatus";
import { GHS } from "@/lib/utils";
import { redirect } from "next/navigation";

const STEPS: Array<{ key: string; label: string }> = [
  { key: "PENDING", label: "Order placed" },
  { key: "PICKED", label: "Harvested" },
  { key: "PACKED", label: "Packed at hub" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default async function TrackPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await requireAuth();
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      subscription: { include: { cratePlan: true, user: { select: { name: true, phone: true } } } },
      items: { include: { produceItem: true } },
      payments: true,
      deliveries: { include: { delivery: true } },
    },
  });
  if (!order) return <p className="py-16 text-muted">Order not found.</p>;
  if (order.subscription.userId !== user.id && user.role !== "ADMIN") redirect("/dashboard");

  const stepIndex = STEPS.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-muted transition-colors hover:text-primary"><ArrowLeftIcon className="mr-2 size-4" aria-hidden="true" /> Back to dashboard</Link>
      <header className="flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Order tracking</p><h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-primary-deep">#{order.id.slice(0, 8)}</h1><p className="mt-2 text-sm text-muted">{order.subscription.cratePlan.name} · scheduled for {new Date(order.scheduledDate).toLocaleString("en-GB")}</p></div>
        <div className="sm:text-right"><p className="font-mono text-2xl font-semibold text-ink">{GHS.format(order.totalValue)}</p><span className={`status-pill mt-2 ${isDelivered ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{order.status}</span></div>
      </header>

      <section className="site-panel p-6 sm:p-8" aria-labelledby="progress-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Freshness in motion</p><h2 id="progress-heading" className="mt-2 font-display text-3xl font-semibold text-ink">Your crate&apos;s journey</h2></div><PaymentStatus paymentId={order.payments[0]?.id ?? ""} /></div>
        <div className="mt-8 overflow-x-auto pb-2"><ol className="relative flex min-w-[680px] items-start justify-between before:absolute before:left-6 before:right-6 before:top-6 before:h-px before:bg-line">
          {STEPS.map((step, index) => {
            const done = index <= stepIndex;
            return <li key={step.key} className="relative z-10 flex w-32 flex-col items-center text-center"><span className={`grid size-12 place-items-center rounded-full border-4 border-surface font-mono text-xs font-semibold ${done ? "bg-primary text-white" : "bg-surface-muted text-muted"}`}>{done ? <CheckIcon className="size-5" aria-hidden="true" /> : index + 1}</span><span className={`mt-3 text-xs font-semibold ${done ? "text-primary-deep" : "text-muted"}`}>{step.label}</span></li>;
          })}
        </ol></div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.6fr]">
        <section className="site-panel overflow-hidden" aria-labelledby="contents-heading"><div className="border-b border-line px-6 py-5 sm:px-7"><p className="eyebrow">Packed for you</p><h2 id="contents-heading" className="mt-2 font-display text-2xl font-semibold text-ink">Crate contents</h2></div><ul className="divide-y divide-line px-6 sm:px-7">{order.items.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm"><span className="font-semibold text-ink">{item.produceItem.name}</span><span className="font-mono text-muted">{item.qty} {item.produceItem.unit}</span></li>)}</ul></section>
        {order.deliveries?.[0]?.delivery && <section className="rounded-3xl bg-primary-deep p-6 text-white sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Delivery detail</p><div className="mt-5 flex items-start gap-3"><MapPinIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" /><div><p className="font-display text-2xl font-semibold">{order.deliveries[0].delivery.status}</p><p className="mt-2 text-sm text-white/70">Zone: {order.deliveries[0].delivery.zone}</p></div></div></section>}
      </div>
    </div>
  );
}
