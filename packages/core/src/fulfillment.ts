// Pure orchestration logic: no fetch, no secrets. Safe for the browser-safe
// entry (./index.ts). Actually executing the decided action against Kashier
// (applyFulfillmentUpdate, below) needs the secret key and lives in ./server.ts.

import type { Piastres } from "./money.js";

/**
 * Matches the fulfillment state machine documented in CLAUDE.md
 * ("Payment state vs. fulfillment state"). Kept separate from payment state
 * on purpose — do not collapse them into one status field.
 */
export type FulfillmentStatus =
  | "created"
  | "shipped"
  | "delivered"
  | "failed"
  | "returned";

export interface FulfillmentUpdate {
  status: FulfillmentStatus;
  /**
   * For a partial return or partial delivery failure (e.g. 1 of 3 items
   * rejected at the door) — the piastres value of just the returned portion.
   * Omit for a full return/failure.
   */
  returnedAmountInPiastres?: Piastres;
}

export type PaymentAction =
  | { type: "none" }
  | { type: "refund"; amountInPiastres?: Piastres };

/**
 * Decides what to do to the buyer's payment for a fulfillment status change.
 * Always refunds rather than voids, even for a same-day cancellation before
 * shipping — refund is correct regardless of timing (CLAUDE.md: void has a
 * same-day window, refund doesn't), so this trades a possible optimization
 * for one code path that's always right. Revisit if same-day void ever
 * matters (e.g. cost of refund vs void on your Kashier plan).
 *
 * This only decides the action — it does not call Kashier and does not
 * decide whether to trust the caller's fulfillment update. A real webhook
 * handler must re-verify status with the carrier/Kashier before calling
 * applyFulfillmentUpdate (CLAUDE.md: "Webhooks are not authoritative").
 */
export function decidePaymentAction(update: FulfillmentUpdate): PaymentAction {
  switch (update.status) {
    case "created":
    case "shipped":
    case "delivered":
      return { type: "none" };
    case "failed":
    case "returned":
      return { type: "refund", amountInPiastres: update.returnedAmountInPiastres };
  }
}
