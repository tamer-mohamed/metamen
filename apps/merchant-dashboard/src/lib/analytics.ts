import type { Piastres } from "@metamen/core";
import type { Order, PaymentState } from "@/types/order";
import { isIncomeCountedState } from "./income-summary";

export type TrendPoint = {
  date: string;
  value: number;
};

export type PaymentStateCount = {
  state: PaymentState;
  count: number;
};

const PAYMENT_STATE_ORDER: PaymentState[] = [
  "authorized",
  "captured",
  "voided",
  "refunded",
];

function sortedByDate(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => a.orderDate.localeCompare(b.orderDate));
}

function cumulativeTrend(
  orders: Order[],
  valueForOrder: (order: Order) => number,
): TrendPoint[] {
  const byDate = new Map<string, number>();

  for (const order of sortedByDate(orders)) {
    const delta = valueForOrder(order);
    byDate.set(order.orderDate, (byDate.get(order.orderDate) ?? 0) + delta);
  }

  let runningTotal = 0;
  return Array.from(byDate.entries()).map(([date, delta]) => {
    runningTotal += delta;
    return { date, value: runningTotal };
  });
}

/** Cumulative income (captured + refunded amounts) over time, in piastres. */
export function getRevenueTrend(orders: Order[]): TrendPoint[] {
  return cumulativeTrend(orders, (order) =>
    isIncomeCountedState(order.paymentState) ? (order.amountInPiastres as Piastres) : 0,
  );
}

/** Cumulative number of orders placed over time, regardless of payment state. */
export function getOrderVolumeTrend(orders: Order[]): TrendPoint[] {
  return cumulativeTrend(orders, () => 1);
}

/** Cumulative number of refunded orders ("returns") over time. */
export function getReturnsTrend(orders: Order[]): TrendPoint[] {
  return cumulativeTrend(orders, (order) =>
    order.paymentState === "refunded" ? 1 : 0,
  );
}

/** Count of orders per payment state, in the fixed authorized/captured/voided/refunded order. */
export function getPaymentStateBreakdown(orders: Order[]): PaymentStateCount[] {
  const counts = new Map<PaymentState, number>();
  for (const order of orders) {
    counts.set(order.paymentState, (counts.get(order.paymentState) ?? 0) + 1);
  }

  return PAYMENT_STATE_ORDER.map((state) => ({
    state,
    count: counts.get(state) ?? 0,
  }));
}

export type RankedEntry = {
  label: string;
  valueInPiastres: number;
};

/** Captured+refunded revenue per product, highest first. */
function getProductRevenueTotals(orders: Order[]): RankedEntry[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    if (!isIncomeCountedState(order.paymentState)) continue;
    totals.set(
      order.productName,
      (totals.get(order.productName) ?? 0) + order.amountInPiastres,
    );
  }

  return Array.from(totals.entries())
    .map(([label, valueInPiastres]) => ({ label, valueInPiastres }))
    .sort((a, b) => b.valueInPiastres - a.valueInPiastres);
}

export type RevenueShareSlice = {
  label: string;
  valueInPiastres: number;
  percent: number;
};

/** Revenue share by product, top N individually plus the rest folded into "Other". */
export function getRevenueShareByProduct(orders: Order[], topN = 5): RevenueShareSlice[] {
  const sorted = getProductRevenueTotals(orders);

  const totalRevenue = sorted.reduce((sum, entry) => sum + entry.valueInPiastres, 0);
  if (totalRevenue === 0) return [];

  const top = sorted.slice(0, topN);
  const rest = sorted.slice(topN);
  const restTotal = rest.reduce((sum, entry) => sum + entry.valueInPiastres, 0);

  const slices: RevenueShareSlice[] = top.map((entry) => ({
    ...entry,
    percent: (entry.valueInPiastres / totalRevenue) * 100,
  }));

  if (restTotal > 0) {
    slices.push({
      label: "Other",
      valueInPiastres: restTotal,
      percent: (restTotal / totalRevenue) * 100,
    });
  }

  return slices;
}
