// Server-only: executes the decision from ./fulfillment.ts against Kashier,
// which needs the secret key. Never import this module from the browser-safe
// entry (./index.ts).

import { decidePaymentAction, type FulfillmentUpdate } from "./fulfillment.js";
import {
  getTransaction,
  refundOrder,
  type GetTransactionConfig,
  type KashierOrderActionConfig,
  type KashierOrderActionResult,
} from "./kashier.js";

export type { FulfillmentStatus, FulfillmentUpdate, PaymentAction } from "./fulfillment.js";
export { decidePaymentAction } from "./fulfillment.js";

/**
 * Applies a fulfillment status change to the buyer's Kashier order: refunds
 * (full or partial) when the decided action calls for it, does nothing
 * otherwise. Caller is responsible for re-verifying the fulfillment update
 * before calling this — see decidePaymentAction's docs.
 */
export async function applyFulfillmentUpdate(
  config: KashierOrderActionConfig,
  orderId: string,
  update: FulfillmentUpdate,
): Promise<KashierOrderActionResult | { type: "none" }> {
  const action = decidePaymentAction(update);

  if (action.type === "none") {
    return { type: "none" };
  }

  return refundOrder(config, {
    orderId,
    amountInPiastres: action.amountInPiastres,
  });
}

export interface VerifiedFulfillmentUpdateParams {
  orderId: string;
  /**
   * The Kashier transaction to re-verify against before acting — normally the
   * `transactionId` persisted when the order was authorized/paid (CLAUDE.md:
   * "Persisting the Kashier transactionId"). No persistence layer exists yet
   * in this repo, so today's callers (see the fulfillment webhook route) must
   * be handed this directly rather than looking it up.
   */
  transactionId: string;
  update: FulfillmentUpdate;
}

export type VerifiedFulfillmentUpdateResult =
  | { outcome: "applied"; action: KashierOrderActionResult | { type: "none" } }
  | { outcome: "rejected"; reason: string };

/**
 * Re-verifies the transaction with Kashier directly before applying a
 * fulfillment update — this is the check CLAUDE.md requires before any
 * webhook-triggered capture/void/refund. Note this only confirms the
 * transaction is real and was SUCCESS on Kashier's side; it cannot confirm
 * the fulfillment claim itself (e.g. that the courier really did mark the
 * order DELIVERED) without a real carrier integration, which doesn't exist
 * yet (see CLAUDE.md's carrier notes).
 */
export async function applyVerifiedFulfillmentUpdate(
  config: GetTransactionConfig & KashierOrderActionConfig,
  params: VerifiedFulfillmentUpdateParams,
): Promise<VerifiedFulfillmentUpdateResult> {
  const transaction = await getTransaction(config, params.transactionId);

  if (transaction.status !== "SUCCESS") {
    return {
      outcome: "rejected",
      reason: `Kashier transaction ${params.transactionId} status is '${transaction.status}', not 'SUCCESS' — refusing to act on it.`,
    };
  }

  const action = await applyFulfillmentUpdate(config, params.orderId, params.update);
  return { outcome: "applied", action };
}
