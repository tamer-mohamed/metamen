---

description: "Task list for Merchant Dashboard Scaffold (Orders List, Order Detail, Income Summary)"
---

# Tasks: Merchant Dashboard Scaffold (Orders List, Order Detail, Income Summary)

**Input**: Design documents from `/specs/002-merchant-dashboard-scaffold/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (all present; no `contracts/` — this feature exposes no external API/CLI)

**Tests**: Not requested in the feature specification. No test-writing tasks are included; validation is via `quickstart.md`'s manual/browser scenarios (see Polish phase).

**Organization**: Tasks are grouped by user story (from spec.md: US1 = P1 orders list, US2 = P2 order detail, US3 = P3 income summary) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes its exact file path(s)

## Path Conventions

New sibling app in the existing Turborepo monorepo: `apps/merchant-dashboard/` (structured identically to `apps/ecommerce/`, per plan.md's Project Structure). All paths below are relative to the repo root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the new `apps/merchant-dashboard` app so it builds, lints, type-checks, and runs under the existing Turborepo pipeline, matching `apps/ecommerce`'s scaffold (research.md decision #1).

- [X] T001 Create `apps/merchant-dashboard/package.json` — name `"merchant-dashboard"`, scripts `dev` (`"next dev --port 3001"`, per research.md decision #2), `build` (`"next build"`), `start` (`"next start"`), `lint` (`"eslint"`), `check-types` (`"tsc --noEmit"`); dependencies `next@16.3.5`, `react@19.2.8`, `react-dom@19.2.8`, `@metamen/core@workspace:*`; devDependencies matching `apps/ecommerce/package.json` (`@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `babel-plugin-react-compiler`, `eslint`, `eslint-config-next`, `tailwindcss`, `typescript`)
- [X] T002 [P] Create `apps/merchant-dashboard/tsconfig.json` matching `apps/ecommerce/tsconfig.json` (same `compilerOptions`, `@/*` path alias to `./src/*`, same `include`/`exclude`)
- [X] T003 [P] Create `apps/merchant-dashboard/eslint.config.mjs` matching `apps/ecommerce/eslint.config.mjs` (`eslint-config-next` core-web-vitals + typescript, same `globalIgnores`)
- [X] T004 [P] Create `apps/merchant-dashboard/postcss.config.mjs` matching `apps/ecommerce/postcss.config.mjs` (`@tailwindcss/postcss` plugin)
- [X] T005 [P] Create `apps/merchant-dashboard/next.config.ts` matching `apps/ecommerce/next.config.ts`'s shape (`reactCompiler: true`)
- [X] T006 [P] Add a placeholder favicon asset at `apps/merchant-dashboard/public/favicon.ico`
- [X] T007 Create `apps/merchant-dashboard/src/app/globals.css` — Tailwind entry, matching `apps/ecommerce/src/app/globals.css`
- [X] T008 Create `apps/merchant-dashboard/src/app/layout.tsx` — root layout with `Metadata` (title/description identifying this as the merchant dashboard demo), fonts, and a fixed demo merchant identity label in the page shell (FR-009: no login/account-switching)

