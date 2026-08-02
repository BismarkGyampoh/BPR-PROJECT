import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import RiderDeliveryCard from "@/components/RiderDeliveryCard";
import { TruckIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function RiderPage() {
  const user = await requireAuth();

  if (user.role !== "DELIVERY") {
    const redirectTo = user.role === "ADMIN" ? "/admin" : "/dashboard";
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }

  const deliveries = await prisma.delivery.findMany({
    where: { driverId: user.id },
    include: {
      orders: {
        orderBy: { stopSequence: "asc" },
        include: {
          order: {
            include: {
              items: { include: { produceItem: true } },
              subscription: {
                include: {
                  cratePlan: { select: { name: true } },
                  user: { select: { name: true, phone: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 pb-8">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Rider dashboard</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-primary-deep">
          Good to see you, {firstName}.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Here are the deliveries assigned to you. Tap through each to update status as you pick up,
          travel, and deliver each crate.
        </p>
      </header>

      {deliveries.length === 0 ? (
        <section className="site-panel flex flex-col items-center gap-4 p-8 text-center sm:p-12">
          <div className="grid size-16 place-items-center rounded-full bg-surface-muted">
            <TruckIcon className="size-8 text-muted" aria-hidden="true" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink">No deliveries assigned</h2>
          <p className="text-sm text-muted">You don&apos;t have any active deliveries. Check back soon.</p>
        </section>
      ) : (
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <RiderDeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      )}
    </div>
  );
}
