import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import CustomizeForm from "@/components/CustomizeForm";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const user = await requireAuth();

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      cratePlan: {
        include: { items: { include: { produceItem: true } } },
      },
      customItems: { include: { produceItem: true } },
    },
  });

  if (!subscription) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">No active subscription found.</p>
      </div>
    );
  }

  const plans = await prisma.cratePlan.findMany({
    where: { isActive: true },
    include: { items: { include: { produceItem: true } } },
    orderBy: { name: "asc" },
  });

  return <CustomizeForm subscription={subscription} plans={plans} />;
}
