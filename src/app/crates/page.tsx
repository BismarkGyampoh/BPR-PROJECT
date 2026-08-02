import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import CrateCard from "@/components/CrateCard";

export default async function CratesPage() {
  const plans = await prisma.cratePlan.findMany({
    where: { isActive: true },
    include: { items: { include: { produceItem: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-12 pb-8">
      <section className="grid gap-7 border-b border-line pb-10 lg:grid-cols-[1fr_0.55fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">A better weekly shop</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-primary-deep sm:text-6xl">
            Choose your crate.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            All crates are delivered weekly within 48h of harvest. Swap, add, or skip items in checkout.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-surface-muted p-4 text-sm leading-6 text-muted">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <p><span className="font-semibold text-ink">One fixed weekly price.</span> Fresh supply is matched to farm demand before harvest.</p>
        </div>
      </section>

      {plans.length === 0 ? (
        <div className="site-panel flex flex-col items-start gap-3 p-8">
          <p className="eyebrow">Coming soon</p>
          <p className="font-display text-2xl font-semibold text-ink">No crate plans available yet.</p>
          <p className="text-sm text-muted">Check back soon for the next harvest window.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <CrateCard key={plan.id} plan={plan} featured={index === 1} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-7 text-sm text-muted">
        <p>Not a member yet? Create your account before checkout.</p>
        <Link href="/register" className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary-deep">
          Create an account <ArrowUpRightIcon className="ml-1.5 size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
