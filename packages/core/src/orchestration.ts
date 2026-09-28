// Server-only: executes the decision from ./fulfillment.ts against Kashier,
// which needs the secret key. Never import this module from the browser-safe
// entry (./index.ts).

import { decidePaymentAction, type FulfillmentUpdate } from "./fulfillment.js";
import {
  refundOrder,
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
