# Quickstart: Merchant Dashboard Scaffold

Validates the feature end-to-end against the acceptance scenarios in [spec.md](./spec.md). No backend, database, or Kashier credentials are required — everything is driven by the static dataset in `apps/merchant-dashboard/src/data/orders.ts` (see [data-model.md](./data-model.md)).

## Prerequisites

- Dependencies installed at the repo root: `pnpm install`
- No environment variables required (no live Kashier calls, no auth)

## Run it

From the repo root (per `CLAUDE.md`: run tasks via `turbo`, not by `cd`-ing into a package):

```bash
pnpm dev
```

This starts every app's dev server in parallel via Turborepo, including `merchant-dashboard` on its own port (see research.md decision #2 — distinct from `apps/ecommerce`'s port 3000, e.g. `3001`). Open the printed `merchant-dashboard` URL, e.g.:

```text
http://localhost:3001
```

To run only this app in isolation:

```bash
pnpm --filter merchant-dashboard dev
```

## Validation scenarios

Each scenario below maps to an acceptance scenario in spec.md.

### 1. Orders list shows every order with all four payment states (User Story 1)

1. Open `/`.
2. Confirm every order in `src/data/orders.ts` appears as a row, each showing product, amount, payment state, and order date.
3. Confirm at least one row is visibly `authorized`, one `captured`, one `voided`, and one `refunded` — each visually distinguishable (via `PaymentStateBadge`).

**Expected**: All dummy orders render; all four payment states are represented and visually distinct. (Satisfies SC-001, SC-004.)

### 2. Selecting an order opens its detail (User Story 2)

1. From `/`, select any order row.
2. Confirm navigation lands on `/orders/[orderId]` for that order.
3. Confirm the detail view shows the same product, amount, payment state, and order date as the list row, plus the order's reference/id unambiguously identifying it.

**Expected**: One selection action reaches the detail view; the detail view's order reference matches the selected row. (Satisfies SC-002; FR-003, FR-004.)

### 3. Order detail handles an unknown/stale reference (Edge Case)

1. Navigate directly to `/orders/does-not-exist`.
2. Confirm the page shows a clear "order not found" state rather than a blank page or a runtime error.

**Expected**: Graceful not-found handling, no crash.

### 4. Income summary equals the sum of captured-and-refunded orders only (User Story 3)

1. Open `/` and note the income summary figure.
2. Manually sum `amountInPiastres` for every order in `src/data/orders.ts` where `paymentState` is `"captured"` **or** `"refunded"`.
3. Confirm the two numbers match exactly, formatted the same way `formatPiastres` would render them.
4. Confirm no `authorized` or `voided` order's amount is included in that sum.

**Expected**: Exact match; captured-and-refunded inclusion, authorized/voided exclusion. (Satisfies SC-003; FR-005, FR-006.)

### 5. A captured-then-refunded order still counts toward income (Edge Case)

1. Identify the dummy order authored with `paymentState: "refunded"` — per data-model.md's IncomeSummary note, this dataset models each order with a single, final state, so a `"refunded"` order represents "was captured, then refunded."
2. Confirm that specific order's amount *is* included in the income summary shown (not subtracted back out) — i.e., the summary includes both `"captured"` and `"refunded"` orders, per FR-006.

**Expected**: Matches FR-006's "not net of refunds" rule as implemented (see research.md decision #7 for why the filter includes both `"captured"` and `"refunded"` states).

## Manual browser check

Use the project's installed `webapp-testing` skill to drive the above scenarios in a real browser (page load, console errors, navigation, responsive breakpoints at mobile/tablet/desktop widths) — see research.md decision #9. No automated test suite is part of this feature.
