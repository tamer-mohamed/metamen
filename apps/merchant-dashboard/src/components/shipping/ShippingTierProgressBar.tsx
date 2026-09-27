import type { TierProgress } from "@/lib/shipping-tiers";
import { NextTierPreview } from "./NextTierPreview";

export function ShippingTierProgressBar({
  currentTier,
  nextTier,
  ordersIntoTier,
  ordersRequiredForNextTier,
  progressPercent,
}: TierProgress) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <span className="font-medium">{currentTier.name} tier</span>
        <NextTierPreview
          label={
            nextTier
              ? `${ordersIntoTier} of ${ordersRequiredForNextTier} orders to ${nextTier.name}`
              : "Highest tier reached"
          }
          nextTier={nextTier}
        />
      </div>
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--meter-track)]"
      >
        <div
          className="h-full rounded-full bg-[var(--meter-fill)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
