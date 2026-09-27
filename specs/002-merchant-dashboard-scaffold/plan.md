# Implementation Plan: Merchant Dashboard Scaffold (Orders List, Order Detail, Income Summary)

**Branch**: `002-merchant-dashboard-scaffold` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-merchant-dashboard-scaffold/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Scaffold a new `apps/merchant-dashboard` Next.js app in the Turborepo workspace, wired into the existing `build`/`lint`/`check-types`/`dev` tasks (mirroring `apps/ecommerce`'s scaffold exactly). It renders a dashboard driven entirely by a static, hand-authored dummy order dataset (`src/data/orders.ts`, mirroring `apps/ecommerce/src/data/products.ts`): a home route showing an income summary card plus the full orders list, and a per-order detail route. The income summary sums `captured` and `refunded` orders (both represent money that was captured at some point), excluding `authorized` and `voided` orders, and is never reduced back down when an order is later refunded. No real persistence, no auth, no Kashier API calls — this is UI scaffolding against dummy data only.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.3.5 (App Router), React 19.2.8 — same stack as `apps/ecommerce`, no version drift within the workspace

**Primary Dependencies**: Next.js 16.3.5, React 19.2.8, Tailwind CSS 4, `@metamen/core` (workspace package) — its browser-safe root entry only, for the `Piastres` type and `formatPiastres` helper; no new external dependencies

**Storage**: N/A — dummy orders are a static, typed module in the repo (`src/data/orders.ts`); no database, no backend, no calls to Kashier's API

**Testing**: Manual/visual validation via the project's installed `webapp-testing` skill (Playwright-driven: page load, console errors, navigating list → detail, responsive breakpoints) — consistent with `apps/ecommerce`'s precedent (spec 001). No automated test suite is added; see research.md for why the income-summary calculation still stays safe without one

**Target Platform**: Web browser, desktop and mobile viewport widths, served by the Next.js local dev server (`pnpm dev` via Turborepo)

**Project Type**: Web application — new sibling app inside the existing Turborepo monorepo (`apps/merchant-dashboard`), not a modification of `apps/ecommerce`

**Performance Goals**: Dashboard (income summary + orders list) visible within a few seconds of navigating to it (SC-001); order detail reachable in a single selection/navigation from the list (SC-002)

**Constraints**: No real order persistence, no live Kashier calls, no auth/login flow, no fulfillment status, no analytics/filtering/export (FR-007, FR-009, FR-010) — this is a dummy-data UI scaffold only, per issue #40's explicit phasing

**Scale/Scope**: Two routes (`/` for income summary + orders list, `/orders/[orderId]` for detail), one static dataset of ~8-12 hand-authored orders covering all four payment states

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (no ratified principles yet) — there are no formal project gates from it to check against. The repo-wide `CLAUDE.md` rules still apply as project-level constraints:

- **Money as integer piastres**: satisfied by reusing `@metamen/core`'s existing `Piastres` type and `formatPiastres` helper for every order amount and the income summary total, rather than introducing a second money representation.
- **Secrets / `@metamen/core/server` boundary**: not implicated — this feature makes no capture/void/refund calls and never imports the `/server` entry; only the browser-safe root entry (`Piastres`, `formatPiastres`) is used.
- **Metamen never custodies merchant Kashier credentials / webhook rules / payment vs. fulfillment state machines**: not implicated — no Kashier API calls, no webhooks, and no live payment state transitions happen in this feature. The dummy dataset's `paymentState` field is static, hand-authored data, not a live state machine.
- **"We do not rebuild payment acceptance"**: not implicated — this is an internal orchestration-side dashboard (viewing orders/income), not a checkout/payment-acceptance surface.

Beyond `CLAUDE.md`, Spec Kit's general defaults apply: avoid unnecessary abstraction, don't add a backend/test framework/dependency the spec doesn't require. This plan introduces one new app (justified below in Complexity Tracking, since it's an explicit, spec-mandated new project) but zero new external dependencies and zero new architectural layers (no API routes, no state management library, no test framework) beyond what `apps/ecommerce` already established.

