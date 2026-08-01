import type { ReactNode } from "react";

const authImage =
  "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=1200&q=85";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-11rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-surface shadow-sm md:grid-cols-[0.8fr_1.2fr]">
      <div className="relative hidden min-h-[620px] overflow-hidden bg-primary-deep md:block">
        <img
          src={authImage}
          alt="Fresh vegetables arranged for delivery, photographed by Randy Fath on Unsplash"
          className="absolute inset-0 size-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/20 to-transparent" />
        <div className="absolute inset-x-8 bottom-9 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Fresh food, on a better rhythm</p>
          <p className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight">From smallholder farms to your kitchen in Accra.</p>
        </div>
      </div>
      <div className="flex min-h-[620px] items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
