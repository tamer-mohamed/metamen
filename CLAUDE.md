@apps/ecommerce/AGENTS.md

# Repo layout

Turborepo monorepo (pnpm workspaces):

- `apps/ecommerce` — Next.js demo storefront.
- `packages/core` — `@metamen/core`, the framework-agnostic domain layer for capturing Kashier payments and tracking fulfillment. Plain TypeScript, no framework dependencies, so it can back any install form factor (script tag, plugin, npm package, hosted backend).

Run tasks from the repo root via `turbo run <task>` (e.g. `pnpm dev`, `pnpm build`), not by `cd`-ing into a package.

# Project rules

## Money
All money is stored and computed in integer piastres, never floats.

## Kashier API auth
Kashier has two distinct integration paths, and they authenticate differently. Know which one you are on.

**Hosted checkout (Payment Sessions) — our default.** `POST /v3/payment/sessions` on `api.kashier.io` (test: `test-api.kashier.io`), authenticated with `Authorization: <Secret Key>` plus an `api-key: <Payment API Key>` header. **No hash.** Returns a `sessionUrl` used as a redirect target or `<iframe src>`. Supports `manualCapture` for authorize-now/capture-later, and `connectedAccount` for transacting on behalf of a sub-merchant.

**Direct API — avoid.** `POST /v3/orders` on `fep.kashier.io` is the own-card-form path and *is* the one authenticated with a `Kashier-Hash` header (HMAC-SHA256 over `/?payment={mid}.{reference}.{amount}.{currency}`, keyed with the Payment API Key). Taking this path puts card data in our scope and escalates PCI obligations, so do not use it without an explicit decision to do so.

Capture, void and refund (`PUT /v3/orders/:orderId`, on `fep.kashier.io` / `test-fep.kashier.io` — the same host as the Direct API, but not the Direct API itself) use the `Authorization` secret key and take no hash, on either path. Body is `{ apiOperation: "CAPTURE" | "VOID" | "REFUND", transaction?: { amount?, targetTransactionId? }, reason? }`; omit `transaction` for a full action on the order's own pay/authorize transaction, or set `targetTransactionId` to act on a specific prior transaction (e.g. releasing a hold is `VOID` with the authorize transaction's id).

**Manual capture needs Kashier's approval too.** Like Connected Accounts, the Authorization Capture feature (`manualCapture` on sessions, and the capture operation itself) is off until Kashier's account team enables it — confirm this is actually on before assuming authorize-now/capture-later works.

**Void has a same-day window; refund doesn't.** Voiding a `PAY` or `CAPTURE` transaction only works same-day — past it, use refund instead. Voiding an unused `AUTHORIZE` hold (a release) is not subject to that window.

## Secrets
Never name any environment variable holding a Kashier secret with a `NEXT_PUBLIC_` prefix — that prefix ships to the browser bundle in Next.js.

`@metamen/core` enforces this split at the package boundary: `@metamen/core` is the browser-safe entry and must never touch the secret key, while `@metamen/core/server` holds every secret-key operation (capture, void, refund). Never import the `/server` entry from client code.

## Metamen never custodies merchant Kashier credentials
Merchants keep their own Kashier account. We reach their transactions through Kashier **Connected Accounts**: Metamen is the platform, the merchant is a connected account that authorizes the link, and we pass `connectedAccount: "MID-..."` (the merchant id as a plain string — confirmed live; Kashier's session API rejects the object form `{ merchantId }` with `"connectedAccount" must be a string`) using *our own* platform keys. We never store, receive or proxy a merchant's Kashier secret key.

Holding those keys would make us a PCI service provider and likely pull us into CBE payment-aggregator licensing. Carrier credentials are a different matter and may be held, since they carry no card data.

Connected Accounts is behind a per-merchant Kashier feature flag that is **off by default** and can only be enabled by Kashier, and merchant onboarding is a manual dashboard flow with no API. Both facts constrain how self-serve onboarding can be.

## Settlement scope (for now): buyer payment only
Kashier has no split-payment or revenue-share API — a capture/void/refund moves the *entire* amount of one transaction, paid from or into **this account's own Kashier balance** (confirmed against the refund docs: "Refunds are paid from your available Kashier balance"). There is no per-transaction mechanism to route part of a payment to a seller and keep part as a platform fee.

So for now, `@metamen/core`'s job stops at the buyer's payment: capture, void, or refund the one transaction in full or in part. Whatever a seller is owed is **not** disbursed through Kashier at all — it's tracked in our own ledger and paid out to the seller by some other means (e.g. a bank transfer), which is unbuilt and out of scope until designed. Do not model "seller wallet," "sub-merchant balance," or fee-splitting as a Kashier API call — it isn't one.

## We do not rebuild payment acceptance
Kashier already ships hosted checkout, payment links, and official plugins for WooCommerce/Shopify/Magento/OpenCart/PrestaShop/Wix. Our product is the **orchestration between payment and fulfillment** — capture on ship, void on fulfillment failure, keeping the two state machines reconciled — plus multi-carrier shipping, which Kashier does not do at all.

## Kashier webhook gotchas
- Failure events arrive with the **same `event` value** as successes. Branch on `data.status` (`SUCCESS`/`FAILURE`/`PENDING`), never on `event`.
- Signature is HMAC-SHA256 with the **Payment API Key** over alphabetically-sorted `signatureKeys` as `k=v&k=v`, compared against the `x-kashier-signature` header.
- Kashier retries 10 times (2m → 10m → 30m → 1h → 2h → 4h, then every 4h) with a 30s timeout. Both `200` and `409` count as acknowledged — return `409` for a duplicate rather than letting it retry.

## Persisting the Kashier transactionId
The `transactionId` returned when an order is authorized must be persisted to the database before acknowledging the request to the caller. It is the only way to void or capture that hold later — losing it means the hold cannot be released.

## Webhooks are not authoritative
Never treat a webhook alone as authoritative for releasing money. Always re-verify the order status by polling Kashier's API before any capture or void that a webhook triggers.

## Payment state vs. fulfillment state
Payment state (authorized/captured/voided/refunded) and fulfillment state (created/shipped/delivered/failed/returned) are separate state machines. Do not collapse them into one status field.
