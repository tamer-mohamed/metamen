"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutDialog from "./CheckoutDialog";

export default function BuyNowButton({ productId }: { productId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setStatus("loading");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        setStatus("error");
        return;
      }

      setCheckoutUrl(data.url);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="w-full rounded-lg bg-[#45543F] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#9FB093] dark:text-[#171717] sm:w-auto"
      >
        {status === "loading" ? "Starting checkout…" : "Pay with Metamen"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Something went wrong starting checkout. Please try again.
        </p>
      )}
      {checkoutUrl && (
        <CheckoutDialog
          url={checkoutUrl}
          onSuccess={() =>
            router.push(
              `/checkout/result?paymentStatus=SUCCESS&orderId=${productId}`,
            )
          }
          onFailure={() =>
            router.push(
              `/checkout/result?paymentStatus=FAILURE&orderId=${productId}`,
            )
          }
          onClose={() => setCheckoutUrl(null)}
        />
      )}
    </div>
  );
}
