"use client";

import { usePathname, useRouter } from "next/navigation";
import { PAYMENT_STATE_LABELS } from "@/components/dashboard/PaymentStateBadge";
import type { PaymentState } from "@/types/order";

const PRESETS: { label: string; days: number | null }[] = [
  { label: "All time", days: null },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const PAYMENT_STATES: PaymentState[] = [
  "authorized",
  "captured",
  "voided",
  "refunded",
];

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const inputClasses =
  "rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10";
const labelClasses =
  "flex flex-col gap-1 text-xs uppercase text-black/60 dark:text-white/60";

export function FilterPanel({
  products,
  from,
  to,
  product,
  state,
  showPaymentState = false,
}: {
  products: string[];
  from?: string;
  to?: string;
  product?: string;
  state?: PaymentState;
  showPaymentState?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function pushParams(next: {
    from?: string;
    to?: string;
    product?: string;
    state?: string;
  }) {
    const params = new URLSearchParams();
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.product) params.set("product", next.product);
    if (next.state) params.set("state", next.state);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasActiveFilters = Boolean(from || to || product || state);

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-black/10 p-3 dark:border-white/10">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() =>
              pushParams({
                from: preset.days === null ? undefined : isoDaysAgo(preset.days),
                to: undefined,
                product,
                state,
              })
            }
            className="rounded-md px-2.5 py-1 text-xs font-medium text-black/60 hover:bg-black/[0.05] dark:text-white/60 dark:hover:bg-white/[0.05]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className={labelClasses}>
        From
        <input
          type="date"
          value={from ?? ""}
          onChange={(event) =>
            pushParams({ from: event.target.value, to, product, state })
          }
          className={inputClasses}
        />
      </label>

      <label className={labelClasses}>
        To
        <input
          type="date"
          value={to ?? ""}
          onChange={(event) =>
            pushParams({ from, to: event.target.value, product, state })
          }
          className={inputClasses}
        />
      </label>

      <label className={labelClasses}>
        Product
        <select
          value={product ?? ""}
          onChange={(event) =>
            pushParams({ from, to, product: event.target.value, state })
          }
          className={inputClasses}
        >
          <option value="">All products</option>
          {products.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {showPaymentState && (
        <label className={labelClasses}>
          Payment state
          <select
            value={state ?? ""}
            onChange={(event) =>
              pushParams({ from, to, product, state: event.target.value })
            }
            className={inputClasses}
          >
            <option value="">All states</option>
            {PAYMENT_STATES.map((paymentState) => (
              <option key={paymentState} value={paymentState}>
                {PAYMENT_STATE_LABELS[paymentState]}
              </option>
            ))}
          </select>
        </label>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-black/60 underline hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