**Result**: PASS (one expected new-app addition, explicitly required by the spec and issue; no other violations to justify).

**Post-Phase-1 re-check**: The Phase 0/1 design (research.md, data-model.md, quickstart.md) introduces zero additional new dependencies and zero additional architectural layers beyond the new app itself — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-merchant-dashboard-scaffold/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no API, CLI, or other machine-readable interface to other systems — it's a self-contained UI app whose only "interface" is its own Next.js routes, which are documented in the Source Code layout and quickstart.md instead.

### Source Code (repository root)

```text
apps/merchant-dashboard/
├── package.json              # name "merchant-dashboard", same dev/build/start/lint/check-types scripts as apps/ecommerce
├── next.config.ts            # same base config pattern as apps/ecommerce (reactCompiler: true)
├── tsconfig.json              # same compilerOptions/paths pattern as apps/ecommerce
├── eslint.config.mjs          # same eslint-config-next (core-web-vitals + typescript) as apps/ecommerce
├── postcss.config.mjs         # @tailwindcss/postcss, same as apps/ecommerce
├── public/                    # static assets (favicon, etc.)
└── src/
    ├── app/
    │   ├── layout.tsx          # root layout: dashboard shell/nav, demo merchant identity label (FR-009)
    │   ├── globals.css         # Tailwind entry, same pattern as apps/ecommerce
    │   ├── page.tsx             # "/" route: income summary + orders list (FR-002, FR-005, FR-006)
    │   └── orders/
    │       └── [orderId]/
    │           └── page.tsx     # "/orders/[orderId]" route: order detail (FR-003, FR-004)
    ├── components/
    │   ├── dashboard/
    │   │   ├── IncomeSummaryCard.tsx   # renders the income summary figure (FR-005, FR-006)
    │   │   ├── OrdersList.tsx          # renders the full orders list/table (FR-002)
    │   │   ├── OrderRow.tsx            # single row: product, amount, payment state, date (FR-002)
    │   │   ├── OrderDetail.tsx         # single-order detail view (FR-004)
    │   │   └── PaymentStateBadge.tsx   # visually distinguishes the 4 payment states (Edge Cases)
    │   └── layout/
    │       └── DashboardShell.tsx      # page shell/nav wrapping both routes
    ├── data/
    │   └── orders.ts            # static dummy dataset, ≥1 order per payment state (FR-008)
    ├── lib/
    │   └── income-summary.ts    # pure function: sum captured-and-refunded order amounts (FR-005, FR-006)
    └── types/
        └── order.ts              # Order, PaymentState types (Key Entities)
```

**Structure Decision**: New sibling app under `apps/`, structured identically to `apps/ecommerce` (App Router, `src/app` + `src/components` + `src/data` + `src/types`), plus one addition — `src/lib/income-summary.ts` — to keep the income-summary calculation (real business logic, not just presentation) as a small, isolated, pure function separate from rendering, per FR-005/FR-006. Two routes: `/` combines the income summary and orders list (a merchant's natural "landing" view), and `/orders/[orderId]` is a dynamic detail route reached by selecting a row, satisfying SC-002 ("single selection action").

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `apps/merchant-dashboard` project (a second app in the monorepo) | Issue #40 explicitly scopes this as "New `apps/merchant-dashboard` Next.js app in the Turborepo workspace" — a merchant-facing surface with a different audience, routes, and eventual auth model than the customer-facing `apps/ecommerce` storefront | Adding dashboard routes inside `apps/ecommerce` was rejected: it would mix a customer storefront and a merchant back-office under one app/auth boundary, which the issue and the project's phased Kashier/merchant-onboarding model (separate merchant identity, Phase 3 real auth) both treat as distinct surfaces |