**Checkpoint**: `pnpm --filter merchant-dashboard dev` serves an empty-but-running Next.js app on port 3001.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, dummy dataset, and shared components that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T009 Create `apps/merchant-dashboard/src/types/order.ts` — export `type PaymentState = "authorized" | "captured" | "voided" | "refunded"` and `type Order = { id: string; productName: string; amountInPiastres: Piastres; paymentState: PaymentState; orderDate: string }`, importing `Piastres` from `@metamen/core` (data-model.md)
- [X] T010 [P] Create `apps/merchant-dashboard/src/data/orders.ts` — static dummy dataset (`export const orders: Order[]`) of ~8-12 hand-authored orders with unique `id`s, covering all four `PaymentState` values at least once each (FR-008), plus `export function findOrderById(id: string): Order | undefined` (depends on T009)
- [X] T011 [P] Create `apps/merchant-dashboard/src/components/dashboard/PaymentStateBadge.tsx` — maps each of the 4 `PaymentState` values to a distinct label/color treatment (Tailwind classes), used by both the list and detail views (research.md decision #8; depends on T009)
- [X] T012 [P] Create `apps/merchant-dashboard/src/components/layout/DashboardShell.tsx` — page shell/nav wrapper (used by both routes) displaying the fixed demo merchant identity label (FR-009)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Browse the orders list (Priority: P1) 🎯 MVP

**Goal**: A merchant opens the dashboard and sees every order with its product, amount, payment state, and date, with all four payment states visually distinguishable.

**Independent Test**: Load `/` and confirm a row renders for every order in the dummy dataset, each showing product/amount/state/date, with the four payment states visually distinct (quickstart.md scenario 1).

### Implementation for User Story 1

- [X] T013 [P] [US1] Create `apps/merchant-dashboard/src/components/dashboard/OrderRow.tsx` — renders one order's product, amount (via `formatPiastres` from `@metamen/core`), payment state (via `PaymentStateBadge`), and order date, as a link to `/orders/[id]` (FR-002; depends on T009, T011)
- [X] T014 [US1] Create `apps/merchant-dashboard/src/components/dashboard/OrdersList.tsx` — renders an `OrderRow` for every order passed in (FR-002; depends on T013)
- [X] T015 [US1] Implement `apps/merchant-dashboard/src/app/page.tsx` (`/` route) — imports `orders` from `src/data/orders.ts`, renders `DashboardShell` wrapping `OrdersList` (FR-002, FR-006 partially via FR-009's shell; depends on T010, T012, T014)

**Checkpoint**: User Story 1 is fully functional and testable independently — `/` shows the complete orders list.

---

## Phase 4: User Story 2 - Drill into an order's detail (Priority: P2)

**Goal**: A merchant selects an order and sees a detail view unambiguously identifying and describing that single order; an unknown order reference shows a clear not-found state.

**Independent Test**: Navigate to `/orders/[orderId]` for any dummy order and confirm the detail view matches that order; navigate to `/orders/does-not-exist` and confirm a not-found state, not a crash (quickstart.md scenarios 2 and 3).

### Implementation for User Story 2

- [X] T016 [P] [US2] Create `apps/merchant-dashboard/src/components/dashboard/OrderDetail.tsx` — renders a single order's product, amount (via `formatPiastres`), payment state (via `PaymentStateBadge`), order date, and its `id` as the unambiguous order reference (FR-004; depends on T009, T011)
- [X] T017 [US2] Implement `apps/merchant-dashboard/src/app/orders/[orderId]/page.tsx` — reads the `orderId` route param, looks it up via `findOrderById` from `src/data/orders.ts`, calls Next.js `notFound()` when no match exists, otherwise renders `DashboardShell` wrapping `OrderDetail` (FR-003, FR-004, Edge Case: unknown reference; depends on T010, T012, T016)

**Checkpoint**: User Stories 1 AND 2 both work independently — selecting a row from `/` reaches a correct, matching detail page.

---

## Phase 5: User Story 3 - See the income summary (Priority: P3)

**Goal**: A merchant sees a single income figure equal to the sum of `captured`-and-`refunded` order amounts, excluding `authorized`/`voided` orders, unaffected by a later refund subtracting the amount back out.

**Independent Test**: Compare the displayed figure against a manual sum of `captured` + `refunded` order amounts in `src/data/orders.ts`; confirm a captured-then-refunded order's amount is still included (quickstart.md scenarios 4 and 5).

### Implementation for User Story 3

- [X] T018 [P] [US3] Create `apps/merchant-dashboard/src/lib/income-summary.ts` — export `function getIncomeSummaryInPiastres(orders: Order[]): Piastres` that sums `amountInPiastres` for every order whose `paymentState` is `"captured"` or `"refunded"`, returning `0` when none match (FR-005, FR-006; depends on T009)
- [X] T019 [US3] Create `apps/merchant-dashboard/src/components/dashboard/IncomeSummaryCard.tsx` — calls `getIncomeSummaryInPiastres` and renders the result via `formatPiastres`, including a clear zero-total display when the sum is `0` (FR-005; Edge Case: zero captured orders; depends on T018)
- [X] T020 [US3] Wire `IncomeSummaryCard` into `apps/merchant-dashboard/src/app/page.tsx`, rendered above `OrdersList` (FR-005; depends on T015 from US1, T019)

**Checkpoint**: All three user stories are independently functional — `/` shows income summary + orders list, and order detail works from either the list or a direct URL.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the new app is correctly wired into the monorepo and validate the whole feature end-to-end.

- [X] T021 Verify `apps/merchant-dashboard/package.json`'s script names (`dev`/`build`/`lint`/`check-types`) match `turbo.json`'s generic task names, so `pnpm build`/`pnpm lint`/`pnpm check-types`/`pnpm dev` from the repo root pick up the new app with zero `turbo.json` changes
- [X] T022 [P] Confirm zero imports of `@metamen/core/server` anywhere under `apps/merchant-dashboard/src` (grep check) — this feature must only ever use the browser-safe root entry (`CLAUDE.md`'s secrets/client-boundary rule)
- [X] T023 Run all `quickstart.md` validation scenarios end-to-end against `apps/merchant-dashboard` using the project's installed `webapp-testing` skill (page load, console errors, list → detail navigation, responsive breakpoints) — `specs/002-merchant-dashboard-scaffold/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational only — independently buildable/testable via direct URL navigation, with no code dependency on US1 (though its "select from the list" acceptance scenario is best exercised end-to-end once US1 exists).
- **User Story 3 (Phase 5)**: Depends on Foundational, **and** on US1's `src/app/page.tsx` (T015) for T020's integration point, since the income summary and orders list share the same `/` route by design (plan.md's routing decision). T018/T019 (the summary logic and card component) have no such dependency and could be built in parallel with US1/US2.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Parallel Opportunities

- Setup: T002, T003, T004, T005, T006 can all run in parallel (independent config files).
- Foundational: T010, T011, T012 can all run in parallel once T009 is done.
- US1: T013 can start immediately (foundational deps only); T014 depends on T013; T015 depends on T014 + T010 + T012.
- US2: T016 can start immediately (foundational deps only, in parallel with any US1 task); T017 depends on T016 + T010 + T012.
- US3: T018 can start immediately (foundational deps only, in parallel with US1/US2); T019 depends on T018; T020 depends on T019 **and** T015 (US1 must be done first for this one integration task).
- Polish: T022 can run in parallel with T021; T023 should run last, after both.

---

## Parallel Example: Foundational Phase

```bash
# After T009 (types) completes, launch these together:
Task: "Create apps/merchant-dashboard/src/data/orders.ts dummy dataset + findOrderById"
Task: "Create apps/merchant-dashboard/src/components/dashboard/PaymentStateBadge.tsx"
Task: "Create apps/merchant-dashboard/src/components/layout/DashboardShell.tsx"
```

## Parallel Example: User Stories 1 & 2 (after Foundational)

```bash
Task: "Create apps/merchant-dashboard/src/components/dashboard/OrderRow.tsx"       # US1 (T013)
Task: "Create apps/merchant-dashboard/src/components/dashboard/OrderDetail.tsx"    # US2 (T016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Load `/`, confirm the full orders list renders with all four payment states distinguishable (quickstart.md scenario 1)
5. Demo if ready — this alone proves the dashboard scaffold and dummy dataset

### Incremental Delivery

1. Setup + Foundational → app runs, empty shell
2. Add User Story 1 → orders list visible → demo (MVP)
3. Add User Story 2 → order detail reachable → demo
4. Add User Story 3 → income summary visible → demo (full issue #40 scope complete)
5. Polish → confirm monorepo wiring, secrets boundary, and run full quickstart validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- No test-writing tasks: tests were not requested in spec.md; correctness is validated via `quickstart.md`'s manual scenarios (T023)
- The income summary's inclusion rule (`captured` **and** `refunded`, not `captured` alone) was corrected during task generation — see research.md decision #7 and data-model.md's IncomeSummary section for the reasoning; T018 implements the corrected rule directly
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
