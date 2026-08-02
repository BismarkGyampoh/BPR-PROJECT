import { EnvelopeIcon, MapPinIcon, PhoneIcon, ClockIcon } from "@heroicons/react/24/outline";

const contactMethods = [
  {
    label: "Email",
    value: "hello@freshcrate.com",
    icon: EnvelopeIcon,
    href: "mailto:hello@freshcrate.com",
  },
  {
    label: "Phone",
    value: "+233 20 000 0000",
    icon: PhoneIcon,
    href: "tel:+233200000000",
  },
  {
    label: "Address",
    value: "Accra, Ghana",
    icon: MapPinIcon,
    href: null,
  },
  {
    label: "Hours",
    value: "Mon–Fri 8AM–6PM, Sat 9AM–1PM",
    icon: ClockIcon,
    href: null,
  },
];

const faqs = [
  {
    q: "How often is my crate delivered?",
    a: "Crates are delivered weekly by default. You can switch to bi-weekly delivery at any time from your dashboard.",
  },
  {
    q: "Can I skip a week?",
    a: "Yes — pause your subscription from your dashboard at least 24 hours before your next scheduled delivery.",
  },
  {
    q: "Can I change what's in my crate?",
    a: "Absolutely. Use the Customize page to swap items, change quantities, or set items to skip before your next cycle.",
  },
  {
    q: "What if an item is out of season?",
    a: "Our system automatically substitutes seasonal alternatives and notifies you before each harvest window.",
  },
  {
    q: "How do I pay?",
    a: "We accept MTN Mobile Money and card payments. Your subscription renews automatically on your chosen cycle.",
  },
  {
    q: "Do you deliver to my area?",
    a: "We currently deliver across Greater Accra. Enter your address at checkout to confirm coverage in your zone.",
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-16 pb-8 sm:space-y-24">
      <section className="grid gap-10 lg:grid-cols[2fr_1fr] lg:items-start lg:gap-16">
        <div>
          <p className="eyebrow mb-5">Get in touch</p>
          <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-primary-deep sm:text-6xl">
            We&apos;re here to help.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            Have a question about your subscription, delivery, or produce quality? Reach out through
            any of the channels below and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
        <div className="grid gap-3">
          {contactMethods.map(({ label, value, icon: Icon, href }) => (
            <div key={label} className="site-panel flex items-start gap-4 p-4 sm:p-5">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-ink">{label}</p>
                {href ? (
                  <a href={href} className="mt-1 block text-sm text-primary hover:text-primary-deep">
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-muted">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-semibold text-ink">Frequently asked questions</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {faqs.map(({ q, a }) => (
            <div key={q} className="site-panel p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{q}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-panel p-6 sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Send us a message</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-primary-deep">
            Drop us a line
          </h2>
          <p className="mt-4 text-sm text-muted">
            Fill out the form below and we&apos;ll respond within one business day.
          </p>
          <form className="mt-8 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Full name" required className="input" />
              <input type="email" placeholder="Email address" required className="input" />
            </div>
            <input type="tel" placeholder="Phone number" className="input" />
            <textarea
              rows={5}
              placeholder="How can we help you?"
              required
              className="input resize-y"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-primary-deep"
            >
              Send message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
