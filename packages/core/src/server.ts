// Server-only entry point for @metamen/core.
// Capture, void, and refund authenticate with the Kashier secret key, which must
// never reach a browser bundle. Never import this module from client code.

export {
  assertPiastres,
  formatPiastres,
  isValidPiastres,
  type Piastres,
} from "./money.js";
