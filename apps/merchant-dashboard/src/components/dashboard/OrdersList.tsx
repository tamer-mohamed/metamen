import type { Order } from "@/types/order";
import { OrderRow } from "./OrderRow";

export function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Orders</h2>
      <div className="hidden grid-cols-4 gap-4 border-b border-black/20 px-4 pb-2 text-xs font-medium uppercase text-black/60 dark:border-white/20 dark:text-white/60 @sm:grid">
        <span>Product</span>
        <span>Amount</span>
        <span>Payment State</span>
        <span>Date</span>
      </div>
      <div className="rounded-b-md border border-t-0 border-black/10 dark:border-white/10">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
