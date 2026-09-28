// Server-only entry point for @metamen/core.
// Capture, void, and refund authenticate with the Kashier secret key, which must
// never reach a browser bundle. Never import this module from client code.

export {
  assertPiastres,
  formatPiastres,
  isValidPiastres,
  type Piastres,
} from "./money.js";

export {
  captureOrder,
  createPaymentSession,
  getTransaction,
  piastresToKashierAmount,
  refundOrder,
  voidOrder,
  type CreatePaymentSessionParams,
  type GetTransactionConfig,
  type KashierConfig,
  type KashierOrderActionConfig,
  type KashierOrderActionParams,
  type KashierOrderActionResult,
  type KashierTransaction,
  type PaymentSession,
} from "./kashier.js";

export {
  applyFulfillmentUpdate,
  applyVerifiedFulfillmentUpdate,
  type VerifiedFulfillmentUpdateParams,
  type VerifiedFulfillmentUpdateResult,
} from "./orchestration.js";

export {
  type FulfillmentStatus,
  type FulfillmentUpdate,
  type PaymentAction,
} from "./fulfillment.js";
