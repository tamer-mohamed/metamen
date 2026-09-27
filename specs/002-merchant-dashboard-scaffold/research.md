# Phase 0 Research: Merchant Dashboard Scaffold

No `NEEDS CLARIFICATION` markers remained in the Technical Context — the tech stack is fixed by matching the existing `apps/ecommerce` scaffold, and the feature's own scope (dummy-data dashboard) resolves the rest via the spec's Assumptions. The research below covers the technology/pattern choices needed to implement the spec's requirements idiomatically.

## 1. New app scaffold shape

**Decision**: Scaffold `apps/merchant-dashboard` as a byte-for-byte structural match of `apps/ecommerce`'s config: same Next.js/React versions, same `package.json` script names (`dev`, `build`, `start`, `lint`, `check-types`), same `tsconfig.json` compiler options and `@/*` path alias, same `eslint.config.mjs` (`eslint-config-next` core-web-vitals + typescript), same `postcss.config.mjs` (`@tailwindcss/postcss`), same `next.config.ts` shape (`reactCompiler: true`).

**Rationale**: The issue asks for the new app to be "wired into the existing `build`/`lint`/`check-types`/`dev` tasks" — Turborepo's task graph (`turbo.json`) already defines these tasks generically for any workspace package, so matching script names is what makes `turbo run build`/etc. pick the new app up with zero `turbo.json` changes. Matching the rest of the scaffold keeps the two apps consistent and avoids relitigating tooling choices already made for `apps/ecommerce`.

**Alternatives considered**: A different frontend framework or a lighter static-site tool — rejected; the workspace is a Next.js monorepo and the issue explicitly says "New `apps/merchant-dashboard` Next.js app." Copying `apps/ecommerce`'s `package.json` dependency versions exactly (rather than letting a scaffolding tool pick latest) — chosen, to avoid two different Next.js/React versions coexisting in one Turborepo, which would risk duplicate-dependency build/type issues.

## 2. Dev server port

**Decision**: Set the new app's `dev` script to `next dev --port 3001` (or the project's next available convention), instead of the default `3000`.

**Rationale**: `apps/ecommerce`'s `dev` script already binds the Next.js default port 3000. Because `pnpm dev` runs `turbo run dev`, which runs every app's persistent `dev` task concurrently, two apps both defaulting to port 3000 would collide the moment both are running. Giving the new app an explicit, different port lets a developer run the whole workspace with one `pnpm dev` and reach both apps simultaneously.

**Alternatives considered**: Leaving both apps on the default port and relying on Next.js's automatic "port already in use, trying next port" fallback — rejected; it's non-deterministic across machines/CI and makes the quickstart guide's URL unreliable.

## 3. Routing shape: one dashboard route + one dynamic detail route

**Decision**: Use the App Router with two routes: `/` renders the income summary and the orders list together, and `/orders/[orderId]` renders a single order's detail, using Next.js's dynamic segment convention.

**Rationale**: The spec's three user stories (list, detail, income summary) don't imply three separate pages — a merchant dashboard's natural "home" view is summary-plus-list together (SC-001 asks for both visible "within a few seconds of opening the dashboard"), with detail as a drill-down. A dynamic `[orderId]` segment is the idiomatic Next.js App Router mechanism for "select one item from a list, view its detail," satisfying SC-002 ("single selection action") via a plain link/navigation with no client-side routing library.

**Alternatives considered**: A client-side modal/drawer for order detail instead of a real route — rejected; a real route gives every order a shareable, bookmarkable, directly-loadable URL for free and needs no extra state-management code, more in line with "don't add abstraction beyond what the task requires." Three fully separate top-level pages (summary, list, detail) — rejected; splitting summary and list into separate navigations would fail SC-001's "within a few seconds of opening the dashboard" framing, which reads as one landing view.

## 4. Order detail identification (FR-004's "unambiguous order reference")

**Decision**: Each dummy order gets a stable, human-readable `id` (e.g., `"ord-1001"`), which is both the dataset's lookup key and the value shown in the detail view as the order reference, and is the `[orderId]` route segment.

**Rationale**: Reuses one identifier for storage, routing, and display — no separate "display reference" vs. "internal id" distinction is needed for a dummy dataset with no real persistence layer, keeping FR-004 satisfied with the simplest possible mechanism.

**Alternatives considered**: A numeric-only id with a separately formatted "order number" for display — rejected as unneeded complexity for a static, hand-authored dataset with no real order-numbering system behind it yet.

## 5. Dummy data source and shape

**Decision**: Define dummy orders as a typed static array exported from `src/data/orders.ts`, imported directly by Server Components — no `fetch`, no API route, no external file format. Mirrors `apps/ecommerce/src/data/products.ts` exactly (`export const orders: Order[] = [...]`).

