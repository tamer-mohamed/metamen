# Contract: `POST /api/checkout`

Internal endpoint called by `BuyNowButton` (research.md §6). Not a public API — no versioning, no auth beyond same-origin (no user accounts exist in this feature).

## Request

```
POST /api/checkout
Content-Type: application/json

{ "productId": "canvas-tote-bag" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `productId` | string | yes | Must match an id in `apps/ecommerce/src/data/products.ts` |

## Responses

**201 — session created**
```json
{ "url": "https://payments.kashier.io/session/<id>?mode=test" }
```
`BuyNowButton` sets `window.location.href` to this value (FR-004).

**404 — unknown product**
```json
{ "error": "unknown_product" }
```
Returned when `productId` does not match any product. `BuyNowButton` shows an inline error (FR-007); this should not normally be reachable through the UI since the PDP only ever sends its own valid id, but the endpoint must not trust the client.

**502 — Kashier unreachable or errored**
```json
{ "error": "session_creation_failed" }
```
Returned when the call to `POST /v3/payment/sessions` fails or Kashier returns a non-2xx response. `BuyNowButton` shows an inline error (FR-007) — per the spec edge case, the shopper is never sent to a broken or blank page.

**500 — misconfiguration**
```json
{ "error": "misconfigured" }
```
Returned if `KASHIER_TEST_SECRET_KEY`, `KASHIER_TEST_API_KEY`, or `KASHIER_TEST_MERCHANT_ID` is missing. Distinguished from `502` for easier local-dev debugging; the shopper-facing message is the same generic error either way.

## Wraps (external contract, not owned by us)

`POST https://test-api.kashier.io/v3/payment/sessions` — see research.md §1 for the confirmed request/response shape, and §3 for the deliberately-unverified `merchantRedirect` return contract this endpoint does not need to know about (that parsing happens in `/checkout/result`, not here).
