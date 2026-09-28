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
  /**
   * Transacts on behalf of a merchant via Kashier Connected Accounts, using
   * `config`'s platform keys rather than the merchant's own secret key. Omit
   * to charge directly to the account identified by `config.merchantId`.
   * Kashier's session API takes this as the merchant id string directly
   * (confirmed live: `{ merchantId }` is rejected with `"connectedAccount"
   * must be a string`), despite CLAUDE.md's Connected Accounts note showing
   * the object form — that note needs updating to match.
   */
  connectedAccount?: string;
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
      ...(params.connectedAccount ? { connectedAccount: params.connectedAccount } : {}),
      // Restricted to wallet + InstaPay only, per request. Neither has been
      // proven end-to-end here yet — InstaPay previously failed live with
      // "Invalid Merchant ID" (an account-side provisioning gap, not
      // something a request parameter can fix) before being re-included, so
      // verify both complete a real payment before relying on this set.
      allowedMethods: "wallet,instaPay",
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

// Capture, void and refund all live on a different host (fep, not api) and a
// different endpoint shape (PUT /v3/orders/:orderId with an apiOperation)
// than payment sessions. Only the secret key is needed — no api-key, no hash.
const DEFAULT_ORDERS_BASE_URL = "https://test-fep.kashier.io";

export interface KashierOrderActionConfig {
  secretKey: string;
  /** Overridable for testing; defaults to the Kashier test orders API. */
  baseUrl?: string;
}

export interface KashierOrderActionParams {
  /** The Kashier order id (not the productId/order reference passed at session creation). */
  orderId: string;
  /**
   * Targets a specific prior transaction on the order — e.g. the `transactionId`
   * from an AUTHORIZE, to capture or release that specific hold. Omit to act on
   * the order's own pay/authorize transaction.
   */
  targetTransactionId?: string;
  /** Omit for a full capture/void/refund; provide for a partial one. */
  amountInPiastres?: Piastres;
}

export interface KashierOrderActionResult {
  status: string;
  raw: unknown;
}

/**
 * NOTE: Kashier's docs show `transaction.amount` as a bare number (`3`), unlike
 * the quoted two-decimal string payment sessions use (`"450.00"`). Neither the
 * unit (EGP vs piastres) nor the exact numeric formatting has been confirmed
 * against a live capture/void/refund yet — doing so needs a completed
 * AUTHORIZE transaction, which needs the Authorization Capture feature enabled
 * by Kashier first (see CLAUDE.md). Verify this against a real sandbox
 * transaction before relying on it for a real amount.
 */
function toOrderActionAmount(value: Piastres): number {
  return Number(piastresToKashierAmount(value));
}

async function mutateOrder(
  config: KashierOrderActionConfig,
  apiOperation: "CAPTURE" | "VOID" | "REFUND",
  params: KashierOrderActionParams,
  reason?: string,
): Promise<KashierOrderActionResult> {
  const baseUrl = config.baseUrl ?? DEFAULT_ORDERS_BASE_URL;

  const transaction: Record<string, unknown> = {};
  if (params.amountInPiastres !== undefined) {
    transaction.amount = toOrderActionAmount(params.amountInPiastres);
  }
  if (params.targetTransactionId) {
    transaction.targetTransactionId = params.targetTransactionId;
  }

  const response = await fetch(`${baseUrl}/v3/orders/${params.orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.secretKey,
    },
    body: JSON.stringify({
      apiOperation,
      ...(Object.keys(transaction).length > 0 ? { transaction } : {}),
      ...(reason ? { reason } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Kashier ${apiOperation.toLowerCase()} request failed with status ${response.status}: ${body}`,
    );
  }

  const data = (await response.json()) as { status?: string };
  return { status: data.status ?? "UNKNOWN", raw: data };
}

/**
 * Captures a full or partial amount of a previously authorized order — the
 * buyer's payment only. Requires the Authorization Capture feature to be
 * enabled for this account by Kashier first.
 */
export function captureOrder(
  config: KashierOrderActionConfig,
  params: KashierOrderActionParams,
): Promise<KashierOrderActionResult> {
  return mutateOrder(config, "CAPTURE", params);
}

/**
 * Releases an authorized hold, or cancels a same-day pay/capture. Only works
 * inside a same-day window for pay/capture targets (releasing an unused
 * authorize hold is not subject to that window) — past it, use refundOrder.
 */
export function voidOrder(
  config: KashierOrderActionConfig,
  params: KashierOrderActionParams,
): Promise<KashierOrderActionResult> {
  return mutateOrder(config, "VOID", params);
}

/**
 * Refunds a full or partial amount, paid from this account's own Kashier
 * balance — the buyer's payment only. There is no Kashier primitive for
 * splitting that money across multiple parties; seller settlement is handled
 * entirely outside Kashier (see CLAUDE.md).
 */
export function refundOrder(
  config: KashierOrderActionConfig,
  params: KashierOrderActionParams & { reason?: string },
): Promise<KashierOrderActionResult> {
  const { reason, ...rest } = params;
  return mutateOrder(config, "REFUND", rest, reason);
}

// Transaction lookup lives on yet another host (api, not fep) and vocabulary
// (SUCCESS/FAILURE/PENDING "stored status", same as webhooks — not the
// capitalized Approved/Rejected/Unknown the list endpoint projects).
const DEFAULT_TRANSACTIONS_BASE_URL = "https://test-api.kashier.io";

export interface GetTransactionConfig {
  secretKey: string;
  /** Overridable for testing; defaults to the Kashier test transactions API. */
  baseUrl?: string;
}

export interface KashierTransaction {
  status: "SUCCESS" | "FAILURE" | "PENDING" | string;
  /** The Kashier order this transaction belongs to — cross-check against a caller's claimed orderId before trusting it. */
  orderId?: string;
  raw: unknown;
}

/**
 * Looks up a transaction by id directly from Kashier — the only
 * re-verification available for a webhook-driven action, since Kashier has
 * no documented GET on the /v3/orders/:orderId capture/void/refund endpoint
 * (confirmed empirically: it 400s "routing key is missing" for GET). Callers
 * driving money off an inbound webhook must not act on that webhook's claims
 * alone — fetch the transaction here first (CLAUDE.md: "Webhooks are not
 * authoritative").
 *
 * The response nests everything under `body` — confirmed against a real
 * completed transaction; do not trust the flatter shape the docs' field list
 * implies.
 */
export async function getTransaction(
  config: GetTransactionConfig,
  transactionId: string,
): Promise<KashierTransaction> {
  const baseUrl = config.baseUrl ?? DEFAULT_TRANSACTIONS_BASE_URL;
  const response = await fetch(
    `${baseUrl}/v2/aggregator/transactions/${transactionId}`,
    {
      headers: { Authorization: config.secretKey },
    },
  );

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    throw new Error(
      `Kashier transaction lookup failed with status ${response.status}: ${responseBody}`,
    );
  }

  const data = (await response.json()) as {
    body?: { status?: string; order?: { orderId?: string } };
  };
  if (!data.body?.status) {
    throw new Error("Kashier transaction lookup response is missing body.status");
  }

  return { status: data.body.status, orderId: data.body.order?.orderId, raw: data };
}
