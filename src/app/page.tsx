import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

const heroImage =
  "https://images.unsplash.com/photo-1694957932193-576ddb4cf4f9?auto=format&fit=crop&w=1600&q=85";
const farmerImage =
  "https://images.unsplash.com/photo-1662364898263-a4eb1f0626b2?auto=format&fit=crop&w=900&q=85";
const deliveryImage =
  "https://images.unsplash.com/photo-1641204883707-ec75fcb1b096?auto=format&fit=crop&w=900&q=85";

const benefits = [
  {
    title: "Within 48 hours",
    description:
      "From farm gate to your kitchen counter. The traditional market chain takes 4–7 days; FreshCrate cuts it to under 48 hours.",
  },
  {
    title: "Less waste, more farm income",
    description:
      "Subscription demand is matched to farm supply. We aim to cut in-chain produce loss from 20–50% to under 10% and raise partner-farm incomes.",
  },
  {
    title: "Transparent, consistent pricing",
    description:
      "One fixed weekly price. No spot-market volatility, no price negotiation. Quality is graded A/B/C before packing.",
  },
  {
    title: "Pay with Mobile Money",
    description:
      "Auto-billing via MTN Mobile Money (and card) on your subscription cycle. Cashless, traceable, convenient.",
  },
];

const steps = [
  { n: "01", title: "Choose a crate", desc: "Small, Family, Premium, or Restaurant." },
  { n: "02", title: "Customize", desc: "Swap or add seasonal produce you love (or skip what you don't)." },
  { n: "03", title: "We harvest + pack", desc: "Farms harvest to order; our hub grades and packs your crate." },
  { n: "04", title: "Doorstep delivery", desc: "Route-optimized delivery within 48h of harvest." },
];

export default function Home() {
  return (
    <div className="space-y-20 pb-8 sm:space-y-28">
      <section className="grid items-stretch gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
        <div className="flex flex-col justify-center py-8 sm:py-14 lg:py-20">
          <p className="eyebrow mb-5">Fresh food, on a better rhythm</p>
          <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-primary-deep sm:text-6xl lg:text-7xl">
            Farm-fresh produce. <span className="text-ink">Delivered like clockwork.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
            A weekly subscription of seasonal fruit and vegetables, sourced directly from smallholder
            farms in the Greater Accra Region and delivered to your door within 48 hours of harvest —
            no markets, no negotiation, no surprises.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/crates">
              <Button size="lg">
                Pick your crate <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">Create an account</Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            <span>Harvested to order</span>
            <span className="size-1 rounded-full bg-accent" aria-hidden="true" />
            <span>Greater Accra delivery</span>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] bg-primary-deep shadow-lg sm:min-h-[620px] lg:min-h-[700px]">
          <img
            src={heroImage}
            alt="Vibrant tomatoes, peppers and greens photographed by Marion Mesbah on Unsplash"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/80 via-primary-deep/10 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-8 sm:bottom-8">
            <div className="max-w-xs text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">The weekly ritual</p>
              <p className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                Better produce starts with a better supply chain.
              </p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-primary-deep shadow-md" aria-hidden="true">
              <ArrowUpRightIcon className="size-5" />
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="benefits-heading" className="border-y border-line py-7 sm:py-9">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="benefits-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              The good stuff, made simple.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">Reliable freshness for your week, with more value reaching the farms that grow it.</p>
        </div>
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {benefits.map(({ title, description }) => (
            <article key={title} className="border-l border-line pl-4 first:border-l-0 first:pl-0 lg:first:border-l lg:first:pl-4">
              <span className="block h-px w-8 bg-accent" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-heading" className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-primary">From farm gate to front door</p>
          <h2 id="how-heading" className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight tracking-[-0.04em] text-primary-deep sm:text-5xl">
            How it works
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted">
            A calmer way to shop for fresh produce — with the timing, quality, and price decided upfront.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <img
              src={farmerImage}
              alt="Farmer holding a produce crate photographed by George Dagerotip on Unsplash"
              className="h-36 w-full rounded-2xl object-cover sm:h-44"
            />
            <img
              src={deliveryImage}
              alt="Delivery van parked on a street photographed by Yehor Tulinov on Unsplash"
              className="mt-6 h-36 w-full rounded-2xl object-cover sm:h-44"
            />
          </div>
        </div>
        <ol className="relative space-y-0 before:absolute before:bottom-8 before:left-[1.35rem] before:top-8 before:w-px before:bg-line">
          {steps.map((step) => (
            <li key={step.n} className="relative grid grid-cols-[3rem_1fr] gap-5 py-5 first:pt-0 last:pb-0 sm:grid-cols-[4rem_1fr] sm:gap-6">
              <span className="relative z-10 grid size-11 place-items-center rounded-full border border-primary/20 bg-canvas font-mono text-xs font-semibold text-primary sm:size-12">
                {step.n}
              </span>
              <div className="border-b border-line pb-6 last:border-0">
                <h3 className="font-display text-2xl font-semibold leading-tight text-ink">{step.title}</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[2rem] bg-primary-deep px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Ready when you are</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Choose once. Eat well all week.
          </h2>
        </div>
        <Link href="/crates" className="mt-7 inline-flex shrink-0 items-center font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-accent lg:mt-0">
          See this week&apos;s crates <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
