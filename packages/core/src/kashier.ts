// Server-only: creating a payment session requires the Kashier Secret Key and
// Payment API Key. Never import this module from the browser-safe entry (./index.ts).

import { randomUUID } from "node:crypto";
import { assertPiastres, type Piastres } from "./money.js";

const DEFAULT_BASE_URL = "https://test-api.kashier.io";

/** Converts an integer piastres amount to the decimal string Kashier's API expects (e.g. "450.00"). */
export function piastresToKashierAmount(value: Piastres): string {
  return (assertPiastres(value) / 100).toFixed(2);
}

export interface KashierConfig {
  secretKey: string;
  apiKey: string;
  merchantId: string;
  /** Overridable for testing; defaults to the Kashier test API. */
  baseUrl?: string;
}

export interface CreatePaymentSessionParams {
  /**
   * Identifies the product being purchased. NOT sent to Kashier as-is — Kashier
   * treats `order` as a unique reference per session and refuses to create a
   * second session (400 "Sessions cannot be created, another session is opened
   * or paid") if the same value is reused, which a static product id would
   * trigger on every repeat purchase. A unique suffix is appended per attempt.
   */
  productId: string;
  amountInPiastres: Piastres;
  merchantRedirect: string;
}

export interface PaymentSession {
  sessionUrl: string;
}

export async function createPaymentSession(
  config: KashierConfig,
  params: CreatePaymentSessionParams,
): Promise<PaymentSession> {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}/v3/payment/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.secretKey,
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      amount: piastresToKashierAmount(params.amountInPiastres),
      currency: "EGP",
      order: `${params.productId}-${randomUUID()}`,
      merchantId: config.merchantId,
      merchantRedirect: params.merchantRedirect,
      display: "en",
      type: "one-time",
      // Restricted to methods confirmed working for this merchant account.
      // InstaPay is offered by Kashier's own checkout UI but fails at payment
      // time with "Invalid Merchant ID" — an account-side provisioning gap on
      // Kashier's end (reproduced live; card works fine with the same
      // merchant id), not something a request parameter can fix. Excluded
      // here rather than left as a guaranteed-to-fail option in the UI.
      // Only "card" has been proven end-to-end; wallet/bank_installments are
      // included because they're presented as primary (non-overflow) methods
      // alongside card, not because they've been independently verified.
      // allowedMethods: "instaPay,wallet",
      // Cosmetic — themes the hosted checkout (redirect or embedded) to match
      // this storefront's palette (apps/ecommerce/src/components/product).
      brandColor: "#45543F",
      // This demo has no accounts or cart (spec 002 Assumptions) — there is no
      // real customer identity to pass through. Kashier requires this object,
      // so we synthesize a per-checkout-attempt guest identity for it.
      customer: {
        email: "guest@metamen.demo",
        reference: `guest-${randomUUID()}`,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Kashier payment session request failed with status ${response.status}: ${body}`,
    );
  }

  const data = (await response.json()) as { sessionUrl?: string };
  if (!data.sessionUrl) {
    throw new Error("Kashier payment session response is missing sessionUrl");
  }

  return { sessionUrl: data.sessionUrl };
}