**Rationale**: Matches FR-007 ("driven entirely by a static, hand-authored dummy dataset... no live order persistence or external order source") with the simplest possible mechanism, and matches the sibling app's established pattern so the two apps stay easy to cross-reference.

**Alternatives considered**: A local JSON file loaded via `fetch()` or `fs.readFile` — rejected as unnecessary indirection with weaker type-checking than a typed TS module. A Next.js Route Handler (`app/api/orders/route.ts`) serving mock JSON — rejected; introduces a backend-shaped layer FR-007 explicitly excludes at this phase (that's `#39`'s job later).

## 6. Money representation and formatting

**Decision**: Reuse `@metamen/core`'s existing `Piastres` type and `formatPiastres()` helper (its browser-safe root entry) for every order amount and for the income summary total, rather than defining a second money type inside the new app.

**Rationale**: `CLAUDE.md`'s project-wide rule ("All money is stored and computed in integer piastres, never floats") is already codified in `packages/core/src/money.ts`, including EGP currency formatting via `Intl.NumberFormat`. Reusing it keeps the two apps' money handling identical and gets locale-correct formatting for free. Only the root entry is needed — no capture/void/refund/server-key operation happens in this feature, so the `/server` entry is never imported, consistent with the client/server boundary `@metamen/core` enforces.

**Alternatives considered**: Storing/display amounts as plain numbers or strings formatted ad hoc in the new app — rejected; duplicates logic that already exists and risks drifting from the project-wide integer-piastre convention.

## 7. Income summary calculation

**Decision**: Implement the income summary as a small, pure, independently-callable function — `getIncomeSummaryInPiastres(orders: Order[]): Piastres` in `src/lib/income-summary.ts` — that filters to orders whose `paymentState` is `"captured"` **or** `"refunded"` and sums `amountInPiastres`, called from the `/` page and rendered via `IncomeSummaryCard`.

**Rationale**: FR-005/FR-006 describe actual business logic, not pure presentation. The inclusion rule is not simply "state equals captured" — a `"refunded"` order represents money that *was* captured and later returned to the customer, and FR-006 requires that its amount still counts (the summary is not net of later refunds). Since this dataset models each order with a single, final `paymentState` rather than a full transition history, `"refunded"` is the dataset's way of representing "was captured, then refunded" — so the filter must include both `"captured"` and `"refunded"` to satisfy FR-006. `"authorized"` and `"voided"` orders never reached the captured state (a void releases a hold before any money is captured — see `CLAUDE.md`'s Kashier capture/void/refund notes) and so correctly contribute nothing. Isolating this in a pure function keeps the (slightly non-obvious) two-state inclusion rule in exactly one place, makes SC-003 ("verifiable by manual calculation") trivial to eyeball or later cover with a unit test, and keeps `IncomeSummaryCard` itself a thin rendering component.

**Alternatives considered**: Filtering on `paymentState === "captured"` only — rejected; this was the initial (incorrect) reading and directly contradicts FR-006/US3's acceptance scenario 2, which requires a captured-then-refunded order's amount to remain in the total. Inlining the filter/reduce directly inside the page/component JSX — rejected; scatters the one business rule that must stay correct across rendering code, making it easier to accidentally get wrong during future edits.

## 8. Visual distinction of payment states

**Decision**: A single small `PaymentStateBadge` component maps each of the four fixed `PaymentState` values to a distinct label/color treatment (e.g., using Tailwind utility classes for each state), used in both the orders list and the detail view.

**Rationale**: The spec's edge cases require voided/refunded orders to be "clearly shown, distinct from authorized and captured," and the acceptance scenarios require a merchant to "visually distinguish" all four states. One shared component used in both places guarantees the list and detail views can't visually disagree about what a given state looks like.

**Alternatives considered**: Duplicating state-to-label/color logic separately in the list row and the detail view — rejected; duplicated mapping is exactly the kind of drift a shared component avoids for free.

## 9. Validation approach

**Decision**: Validate the implemented dashboard manually using the project's installed `webapp-testing` skill (Playwright-driven): load `/`, confirm the orders list and income summary render, confirm all four payment states are visually distinguishable, navigate into an order's detail and back, and check responsive breakpoints. No automated test suite is authored for the UI.

**Rationale**: Matches the Testing decision in Technical Context and mirrors spec 001's precedent for `apps/ecommerce` — the project has no test framework configured in any app yet, and adding one for this feature alone would be disproportionate. The one piece of real logic (the income summary calculation) is isolated into a pure function (`getIncomeSummaryInPiastres`, decision #7) specifically so it *could* be unit-tested later without a rewrite, even though no test framework is being introduced now.

**Alternatives considered**: Introducing a unit test framework (e.g., Vitest) just to cover `getIncomeSummaryInPiastres` — rejected for this feature; worth reconsidering workspace-wide once more business logic (beyond dummy-data scaffolding) lands, per `#39` and later phases.
