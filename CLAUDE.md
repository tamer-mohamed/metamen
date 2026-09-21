@apps/ecommerce/AGENTS.md

# Repo layout

Turborepo monorepo (pnpm workspaces):

- `apps/ecommerce` — Next.js demo storefront.
- `packages/sdk` — `@metamen/sdk`, the SDK merchants install to capture Kashier payments and track fulfillment.

Run tasks from the repo root via `turbo run <task>` (e.g. `pnpm dev`, `pnpm build`), not by `cd`-ing into a package.

# Project rules

## Money
All money is stored and computed in integer piastres, never floats.

## Kashier API auth
Kashier's API on `fep.kashier.io` uses two different auth schemes on the same host:
- Creating a payment (`POST /v3/orders`) is authenticated with a `Kashier-Hash` header.
- Capture, void, and refund (`PUT /v3/orders/:orderId`) use the `Authorization` secret key instead and take no hash.

## Secrets
Never name any environment variable holding a Kashier secret with a `NEXT_PUBLIC_` prefix — that prefix ships to the browser bundle in Next.js.

`@metamen/sdk` enforces this split at the package boundary: `@metamen/sdk` is the browser-safe entry and must never touch the secret key, while `@metamen/sdk/server` holds every secret-key operation (capture, void, refund). Never import the `/server` entry from client code.

## Persisting the Kashier transactionId
The `transactionId` returned when an order is authorized must be persisted to the database before acknowledging the request to the caller. It is the only way to void or capture that hold later — losing it means the hold cannot be released.

## Webhooks are not authoritative
Never treat a webhook alone as authoritative for releasing money. Always re-verify the order status by polling Kashier's API before any capture or void that a webhook triggers.

## Payment state vs. fulfillment state
Payment state (authorized/captured/voided/refunded) and fulfillment state (created/shipped/delivered/failed/returned) are separate state machines. Do not collapse them into one status field.
