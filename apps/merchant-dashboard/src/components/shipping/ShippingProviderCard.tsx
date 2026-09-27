import { formatPiastres } from "@metamen/core";
import type { ShippingProviderPlan } from "@/types/shipping";
import { getTierProgress } from "@/lib/shipping-tiers";
import { ShippingTierProgressBar } from "./ShippingTierProgressBar";

export function ShippingProviderCard({
  plan,
  orderCount,
  isBestValue,
}: {
  plan: ShippingProviderPlan;
  orderCount: number;
  isBestValue: boolean;
}) {
  const tierProgress = getTierProgress(plan.tiers, orderCount);
  const { currentTier } = tierProgress;

  return (
    <div className="flex flex-col gap-3 border-b border-black/10 py-4 last:border-b-0 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{plan.provider}</span>
        {isBestValue && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
            Best value at your volume
          </span>
        )}
      </div>

      <ShippingTierProgressBar {...tierProgress} />

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-black/60 dark:text-white/60">Shipping</dt>
          <dd className="font-medium">
            {formatPiastres(currentTier.ratesInPiastresPerOrder.shipping)}{" "}
            <span className="text-xs font-normal text-black/50 dark:text-white/50">
              /order
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-black/60 dark:text-white/60">Return</dt>
          <dd className="font-medium">
            {formatPiastres(currentTier.ratesInPiastresPerOrder.return)}{" "}
            <span className="text-xs font-normal text-black/50 dark:text-white/50">
              /order
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-black/60 dark:text-white/60">Storage</dt>
          <dd className="font-medium">
            {formatPiastres(currentTier.ratesInPiastresPerOrder.storage)}{" "}
            <span className="text-xs font-normal text-black/50 dark:text-white/50">
              /order
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
