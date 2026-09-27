import type { Order, PaymentState } from "@/types/order";

export type OrderFilters = {
  from?: string;
  to?: string;
  product?: string;
  state?: PaymentState;
};

export function getUniqueProductNames(orders: Order[]): string[] {
  return Array.from(new Set(orders.map((order) => order.productName))).sort();
}

export function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  return orders.filter((order) => {
    if (filters.from && order.orderDate < filters.from) return false;
    if (filters.to && order.orderDate > filters.to) return false;
    if (filters.product && order.productName !== filters.product) return false;
    if (filters.state && order.paymentState !== filters.state) return false;
    return true;
  });
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_PAYMENT_STATES: readonly string[] = [
  "authorized",
  "captured",
  "voided",
  "refunded",
];

export function parseOrderFilters(
  searchParams: Record<string, string | string[] | undefined>,
): OrderFilters {
  const state = firstParam(searchParams.state);
  return {
    from: firstParam(searchParams.from) || undefined,
    to: firstParam(searchParams.to) || undefined,
    product: firstParam(searchParams.product) || undefined,
    state: state && VALID_PAYMENT_STATES.includes(state) ? (state as PaymentState) : undefined,
  };
}
