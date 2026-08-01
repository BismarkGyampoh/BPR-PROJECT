import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-8 text-sm text-muted sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-2xl space-y-1.5">
          <p className="font-semibold text-ink">
            FreshCrate <span className="mx-1 text-accent" aria-hidden="true">·</span> Farm-fresh produce delivered within 48h of harvest <span className="mx-1 text-accent" aria-hidden="true">·</span> Greater Accra
          </p>
          <p>
            Reducing post-harvest loss by connecting smallholder farmers directly to urban households.
          </p>
        </div>
        <Link href="/crates" className="font-semibold text-primary transition-colors hover:text-primary-deep">
          Find your weekly crate <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </footer>
  );
}
