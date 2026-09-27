import type { PaymentState } from "@/types/order";

const STYLES: Record<PaymentState, string> = {
  authorized: "bg-amber-100 text-amber-800",
  captured: "bg-emerald-100 text-emerald-800",
  voided: "bg-gray-100 text-gray-600",
  refunded: "bg-sky-100 text-sky-800",
};

export const PAYMENT_STATE_LABELS: Record<PaymentState, string> = {
  authorized: "Authorized",
  captured: "Captured",
  voided: "Voided",
  refunded: "Refunded",
};

export function PaymentStateBadge({ state }: { state: PaymentState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[state]}`}
    >
      {PAYMENT_STATE_LABELS[state]}
    </span>
  );
}
