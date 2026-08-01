import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const user = await requireAuth();
  const sp = await searchParams;
  const planId = sp?.plan;

  if (!planId) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-16">
        <p className="eyebrow">Checkout</p>
        <h1 className="font-display text-4xl font-semibold text-primary-deep">No crate selected.</h1>
        <Link href="/crates" className="inline-flex items-center font-semibold text-primary hover:text-primary-deep"><ArrowLeftIcon className="mr-2 size-4" aria-hidden="true" /> Browse crates</Link>
      </div>
    );
  }

  const plan = await prisma.cratePlan.findUnique({
    where: { id: planId },
    include: { items: { include: { produceItem: true } } },
  });
  if (!plan) return <p className="py-16 text-muted">Crate not found.</p>;

  return <CheckoutForm plan={plan} user={user} />;
}
