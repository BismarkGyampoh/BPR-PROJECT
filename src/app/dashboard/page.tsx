import Link from "next/link";
import { ArrowUpRightIcon, CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { GHS } from "@/lib/utils";
import SubscriptionControls from "@/components/SubscriptionControls";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [subscription, orders] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { cratePlan: true },
    }),
    prisma.order.findMany({
      where: { subscription: { userId: user.id } },
      include: { subscription: { include: { cratePlan: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const nextDelivery = orders.find((o) => o.status !== "DELIVERED" && o.status !== "CANCELED") ?? orders[0];
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-10 pb-8">
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your FreshCrate</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-primary-deep">Good to see you, {firstName}.</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">Your next box of just-harvested produce, sorted and timed for your week.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/customize" className="inline-flex items-center self-start rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary sm:self-auto">Customize items <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" /></Link>
          <Link href="/crates" className="inline-flex items-center self-start rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary sm:self-auto">Change crate plan <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" /></Link>
        </div>
      </header>

      {subscription ? (
        <section className="grid overflow-hidden rounded-[2rem] bg-primary-deep text-white shadow-md lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Your active plan</p>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">{subscription.cratePlan.name} crate</h2>
              </div>
              <span className={`status-pill ${subscription.status === "ACTIVE" ? "bg-white/15 text-white" : "bg-amber-100 text-amber-800"}`}>
                <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> {subscription.status}
              </span>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70">{subscription.cratePlan.description}</p>
            <div className="mt-8 grid gap-4 border-t border-white/15 pt-5 text-sm sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.14em] text-white/45">Billing</p><p className="mt-1 font-semibold">{subscription.frequency.toLowerCase()} · {GHS.format(subscription.cratePlan.basePrice)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.14em] text-white/45">Next cycle</p><p className="mt-1 font-semibold">{new Date(subscription.nextBillingAt).toLocaleDateString("en-GB")}</p></div>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-white/10 p-6 sm:p-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Delivery address</p>
              {subscription.deliveryAddress && typeof subscription.deliveryAddress === "object" && (
                <div className="mt-3 flex items-start gap-3 text-sm leading-6 text-white/80"><MapPinIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" /><span>{(subscription.deliveryAddress as { area?: string; line1?: string }).line1 ?? ""}<br />{(subscription.deliveryAddress as { area?: string }).area ?? "—"}</span></div>
              )}
            </div>
             <p className="mt-8 text-sm text-white/60">Need to change something? Update it before your next cycle.</p>
            <SubscriptionControls subscriptionId={subscription.id} status={subscription.status} />
          </div>
        </section>
      ) : (
        <section className="site-panel flex flex-col items-start gap-4 p-7 sm:p-9">
          <p className="eyebrow">Start your weekly ritual</p>
          <h2 className="font-display text-3xl font-semibold text-primary-deep">You have no active subscription yet.</h2>
          <Link href="/crates" className="inline-flex items-center font-semibold text-primary hover:text-primary-deep">Pick a crate <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" /></Link>
        </section>
      )}

      {nextDelivery && (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.5fr]">
          <div className="site-panel p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="eyebrow">Next delivery</p><h2 className="mt-2 font-display text-3xl font-semibold text-ink">Your crate is on its way.</h2></div>
              <CalendarDaysIcon className="size-7 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5 text-sm">
              <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Scheduled</p><p className="mt-1 font-semibold text-ink">{new Date(nextDelivery.scheduledDate).toLocaleString("en-GB")}</p></div>
              <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Order value</p><p className="mt-1 font-mono font-semibold text-primary">{GHS.format(nextDelivery.totalValue)}</p></div>
            </div>
            <Link href={`/track/${nextDelivery.id}`} className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-deep">Track this order <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" /></Link>
          </div>
          <div className="rounded-3xl bg-accent p-6 text-primary-deep sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em]">The FreshCrate promise</p><p className="mt-4 font-display text-2xl font-semibold leading-tight">Harvested to order. Graded before packing. Delivered within 48 hours.</p></div>
        </section>
      )}

      <section aria-labelledby="recent-orders">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-4"><div><p className="eyebrow">Your history</p><h2 id="recent-orders" className="mt-2 font-display text-3xl font-semibold text-ink">Recent orders</h2></div><span className="font-mono text-xs text-muted">{orders.length.toString().padStart(2, "0")} orders</span></div>
        <div className="divide-y divide-line">
          {orders.map((order) => (
            <Link key={order.id} href={`/track/${order.id}`} className="group flex flex-wrap items-center justify-between gap-4 py-5 transition-colors hover:bg-surface-muted/60 sm:px-3">
              <div className="min-w-0"><p className="font-mono text-sm font-semibold text-ink">#{order.id.slice(0, 8)}</p><p className="mt-1 text-sm text-muted">{new Date(order.scheduledDate).toLocaleDateString("en-GB")} · {order.subscription.cratePlan.name}</p></div>
              <div className="flex items-center gap-4"><span className={`status-pill ${order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{order.status}</span><span className="font-mono text-sm font-semibold text-ink">{GHS.format(order.totalValue)}</span><ArrowUpRightIcon className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div>
            </Link>
          ))}
          {orders.length === 0 && <div className="py-8 text-sm text-muted">No orders yet. Your first crate will show up here.</div>}
        </div>
      </section>
    </div>
  );
}
