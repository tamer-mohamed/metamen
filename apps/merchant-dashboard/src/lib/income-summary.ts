import type { Piastres } from "@metamen/core";
import type { Order, PaymentState } from "@/types/order";

const INCOME_COUNTED_STATES: ReadonlySet<PaymentState> = new Set([
  "captured",
  "refunded",
]);

export function isIncomeCountedState(state: PaymentState): boolean {
  return INCOME_COUNTED_STATES.has(state);
}

export function getIncomeSummaryInPiastres(orders: Order[]): Piastres {
  return orders
    .filter((order) => isIncomeCountedState(order.paymentState))
    .reduce((total, order) => total + order.amountInPiastres, 0);
}
