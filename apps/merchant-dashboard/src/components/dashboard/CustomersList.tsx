import { formatPiastres } from "@metamen/core";
import type { CustomerSummary } from "@/types/customer";

export function CustomersList({ customers }: { customers: CustomerSummary[] }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Customers</h2>
      <div className="hidden grid-cols-3 gap-4 border-b border-black/20 px-4 pb-2 text-xs font-medium uppercase text-black/60 dark:border-white/20 dark:text-white/60 @sm:grid">
        <span>Customer</span>
        <span>Orders</span>
        <span>Total Spent</span>
      </div>
      <div className="rounded-b-md border border-t-0 border-black/10 dark:border-white/10">
        {customers.map((customer) => (
          <div
            key={customer.email}
            className="flex flex-col gap-1.5 border-b border-black/10 px-4 py-3 text-sm last:border-b-0 dark:border-white/10 @sm:grid @sm:grid-cols-3 @sm:items-start @sm:gap-4"
          >
            <span>
              <span className="block font-medium">{customer.name}</span>
              <span className="block text-black/60 dark:text-white/60">
                {customer.email}
              </span>
            </span>
            <span>{customer.orderCount}</span>
            <span className="font-medium">
              {formatPiastres(customer.totalSpentInPiastres)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
