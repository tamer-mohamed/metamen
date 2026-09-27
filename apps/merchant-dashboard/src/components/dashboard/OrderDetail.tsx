import { formatPiastres } from "@metamen/core";
import type { Order } from "@/types/order";
import { PaymentStateBadge } from "./PaymentStateBadge";

export function OrderDetail({ order }: { order: Order }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <span className="text-xs uppercase text-black/60 dark:text-white/60">
          Order Reference
        </span>
        <h2 className="text-lg font-semibold">{order.id}</h2>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-black/60 dark:text-white/60">Customer</dt>
        <dd className="font-medium">
          {order.customerName}
          <span className="ml-2 font-normal text-black/60 dark:text-white/60">
            {order.customerEmail}
          </span>
        </dd>

        <dt className="text-black/60 dark:text-white/60">Product</dt>
        <dd className="font-medium">{order.productName}</dd>

        <dt className="text-black/60 dark:text-white/60">Amount</dt>
        <dd className="font-medium">{formatPiastres(order.amountInPiastres)}</dd>

        <dt className="text-black/60 dark:text-white/60">Payment State</dt>
        <dd>
          <PaymentStateBadge state={order.paymentState} />
        </dd>

        <dt className="text-black/60 dark:text-white/60">Order Date</dt>
        <dd className="font-medium">{order.orderDate}</dd>
      </dl>
    </section>
  );
}
