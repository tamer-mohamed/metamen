import type { ShippingProviderPlan } from "@/types/shipping";

export const shippingPlans: ShippingProviderPlan[] = [
  {
    provider: "Bosta",
    tiers: [
      {
        name: "Starter",
        minOrders: 0,
        ratesInPiastresPerOrder: { shipping: 6000, return: 4000, storage: 500 },
      },
      {
        name: "Growth",
        minOrders: 20,
        ratesInPiastresPerOrder: { shipping: 5400, return: 3600, storage: 450 },
      },
      {
        name: "Scale",
        minOrders: 100,
        ratesInPiastresPerOrder: { shipping: 4800, return: 3200, storage: 400 },
      },
    ],
  },
  {
    provider: "J&T Express",
    tiers: [
      {
        name: "Starter",
        minOrders: 0,
        ratesInPiastresPerOrder: { shipping: 5500, return: 3800, storage: 450 },
      },
      {
        name: "Growth",
        minOrders: 20,
        ratesInPiastresPerOrder: { shipping: 5000, return: 3400, storage: 400 },
      },
      {
        name: "Scale",
        minOrders: 100,
        ratesInPiastresPerOrder: { shipping: 4500, return: 3000, storage: 350 },
      },
    ],
  },
  {
    provider: "Mylerz",
    tiers: [
      {
        name: "Starter",
        minOrders: 0,
        ratesInPiastresPerOrder: { shipping: 7200, return: 5000, storage: 600 },
      },
      {
        name: "Growth",
        minOrders: 20,
        ratesInPiastresPerOrder: { shipping: 6500, return: 4500, storage: 550 },
      },
      {
        name: "Scale",
        minOrders: 100,
        ratesInPiastresPerOrder: { shipping: 5800, return: 4000, storage: 500 },
      },
    ],
  },
  {
    provider: "Aramex",
    tiers: [
      {
        name: "Starter",
        minOrders: 0,
        ratesInPiastresPerOrder: { shipping: 8500, return: 6000, storage: 700 },
      },
      {
        name: "Growth",
        minOrders: 20,
        ratesInPiastresPerOrder: { shipping: 7800, return: 5400, storage: 650 },
      },
      {
        name: "Scale",
        minOrders: 100,
        ratesInPiastresPerOrder: { shipping: 7000, return: 4800, storage: 600 },
      },
    ],
  },
  {
    provider: "Fetchr",
    tiers: [
      {
        name: "Starter",
        minOrders: 0,
        ratesInPiastresPerOrder: { shipping: 9000, return: 6500, storage: 750 },
      },
      {
        name: "Growth",
        minOrders: 20,
        ratesInPiastresPerOrder: { shipping: 8200, return: 5900, storage: 700 },
      },
      {
        name: "Scale",
        minOrders: 100,
        ratesInPiastresPerOrder: { shipping: 7500, return: 5300, storage: 650 },
      },
    ],
  },
];
