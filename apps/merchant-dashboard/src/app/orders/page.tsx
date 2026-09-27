import { orders } from "@/data/orders";
import { filterOrders, getUniqueProductNames, parseOrderFilters } from "@/lib/filters";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function OrdersPage({ searchParams }: PageProps<"/orders">) {
  const resolvedSearchParams = await searchParams;
  const filters = parseOrderFilters(resolvedSearchParams);
  const filteredOrders = filterOrders(orders, filters);
  const products = getUniqueProductNames(orders);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <FilterPanel
          products={products}
          from={filters.from}
          to={filters.to}
          product={filters.product}
          state={filters.state}
          showPaymentState
        />
        {filteredOrders.length > 0 ? (
          <OrdersList orders={filteredOrders} />
        ) : (
          <p className="text-sm text-black/60 dark:text-white/60">
            No orders match these filters.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
