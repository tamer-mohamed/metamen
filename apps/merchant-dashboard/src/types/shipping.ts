import type { Piastres } from "@metamen/core";

export type ShippingRateCategory = "shipping" | "return" | "storage";

export type ShippingTier = {
  name: string;
  minOrders: number;
  ratesInPiastresPerOrder: Record<ShippingRateCategory, Piastres>;
};

export type ShippingProviderPlan = {
  provider: string;
  /** Ascending by minOrders; the first tier's minOrders must be 0. */
  tiers: ShippingTier[];
};
