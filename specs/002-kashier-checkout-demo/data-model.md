# Phase 1 Data Model: Kashier Checkout Demo

## Product (existing, unchanged)

Defined in `apps/ecommerce/src/types/product.ts` (spec 001). This feature reads it but does not modify its shape.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Used as the product-detail route param and as the prefix of Kashier's `order` reference (see `CheckoutSession.orderReference` below) |
| `name` | string | Shown on the PDP and in the success confirmation (FR-005) |
| `priceInPiastres` | number | Converted to Kashier's decimal string at the request boundary (research.md §2) |
| `imageSrc` | string | Shown on the PDP |
| `category` | string | Shown on the PDP |

## CheckoutSession (new, transient — not persisted)

Represents one attempt to pay for one product. Exists only as: (a) in-memory state inside the `/api/checkout` request while building the Kashier call, and (b) implicitly, as the query string Kashier appends to `/checkout/result`.

| Field | Type | Notes |
|---|---|---|
| `productId` | string | The product being purchased |
| `orderReference` | string | `${productId}-${randomUUID()}`, sent as Kashier's `order` field. **Must be unique per attempt** — Kashier treats `order` as a one-time reference and rejects a repeat with `400 "Sessions cannot be created, another session is opened or paid"` rather than reusing/overwriting it (research.md §1). `checkout/result` recovers the `productId` by matching the returned reference's prefix, not by equality. |
| `amountInPiastres` | number | The product's `priceInPiastres` at the moment of purchase |
| `kashierSessionId` | string | Parsed out of the returned `sessionUrl`, for logging only — never stored |
| `outcome` | `"pending" \| "success" \| "failure"` | `"pending"` until the shopper returns from Kashier; resolved to `"success"`/`"failure"` per research.md §3's defensive parsing rule |

**Validation rules**:
- `amountInPiastres` MUST be a positive integer (reuses `assertPiastres` from `@metamen/core`).
- `productId` MUST correspond to an entry in `apps/ecommerce/src/data/products.ts`, or the `/api/checkout` request is rejected before any call to Kashier is made.

**Relationships**: One `CheckoutSession` references exactly one `Product`. No relationship to any other entity — no `Order`, no `Cart`, no `User`, per spec Assumptions.

**State transitions**: `pending → success` or `pending → failure`. No further transitions — this feature does not model refunds, voids, or any post-payment state (that is #6/#7/#25, explicitly out of scope here).

## Notes on scope

No database schema, no migration, no ORM model. `CheckoutSession` is a type, not a stored record — documented here because the spec calls it out as a Key Entity, not because it persists anywhere.
