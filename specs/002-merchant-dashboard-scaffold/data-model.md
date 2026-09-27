# Phase 1 Data Model: Merchant Dashboard Scaffold

Source: spec.md's Key Entities section. This is a static, in-repo dummy dataset (`src/data/orders.ts`) — no database, no migrations, no live persistence (FR-007).

## PaymentState

A fixed union of four string literals — no other values are valid.

```ts
export type PaymentState = "authorized" | "captured" | "voided" | "refunded";
```

- Each `Order` carries exactly one `PaymentState` at a time (spec: "Each order carries exactly one payment state at a time").
- Distinct from fulfillment status (created/shipped/delivered/failed/returned per `CLAUDE.md`'s payment-vs-fulfillment rule) — fulfillment status is out of scope for this feature (FR-010) and has no field here.
- The dummy dataset MUST include at least one `Order` in each of the four states (FR-008).

## Order

The single entity rendered by both the orders list and the order detail view.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable, human-readable identifier (e.g., `"ord-1001"`). Doubles as the order reference shown in detail (FR-004) and the `/orders/[orderId]` route segment. |
| `productName` | `string` | The single product sold on this order (Assumptions: one line item per order in this phase). |
| `amountInPiastres` | `Piastres` (from `@metamen/core`) | Integer piastre amount — never a float, per `CLAUDE.md`. |
| `paymentState` | `PaymentState` | One of the four fixed values above. |
| `orderDate` | `string` (ISO 8601 date, e.g., `"2026-08-14"`) | Displayed in both list and detail. |

```ts
import type { Piastres } from "@metamen/core";
import type { PaymentState } from "./payment-state";

export type Order = {
  id: string;
  productName: string;
  amountInPiastres: Piastres;
  paymentState: PaymentState;
  orderDate: string;
};
```

**Validation rules** (enforced by TypeScript's type system on the static dataset, not runtime input validation — there is no user input path in this feature):

- `id` must be unique across the dataset (route lookup and React list keys both depend on this).
- `amountInPiastres` must satisfy `@metamen/core`'s `isValidPiastres` (non-negative integer).
- `paymentState` must be one of the four `PaymentState` literals — the TypeScript union already prevents any other value at compile time.

**State transitions**: None modeled. This dataset is static and hand-authored; no code path mutates an `Order`'s `paymentState` in this feature (that belongs to `#39`'s real persistence/orchestration layer, out of scope here).

## IncomeSummary (derived, not stored)

Not a persisted entity — a value computed on demand from the `Order[]` dataset.

```ts
export function getIncomeSummaryInPiastres(orders: Order[]): Piastres;
```

- **Definition**: The sum of `amountInPiastres` across every `Order` whose `paymentState` is `"captured"` **or** `"refunded"`.
- **Inclusion rule** (FR-005/FR-006): an order counts toward the sum once it has been captured. `"refunded"` represents an order that *was* captured and later refunded — since this dataset models only a single, final `paymentState` per order (no transition history), `"refunded"` is how "captured, then later refunded" is represented, and its amount still counts (the summary is not net of later refunds).
- **Exclusion rule**: orders in `authorized` or `voided` states contribute nothing — neither ever reached the captured state (a void releases an authorization hold before any money is captured).
- **Zero case**: if no orders are `captured`, the function returns `0` (a valid `Piastres` value) — the UI must render a clear "0" total, not a blank/missing figure (Edge Cases).

## Merchant (implicit singleton — not a data record)

Per FR-009, there is exactly one demo merchant identity with no login/account model. It is not represented as a data entity with fields; it exists only as a fixed label in the UI shell (e.g., the dashboard header), not as a row in any dataset. No `Merchant` type is needed in `src/types/order.ts` or elsewhere.

## Relationships

```
Order (many) ---- filtered/summed by ----> IncomeSummary (one, derived)
Order (many) ---- all belong to ----> Merchant (one, implicit, unmodeled)
```

No other relationships exist in this phase (no customer entity, no fulfillment entity, no product catalog entity shared with `apps/ecommerce` — the dummy dataset embeds `productName` directly rather than referencing a shared product record, per spec Assumptions).
