"use client";

import { useState } from "react";
import { formatPiastres } from "@metamen/core";
import type { ShippingTier } from "@/types/shipping";

export function NextTierPreview({
  label,
  nextTier,
}: {
  label: string;
  nextTier: ShippingTier | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!nextTier) {
    return (
      <span className="text-black/60 dark:text-white/60">{label}</span>
    );
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-describedby={isOpen ? `next-tier-${nextTier.name}` : undefined}
        className="cursor-default text-black/60 underline decoration-dotted underline-offset-2 dark:text-white/60"
      >
        {label}
      </button>
      {isOpen && (
        <div
          id={`next-tier-${nextTier.name}`}
          role="tooltip"
          className="absolute right-0 top-full z-10 mt-1 w-52 rounded-md border border-black/10 bg-[var(--background)] p-3 text-xs shadow-md dark:border-white/10"
        >
          <p className="font-medium">{nextTier.name} tier rates</p>
          <dl className="mt-1.5 flex flex-col gap-1">
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Shipping</dt>
              <dd className="font-medium">
                {formatPiastres(nextTier.ratesInPiastresPerOrder.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Return</dt>
              <dd className="font-medium">
                {formatPiastres(nextTier.ratesInPiastresPerOrder.return)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Storage</dt>
              <dd className="font-medium">
                {formatPiastres(nextTier.ratesInPiastresPerOrder.storage)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </span>
  );
}
