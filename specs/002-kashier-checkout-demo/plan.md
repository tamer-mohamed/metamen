# Implementation Plan: Kashier Checkout Demo

**Branch**: `002-kashier-checkout-demo` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-kashier-checkout-demo/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a product detail page to `apps/ecommerce` with a Buy Now action that creates a Kashier hosted Payment Session (test mode, our own account, auto-capture) and redirects the shopper to it. On return, one result route reads Kashier's redirect and shows a success or failure view. No cart, no persistence, no webhooks — the browser round-trip plus the transaction appearing in Kashier's test dashboard is the whole proof.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.3.5 (App Router), React 19.2.8 — same stack as the existing `apps/ecommerce`

**Primary Dependencies**: Next.js 16.3.5, React 19.2.8, Tailwind CSS 4, `@metamen/core` (workspace). No new npm dependency — the Kashier call is a single `fetch` from a Route Handler.

**Storage**: N/A — per spec, no order or checkout-session persistence. The only state that survives the redirect round-trip is whatever Kashier itself returns in the `merchantRedirect` query string.

**Testing**: Manual/visual validation via the project's `webapp-testing` skill, consistent with spec 001. The piastres→decimal-string conversion at the Kashier request boundary is a pure function and gets a small unit test; everything else is fundamentally "does this round-trip against Kashier's real sandbox," which only a live sandbox run can prove (this is SC-004's whole point).

**Target Platform**: Web browser + Next.js server runtime (Route Handler), local dev only (`pnpm dev`), talking to `test-api.kashier.io`

**Project Type**: Existing single Next.js app (`apps/ecommerce`), extended with one new server-only export in `packages/core`

**Performance Goals**: Buy Now → hosted checkout page in under 3s of active navigation (SC-001)

**Constraints**: No cart, no persistence, no webhook handling, no capture/void/refund, no Connected Accounts (per spec Assumptions and issue #38's explicit out-of-scope list). Per `CLAUDE.md`, session creation MUST use `POST /v3/payment/sessions` (no hash) — never the Direct API (`Kashier-Hash`) path. Secrets never `NEXT_PUBLIC_`-prefixed.

**Scale/Scope**: One new package export (`packages/core/src/kashier.ts`), one Route Handler, one new page route family (`products/[id]`, `checkout/result`) in `apps/ecommerce`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no ratified project-wide gates exist. Proceeding under Spec Kit's simplicity default and this repo's own `CLAUDE.md` rules (money as integer piastres; secrets never `NEXT_PUBLIC_`; Kashier's hosted-checkout auth scheme, not the Direct API/hash scheme; secret-key operations live in `@metamen/core/server`, never the browser-safe entry).

This plan adds zero new npm dependencies and one new architectural seam (`@metamen/core/server`'s Kashier client), which is required by `CLAUDE.md`'s existing browser/server split rather than being new complexity introduced by this feature.

**Result**: PASS.

**Post-Phase-1 re-check**: The Phase 0/1 design (research.md, data-model.md, contracts/, quickstart.md) introduces one new file (`packages/core/src/kashier.ts`) inside an already-existing package boundary, one Route Handler, and no new dependencies. Still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-kashier-checkout-demo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

Unlike spec 001, this feature does expose an interface worth contracting: the Route Handler the Buy Now button calls, plus the external Kashier request/response shape it wraps. See `contracts/`.

### Source Code (repository root)

```text
packages/core/src/
├── money.ts               # existing — Piastres, formatPiastres, etc. (unchanged)
├── kashier.ts              # NEW — createPaymentSession(), request/response types, piastres→decimal-string conversion
├── index.ts                 # existing, unchanged — kashier.ts is NOT exported here (secret-key operation)
└── server.ts                # updated — re-exports createPaymentSession from kashier.ts

apps/ecommerce/src/
├── app/
│   ├── page.tsx                          # existing homepage — unchanged
│   ├── products/[id]/
│   │   ├── page.tsx                       # NEW — product detail page (US1)
│   │   └── not-found.tsx                  # NEW — invalid product id edge case
│   ├── checkout/result/
│   │   └── page.tsx                       # NEW — single route Kashier's merchantRedirect points to; renders success or failure view depending on what Kashier returns (US3, US4)
│   └── api/checkout/
│       └── route.ts                       # NEW — POST handler: builds the session request via @metamen/core/server, calls Kashier, returns { url } or an error (US2)
├── components/product/
│   ├── ProductDetail.tsx                  # NEW — Server Component: image, name, price, category
│   └── BuyNowButton.tsx                   # NEW — Client Component: calls /api/checkout, redirects on success, shows an inline error otherwise (FR-007)
└── (existing home/, layout/, data/, types/ — unchanged; products/[id]/page.tsx reads the same src/data/products.ts)
```

**Structure Decision**: Extends the existing single Next.js App Router project. The one new shared-logic seam is `packages/core/src/kashier.ts`, exported only from `@metamen/core/server` — consistent with `CLAUDE.md`'s existing browser/server package-boundary rule, not a new pattern invented for this feature. Route Handler stays thin (env vars in, `@metamen/core/server` call, response out); page/component code stays free of Kashier request-shape knowledge.

## Complexity Tracking

*No violations — table omitted per Constitution Check result.*
