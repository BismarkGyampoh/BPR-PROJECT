import type { CratePlan, CrateItem } from "@prisma/client";
import Link from "next/link";
import { ArrowUpRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

type PlanWithItems = CratePlan & {
  items: (CrateItem & { produceItem: { id: string; name: string; unit: string; unitPrice: number; imageUrl: string | null } })[];
};

const fallbackImages = {
  family: "https://images.unsplash.com/photo-1701796893978-f0af0ca1b0a8?auto=format&fit=crop&w=900&q=85",
  premium: "https://images.unsplash.com/photo-1710600516542-3725023333e7?auto=format&fit=crop&w=900&q=85",
  restaurant: "https://images.unsplash.com/photo-1594669856727-cbe24f54f704?auto=format&fit=crop&w=900&q=85",
  small: "https://images.unsplash.com/photo-1631209121750-a9f656d28f46?auto=format&fit=crop&w=900&q=85",
  default: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=900&q=85",
};

export default function CrateCard({ plan, featured = false }: { plan: PlanWithItems; featured?: boolean }) {
  const price = new Intl.NumberFormat("en-GH", { style: "currency", currency: plan.currency }).format(plan.basePrice);
  const firstImg = plan.items.find((item) => item.produceItem.imageUrl)?.produceItem.imageUrl;
  const nameKey = plan.name.toLowerCase() as keyof typeof fallbackImages;
  const image = firstImg || fallbackImages[nameKey] || fallbackImages.default;

  return (
    <article className={clsx("group flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", featured ? "border-primary/45 shadow-md" : "border-line shadow-xs")}>
      <div className="relative aspect-[1.2] overflow-hidden bg-surface-muted">
        <img
          src={image}
          alt={`${plan.name} crate produce photographed for FreshCrate`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          {featured ? (
            <span className="rounded-full bg-accent px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary-deep">Most popular</span>
          ) : <span />}
          <span className="rounded-full bg-white/90 px-3 py-1 font-mono text-[0.68rem] font-semibold text-primary-deep backdrop-blur-sm">48h fresh</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold leading-tight text-ink">{plan.name}</h2>
          <p className="shrink-0 font-mono text-lg font-semibold text-primary">{price}</p>
        </div>
        <p className="mt-3 min-h-12 text-sm leading-6 text-muted">{plan.description}</p>
        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
          <CheckIcon className="size-4 text-primary" aria-hidden="true" />
          Up to {plan.maxItems} item types
        </div>
        <Link
          href={`/checkout?plan=${plan.id}`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-deep focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-primary/25"
        >
          Choose crate <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
