---
description: "Task list template for feature implementation"
---

# Tasks: Kashier Checkout Demo

**Input**: Design documents from `/specs/002-kashier-checkout-demo/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/checkout-api.md](./contracts/checkout-api.md), [quickstart.md](./quickstart.md)

**Tests**: Mostly not included. This feature is fundamentally an external-integration smoke test — its real validation is the live Kashier sandbox walkthrough in quickstart.md (T019). The one exception is the piastres→decimal-string conversion (research.md §2), a pure function research.md explicitly calls out for unit coverage (T017).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Existing Next.js App Router project at `apps/ecommerce/`, plus the shared `packages/core/` workspace package, per [plan.md](./plan.md#project-structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the empty directories this feature's files will live in

- [X] T001 [P] Create directories: `apps/ecommerce/src/app/products/[id]/`, `apps/ecommerce/src/app/checkout/result/`, `apps/ecommerce/src/app/api/checkout/`, `apps/ecommerce/src/components/product/`, per plan.md Project Structure

**Checkpoint**: Directory structure exists; no code yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Environment configuration the payment flow depends on

- [X] T002 Add `KASHIER_TEST_SECRET_KEY`, `KASHIER_TEST_API_KEY`, `KASHIER_TEST_MERCHANT_ID` to `apps/ecommerce/.env.example` (create if missing), matching quickstart.md's prerequisites (research.md §8) — none may carry a `NEXT_PUBLIC_` prefix

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - View a product's detail page (Priority: P1)

**Goal**: A shopper can click a product on the homepage grid and land on a detail page showing that product's name, price, image, and a Buy Now action.

**Independent Test**: Click a product on the grid and confirm a detail page loads showing that product's name, price and image, independent of whether checkout works (spec.md User Story 1).

### Implementation for User Story 1

- [X] T003 [P] [US1] Create `ProductDetail` Server Component (image, name, price, category) in `apps/ecommerce/src/components/product/ProductDetail.tsx` (FR-002)
- [X] T004 [US1] Create the product detail page in `apps/ecommerce/src/app/products/[id]/page.tsx`, looking up the product by id from `apps/ecommerce/src/data/products.ts` and rendering `ProductDetail` (FR-001, FR-002, depends on T003)
- [X] T005 [US1] Create `apps/ecommerce/src/app/products/[id]/not-found.tsx` for an unknown product id (edge case: invalid product id, depends on T004)
- [X] T006 [US1] Link each product card to its detail page (`/products/<id>`) in `apps/ecommerce/src/components/home/ProductCard.tsx` (FR-001)

**Checkpoint**: The product detail page is browsable end to end — no payment yet.

---

## Phase 4: User Story 2 - Start checkout from the product detail page (Priority: P1)

**Goal**: Clicking Buy Now on a product's detail page creates a Kashier hosted checkout session for that product's price and sends the shopper there.

**Independent Test**: Click Buy Now on a product detail page and confirm the browser lands on the payment provider's hosted checkout page showing the correct amount, independent of what happens after (spec.md User Story 2).

### Implementation for User Story 2

- [X] T007 [P] [US2] Add `piastresToKashierAmount()` to `packages/core/src/kashier.ts` (research.md §2)
- [X] T008 [US2] Add `createPaymentSession()` to `packages/core/src/kashier.ts`, accepting `{ productId, amountInPiastres, merchantRedirect }` and building the `POST /v3/payment/sessions` request against `test-api.kashier.io` (research.md §1, depends on T007)
- [X] T009 [US2] Re-export `createPaymentSession` and `piastresToKashierAmount` from `packages/core/src/server.ts` only — never from `packages/core/src/index.ts` (CLAUDE.md secret-key package-boundary rule, depends on T008)
- [X] T010 [US2] Create the `POST /api/checkout` Route Handler in `apps/ecommerce/src/app/api/checkout/route.ts`: validate `productId` against `apps/ecommerce/src/data/products.ts`, load the `KASHIER_TEST_*` env vars (500 `misconfigured` if any are missing), call `createPaymentSession`, and return `{ url }` or the documented error responses (contracts/checkout-api.md, depends on T002, T009)
- [X] T011 [P] [US2] Create `BuyNowButton` Client Component in `apps/ecommerce/src/components/product/BuyNowButton.tsx`: POSTs to `/api/checkout`, redirects the browser to the returned `url` on success, shows an inline error on failure (FR-003, FR-004, FR-007, contracts/checkout-api.md)
- [X] T012 [US2] Add `BuyNowButton` to `ProductDetail` in `apps/ecommerce/src/components/product/ProductDetail.tsx` (depends on T003, T011)

**Checkpoint**: Clicking Buy Now reaches Kashier's hosted checkout page showing the correct amount.

---

## Phase 5: User Story 3 - See confirmation after a successful test payment (Priority: P1)

**Goal**: After completing a test-card payment, the shopper is returned to the storefront and sees a clear success confirmation naming the product, and the transaction is visible in Kashier's test dashboard.

**Independent Test**: Complete a test-card payment on the hosted checkout page and confirm the storefront shows a success page, independent of how the checkout session was created (spec.md User Story 3).

### Implementation for User Story 3

- [X] T013 [US3] Create `apps/ecommerce/src/app/checkout/result/page.tsx`: read Kashier's redirect search params, apply the defensive success/failure rule from research.md §3, and render a success view naming the purchased product when the outcome is success (FR-005)
- [X] T014 [US3] In `apps/ecommerce/src/app/api/checkout/route.ts`, construct `merchantRedirect` as an absolute URL to `/checkout/result`, derived from the incoming request's origin, and pass it to `createPaymentSession` (FR-004, depends on T010, T013)
- [X] T015 [US3] Add a dev-only log of the raw `checkout/result` search params in `apps/ecommerce/src/app/checkout/result/page.tsx`, per quickstart.md's "capture the redirect contract" step (research.md §3 verification task, depends on T013)

**Checkpoint**: A successful test payment shows a clear confirmation naming the product, and the transaction is verifiable in Kashier's test dashboard (SC-002, SC-004).

---

## Phase 6: User Story 4 - Return gracefully after a failed or cancelled payment (Priority: P2)

**Goal**: If the shopper cancels or a test payment fails, they see a clear failure message with a way to retry.

**Independent Test**: Cancel or fail a test payment on the hosted checkout page and confirm the storefront shows a clear failure page with a retry option, independent of the success path (spec.md User Story 4).

### Implementation for User Story 4

- [X] T016 [US4] Add the failure view to `apps/ecommerce/src/app/checkout/result/page.tsx` — shown whenever the defensive outcome parsing from research.md §3 does not detect success — with a link back to the product's detail page to retry (FR-006, edge case: missing/malformed return info, depends on T013)

**Checkpoint**: All four user stories are independently functional. The full happy-and-unhappy-path demo is complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against the spec and quickstart guide

- [X] T017 [P] Add a unit test for `piastresToKashierAmount()` in `packages/core` (research.md §2)
- [X] T018 [P] Run `pnpm lint` and `pnpm check-types` from the repo root and fix any issues
- [X] T019 Run the full [quickstart.md](./quickstart.md) validation walkthrough end-to-end against the real Kashier test sandbox — including capturing the actual `merchantRedirect` query string for both a success and a failure run, and correcting `checkout/result/page.tsx`'s parsing logic if reality differs from the research.md §3 assumption
  - Done. Along the way, found and fixed three real bugs only the live sandbox surfaced: a missing required `customer` field (research.md §1), `merchantRedirect` needing a tunnel since Kashier rejects `localhost` regardless of scheme (research.md §1, §8), and an unrelated env-loading footgun where an unescaped `$` in the Secret Key was silently corrupted by Next.js's `.env` variable expansion (research.md §8). User confirmed a real payment now completes end to end via the ngrok tunnel.
- [X] T020 [P] Verify no browser console errors and that the product detail and result pages render correctly on mobile and desktop viewports, using the `webapp-testing` skill, consistent with spec 001's validation approach

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: No dependency on Setup's directories in practice, but sequenced after for consistency — BLOCKS User Story 2 (T010 reads these env vars)
- **User Story 1 (Phase 3)**: Depends only on Setup (T001) — no dependency on payment infrastructure at all
- **User Story 2 (Phase 4)**: Depends on Foundational (T002) and on `ProductDetail` existing (T003) to attach the button to — independently testable via the Route Handler directly (contracts/checkout-api.md) even before T012 wires up the UI
- **User Story 3 (Phase 5)**: The result page itself (T013) has no dependency on US2; T014 (wiring the real `merchantRedirect`) depends on US2's Route Handler (T010) existing
- **User Story 4 (Phase 6)**: Depends on US3's `checkout/result/page.tsx` existing (T013) — both stories share one file, per research.md §3's single-route decision
- **Polish (Phase 7)**: Depends on all four user stories being complete

### Within Each User Story

- Component creation tasks (marked [P]) can run in parallel with each other
- Wiring tasks (attaching a component to a page, wiring a real URL into a request) happen last within each story
- Recommended build order: US1 → US2 → US3 → US4, since US3 depends on US2's Route Handler and US4 shares US3's file

### Parallel Opportunities

- T007 (money conversion) can run in parallel with US1's tasks (T003–T006) — different packages entirely
- T011 (`BuyNowButton`) can be built in parallel with T007–T010, since its only dependency is the already-documented `contracts/checkout-api.md`
- T017, T018, T020 (Polish) can run in parallel with each other

---

## Parallel Example: User Story 1 and User Story 2 setup

```bash
# These can run at the same time — different packages, no shared files:
Task: "Create ProductDetail component in apps/ecommerce/src/components/product/ProductDetail.tsx"
Task: "Add piastresToKashierAmount() to packages/core/src/kashier.ts"
Task: "Create BuyNowButton component in apps/ecommerce/src/components/product/BuyNowButton.tsx"
```

---

## Implementation Strategy

### MVP for this milestone (User Stories 1, 2 and 3)

Issue #38's own "done when" is: Buy → Kashier hosted checkout → test payment lands, verifiable in Kashier's test dashboard. That is US1 + US2 + US3, not just US1.

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 — validate the PDP loads correctly
4. Complete Phase 4: User Story 2 — validate Buy Now reaches Kashier with the right amount
5. Complete Phase 5: User Story 3 — validate a real test payment succeeds and appears in Kashier's dashboard
6. **STOP and VALIDATE**: at this point issue #38 is demonstrably done
7. Complete Phase 6: User Story 4 for a demo that doesn't dead-end on a declined card

### Incremental Delivery

1. Setup + Foundational → environment ready
2. Add US1 → validate independently → PDP browsable
3. Add US2 → validate independently → Buy Now reaches Kashier
4. Add US3 → validate independently → **milestone complete**, money visibly lands
5. Add US4 → validate independently → graceful failure handling
6. Polish → automated checks plus the real sandbox walkthrough

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Money stays integer piastres end-to-end; the one deliberate float conversion (T007) happens exactly once, at the Kashier request boundary
- `createPaymentSession` and its re-export (T008, T009) must never be reachable from `packages/core/src/index.ts` — that is the browser-safe entry
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
