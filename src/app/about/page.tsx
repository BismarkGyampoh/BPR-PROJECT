import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, CheckBadgeIcon, GlobeAltIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

const farmerImage =
  "https://images.unsplash.com/photo-1662364898263-a4eb1f0626b2?auto=format&fit=crop&w=900&q=85";
const hubImage =
  "https://images.unsplash.com/photo-1594669856727-cbe2472a91a2?auto=format&fit=crop&w=900&q=85";
const deliveryImage =
  "https://images.unsplash.com/photo-1641204883707-ec75fcb1b096?auto=format&fit=crop&w=900&q=85";

const values = [
  {
    title: "Reduced food waste",
    description:
      "We cut in-chain produce loss from 20–50% (the sector average) to under 10% by matching supply to pre-committed subscription demand.",
  },
  {
    title: "Fairer farmer incomes",
    description:
      "By removing 3–4 intermediary layers, more of what you pay flows directly back to the smallholder farmers who grow your food.",
  },
  {
    title: "48-hour freshness",
    description:
      "From harvest to your doorstep in under 48 hours, versus 4–7 days through traditional market chains.",
  },
  {
    title: "Transparent pricing",
    description:
      "One fixed weekly price — no spot-market volatility, no negotiation. Quality is graded A/B/C before packing.",
  },
];

const team = [
  { name: "FreshCrate Operations", role: "Harvest-to-doorstep coordination" },
  { name: "Partner Farmers", role: "Growing exceptional produce across Greater Accra" },
  { name: "Delivery Riders", role: "Route-optimized last-mile delivery" },
];

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-8 sm:space-y-28">
      <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-5">Our story</p>
          <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-primary-deep sm:text-6xl lg:text-7xl">
            Reimagining Ghana&apos;s fresh produce supply chain.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            FreshCrate was born out of a simple observation: Ghana loses approximately US$1.9
            billion worth of fresh produce to post-harvest losses every year, while urban consumers
            in Accra spend hours in markets searching for inconsistent quality at unpredictable
            prices.
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            We set out to reengineer that broken chain — connecting smallholder farmers directly
            to urban households through a subscription model that matches demand to harvest, uses
            digital technology for coordination, and keeps food fresh from farm gate to kitchen
            counter.
          </p>
          <div className="mt-9">
            <Link href="/crates">
              <Button size="lg">
                Pick your crate <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src={hubImage}
            alt="Fresh produce being graded at a packing hub"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="space-y-6">
          <p className="text-sm font-semibold text-primary">The problem we solve</p>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-primary-deep">
            A supply chain that wastes food and farmer income
          </h2>
          <p className="text-muted">
            Today&apos;s fresh produce travels through 3–4 intermediary layers — aggregators,
            wholesalers, market queens, and retail traders — before reaching your plate. Each handoff
            adds time, cost, and spoilage risk without improving quality.
          </p>
          <ul className="space-y-3 text-sm leading-6 text-muted">
            <li>
              <span className="font-semibold text-ink">4–7 days</span> from farm to consumer
            </li>
            <li>
              <span className="font-semibold text-ink">20–50%</span> post-harvest loss rate
            </li>
            <li>
              <span className="font-semibold text-ink">30%</span> of potential farmer income lost
              to inefficiency
            </li>
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src={farmerImage}
            alt="Farmer holding freshly harvested produce"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:order-2">
          <Image
            src={deliveryImage}
            alt="Delivery vehicle on Accra streets with FreshCrate branding"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="lg:order-1">
          <p className="text-sm font-semibold text-primary">The FreshCrate way</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-primary-deep">
            One coordinated process from harvest to door
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            We consolidate sourcing, grading, packing, and delivery into a single digitally
            coordinated flow — driven by subscription demand rather than speculative market sales.
          </p>

          <ol className="mt-8 space-y-5">
            <li className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                1
              </span>
              <p>
                <span className="font-semibold text-ink">Demand forecast</span>
                <span className="text-muted">
                  {" "}
                  Platform aggregates confirmed weekly orders and generates purchase orders to partner farms 5–7 days ahead.
                </span>
              </p>
            </li>
            <li className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                2
              </span>
              <p>
                <span className="font-semibold text-ink">Scheduled harvest</span>
                <span className="text-muted">
                  {" "}
                  Farmers harvest to order; FreshCrate logistics collects directly from the farm gate.
                </span>
              </p>
            </li>
            <li className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                3
              </span>
              <p>
                <span className="font-semibold text-ink">Grading & packing</span>
                <span className="text-muted">
                  {" "}
                  Produce is graded to standard and packed with cold-chain handling at our Accra hub.
                </span>
              </p>
            </li>
            <li className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                4
              </span>
              <p>
                <span className="font-semibold text-ink">Route-optimized delivery</span>
                <span className="text-muted">
                  {" "}
                  Batched by zone and delivered within 48 hours of harvest.
                </span>
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ title, description }) => (
          <div key={title} className="site-panel p-6 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10">
              <CheckBadgeIcon className="size-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
        ))}
      </section>

      <section className="site-panel p-8 sm:p-12">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
          <GlobeAltIcon className="size-8 text-primary" aria-hidden="true" />
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <h2 className="font-display text-3xl font-semibold text-ink">Our reach</h2>
            <p className="mt-2 max-w-2xl text-muted">
              We currently source from partner farms across the Greater Accra Region and deliver
              to households and small restaurants in Accra. As we grow, we&apos;re expanding both our
              farm network and our delivery zones across Ghana.
            </p>
          </div>
        </div>
      </section>

      <section className="site-panel p-8 sm:p-12">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
          <TruckIcon className="size-8 text-primary" aria-hidden="true" />
          <div className="mt-3 sm:ml-4 sm:mt-0">
            <h2 className="font-display text-3xl font-semibold text-ink">Our team</h2>
            <p className="mt-2 max-w-2xl text-muted">
              FreshCrate is built by a team passionate about fixing food systems in Ghana. From
              operations to technology, every role is focused on getting fresh, fairly-sourced
              produce to your door.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <p className="font-semibold text-ink">{member.name}</p>
                  <p className="text-sm text-muted">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
