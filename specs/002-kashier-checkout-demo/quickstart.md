# Quickstart: Validate the Kashier Checkout Demo

## Prerequisites

- A Kashier test account, with a **Secret Key**, **Payment API Key**, and **Merchant ID** (`MID-...`) from the Kashier dashboard's test mode.
- `.env.local` in `apps/ecommerce` (git-ignored) with:
  ```
  KASHIER_TEST_SECRET_KEY=...
  KASHIER_TEST_API_KEY=...
  KASHIER_TEST_MERCHANT_ID=MID-...
  PUBLIC_APP_URL=...
  ```
  None of these may carry a `NEXT_PUBLIC_` prefix — see `CLAUDE.md`.
  **If a key contains a literal `$`, escape it as `\$`** — Next.js expands unescaped `$VARIABLE` references in `.env*` files (this is documented Next.js behavior, not a bug). An unescaped `$` silently truncates/corrupts the value with no error at load time — if session creation gets a `401 Invalid token` with credentials you're sure are correct, check this first.
- **A tunnel exposing your local dev server**, e.g. `ngrok http 3000`. Kashier's `merchantRedirect` validation rejects `localhost` as a hostname outright (`"merchantRedirect" must be a valid URL"`, regardless of `http`/`https`) — it needs a real, publicly-resolvable-looking domain. Set `PUBLIC_APP_URL` to the tunnel's HTTPS URL (e.g. `https://abcd1234.ngrok-free.app`).
- Dependencies installed: `pnpm install`.

## Run it

```bash
pnpm dev
```

Open your tunnel URL (not `http://localhost:3000` directly — Kashier needs to redirect back to the tunnel).

## What to check

Walk the acceptance scenarios from [spec.md](./spec.md#user-scenarios--testing-mandatory) in order:

1. **Product detail page (User Story 1)**
   - Click a product on the homepage grid.
   - Confirm you land on `/products/<id>` showing that product's name, price, image, and a Buy Now button.
   - Visit `/products/does-not-exist` and confirm a clear not-found state, not a crash.

2. **Start checkout (User Story 2)**
   - Click Buy Now.
   - Confirm a dialog opens with an embedded `payments.kashier.io` checkout (not a full-page navigation — see research.md §9).
   - On Kashier's embedded page, confirm the amount shown matches the product's price exactly.
   - Press Escape, or click the backdrop, or click the ✕ — confirm the dialog closes and you're still on the product page each time.

3. **Successful payment (User Story 3)**
   - Complete the payment with a [Kashier test card](https://developers.kashier.io/docs/get-started/testing).
   - Confirm the dialog closes itself and you land on `/checkout/result` showing a clear success message naming the product.
   - Log into the Kashier test dashboard and confirm the transaction appears there (SC-004).

4. **Failed / cancelled payment (User Story 4)**
   - Start checkout again, and this time use a test card configured to decline.
   - Confirm the dialog closes itself and you land on `/checkout/result` showing a clear failure message, with a way to return to the product page and retry.

5. **Checkout session cannot be created (edge case)**
   - Temporarily set an invalid `KASHIER_TEST_SECRET_KEY` and restart the dev server.
   - Click Buy Now and confirm a clear inline error appears on the product page — never a blank or broken page.
   - Restore the correct key afterward.

## First real sandbox run — capture the actual postMessage contract

Per [research.md §9](./research.md#9-embedded-checkout-supersedes-4), the exact `event.data` shape Kashier's embedded checkout posts was assembled from a docs summary plus one non-matching legacy code sample, not confirmed API reference. Open devtools on the first live success and first live failure run above (`CheckoutDialog`'s dev-only `console.log` prints every unrecognized message) and confirm the real payloads match research.md §9's table — correct `CheckoutDialog.tsx`'s `switch` if they don't.

The `merchantRedirect` return contract (research.md §3) is no longer the primary path now that checkout is embedded, but is still worth capturing if a 3D Secure test card triggers `merchantStoreRedirect` — that callback still carries Kashier's own redirect query string.
