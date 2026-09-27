import type { ShippingTier } from "@/types/shipping";

export type TierProgress = {
  currentTier: ShippingTier;
  nextTier: ShippingTier | undefined;
  ordersIntoTier: number;
  ordersRequiredForNextTier: number;
  progressPercent: number;
};

export function getCurrentTier(tiers: ShippingTier[], orderCount: number): ShippingTier {
  const sorted = [...tiers].sort((a, b) => a.minOrders - b.minOrders);
  return (
    [...sorted].reverse().find((tier) => orderCount >= tier.minOrders) ?? sorted[0]
  );
}

export function getTierProgress(tiers: ShippingTier[], orderCount: number): TierProgress {
  const sorted = [...tiers].sort((a, b) => a.minOrders - b.minOrders);
  const currentTier = getCurrentTier(sorted, orderCount);
  const nextTier = sorted.find((tier) => tier.minOrders > currentTier.minOrders);

  if (!nextTier) {
    return {
      currentTier,
      nextTier: undefined,
      ordersIntoTier: orderCount - currentTier.minOrders,
      ordersRequiredForNextTier: 0,
      progressPercent: 100,
    };
  }

  const ordersIntoTier = orderCount - currentTier.minOrders;
  const ordersRequiredForNextTier = nextTier.minOrders - currentTier.minOrders;
  const progressPercent = Math.min(
    100,
    Math.round((ordersIntoTier / ordersRequiredForNextTier) * 100),
  );

  return {
    currentTier,
    nextTier,
    ordersIntoTier,
    ordersRequiredForNextTier,
    progressPercent,
  };
}

export function currentTotalRateInPiastres(tiers: ShippingTier[], orderCount: number): number {
  const { currentTier } = getTierProgress(tiers, orderCount);
  return (
    currentTier.ratesInPiastresPerOrder.shipping +
    currentTier.ratesInPiastresPerOrder.return +
    currentTier.ratesInPiastresPerOrder.storage
  );
}
