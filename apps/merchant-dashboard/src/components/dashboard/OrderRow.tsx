import { formatPiastres } from "@metamen/core";
import Link from "next/link";
import type { Order } from "@/types/order";
import { PaymentStateBadge } from "./PaymentStateBadge";

export function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex flex-col gap-1.5 border-b border-black/10 px-4 py-3 text-sm hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.03] @sm:grid @sm:grid-cols-4 @sm:items-center @sm:gap-4 @sm:gap-y-0"
    >
      <span className="font-medium">{order.productName}</span>
      <span className="flex flex-wrap items-center gap-2 @sm:contents">
        <span>{formatPiastres(order.amountInPiastres)}</span>
        <PaymentStateBadge state={order.paymentState} />
      </span>
      <span className="text-black/60 dark:text-white/60">{order.orderDate}</span>
    </Link>
  );
}
