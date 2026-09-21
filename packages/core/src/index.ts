// Browser-safe entry point for @metamen/core.
// Anything exported here may ship to a merchant's client bundle, so it must
// never touch the Kashier secret key. Secret-key operations live in ./server.

export {
  assertPiastres,
  formatPiastres,
  isValidPiastres,
  type Piastres,
} from "./money.js";
