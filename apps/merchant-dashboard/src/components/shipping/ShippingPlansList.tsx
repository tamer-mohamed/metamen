import type { ShippingProviderPlan } from "@/types/shipping";
import { currentTotalRateInPiastres } from "@/lib/shipping-tiers";
import { ShippingProviderCard } from "./ShippingProviderCard";

export function ShippingPlansList({
  plans,
  orderCount,
}: {
  plans: ShippingProviderPlan[];
  orderCount: number;
}) {
  if (plans.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        No shipping plans available.
      </p>
    );
  }

  const lowestTotalRate = Math.min(
    ...plans.map((plan) => currentTotalRateInPiastres(plan.tiers, orderCount)),
  );

  const sortedPlans = [...plans].sort(
    (a, b) =>
      currentTotalRateInPiastres(a.tiers, orderCount) -
      currentTotalRateInPiastres(b.tiers, orderCount),
  );

  return (
    <div className="rounded-md border border-black/10 px-4 dark:border-white/10">
      {sortedPlans.map((plan) => (
        <ShippingProviderCard
          key={plan.provider}
          plan={plan}
          orderCount={orderCount}
          isBestValue={
            currentTotalRateInPiastres(plan.tiers, orderCount) === lowestTotalRate
          }
        />
      ))}
    </div>
  );
}
