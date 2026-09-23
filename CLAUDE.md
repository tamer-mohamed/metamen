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

**Hosted checkout (Payment Sessions) — our default.** `POST /v3/payment/sessions` on `api.kashier.io` (test: `test-api.kashier.io`), authenticated with `Authorization: <Secret Key>` plus an `api-key: <Payment API Key>` header. **No hash.** Returns a `sessionUrl` used as a redirect target or `<iframe src>`. Supports `manualCapture` for authorize-now/capture-later, and `connectedAccount.merchantId` for transacting on behalf of a sub-merchant.

**Direct API — avoid.** `POST /v3/orders` on `fep.kashier.io` is the own-card-form path and *is* the one authenticated with a `Kashier-Hash` header (HMAC-SHA256 over `/?payment={mid}.{reference}.{amount}.{currency}`, keyed with the Payment API Key). Taking this path puts card data in our scope and escalates PCI obligations, so do not use it without an explicit decision to do so.

Capture, void and refund (`PUT /v3/orders/:orderId`) use the `Authorization` secret key and take no hash, on either path.

## Secrets
Never name any environment variable holding a Kashier secret with a `NEXT_PUBLIC_` prefix — that prefix ships to the browser bundle in Next.js.

`@metamen/core` enforces this split at the package boundary: `@metamen/core` is the browser-safe entry and must never touch the secret key, while `@metamen/core/server` holds every secret-key operation (capture, void, refund). Never import the `/server` entry from client code.

## Metamen never custodies merchant Kashier credentials
Merchants keep their own Kashier account. We reach their transactions through Kashier **Connected Accounts**: Metamen is the platform, the merchant is a connected account that authorizes the link, and we pass `connectedAccount: { merchantId: "MID-..." }` using *our own* platform keys. We never store, receive or proxy a merchant's Kashier secret key.

Holding those keys would make us a PCI service provider and likely pull us into CBE payment-aggregator licensing. Carrier credentials are a different matter and may be held, since they carry no card data.

Connected Accounts is behind a per-merchant Kashier feature flag that is **off by default** and can only be enabled by Kashier, and merchant onboarding is a manual dashboard flow with no API. Both facts constrain how self-serve onboarding can be.

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
