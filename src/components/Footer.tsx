import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/crates", label: "Crate Plans" },
  { href: "/contact", label: "Contact" },
  { href: "/contact", label: "FAQs" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 border-b border-line pb-8 sm:grid-cols-2 sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <p className="font-semibold text-ink">
              FreshCrate <span className="mx-1 text-accent" aria-hidden="true">·</span> Farm-fresh produce delivered within 48h of harvest <span className="mx-1 text-accent" aria-hidden="true">·</span> Greater Accra
            </p>
            <p>
              Reducing post-harvest loss by connecting smallholder farmers directly to urban households.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="font-semibold text-muted transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} FreshCrate. All rights reserved.</p>
          <Link href="/crates" className="font-semibold text-primary transition-colors hover:text-primary-deep">
            Find your weekly crate <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
