import type { Order } from "@/types/order";
import type { CustomerSummary } from "@/types/customer";
import type { RankedEntry } from "./analytics";
import { isIncomeCountedState } from "./income-summary";

export function getCustomerSummaries(orders: Order[]): CustomerSummary[] {
  const byEmail = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const existing = byEmail.get(order.customerEmail);
    const spent = isIncomeCountedState(order.paymentState)
      ? order.amountInPiastres
      : 0;

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpentInPiastres += spent;
    } else {
      byEmail.set(order.customerEmail, {
        name: order.customerName,
        email: order.customerEmail,
        orderCount: 1,
        totalSpentInPiastres: spent,
      });
    }
  }

  return Array.from(byEmail.values()).sort(
    (a, b) => b.totalSpentInPiastres - a.totalSpentInPiastres,
  );
}

/** Top N customers by total spend, highest first (customer summaries are already sorted this way). */
export function getTopCustomersBySpend(orders: Order[], limit = 5): RankedEntry[] {
  return getCustomerSummaries(orders)
    .slice(0, limit)
    .map((customer) => ({
      label: customer.name,
      valueInPiastres: customer.totalSpentInPiastres,
    }));
}
