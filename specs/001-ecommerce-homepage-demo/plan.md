# Implementation Plan: Ecommerce Homepage Demo

**Branch**: `001-ecommerce-homepage-demo` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ecommerce-homepage-demo/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a single static homepage for a demo ecommerce storefront on top of the already-scaffolded Next.js app: a header with branding/nav, a hero banner, a responsive grid of sample products (image, name, price) backed by static placeholder data, and a footer. No backend, database, cart, checkout, or deployment — runs locally via `pnpm dev` only.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.3.5 (App Router), React 19.2.8

**Primary Dependencies**: Next.js 16.3.5, React 19.2.8, Tailwind CSS 4 (already in `package.json` from scaffold) — no new dependencies required

**Storage**: N/A — sample product data is a static, typed module in the repo (`src/data/products.ts`); no database, no backend

**Testing**: Manual/visual validation via the project's installed `webapp-testing` skill (Playwright-driven browser checks: page load, console errors, responsive breakpoints, image fallback). No unit/integration test suite — disproportionate to a static demo page with no business logic

**Target Platform**: Web browser, desktop and mobile viewport widths, served by the Next.js local dev server (`pnpm dev`)

**Project Type**: Single web application (frontend-only; no separate backend project)

**Performance Goals**: Homepage visible within ~10s of dev server start (SC-001); high score (90+) on standard web performance/best-practice audits (SC-004)

**Constraints**: No backend, database, or external API (FR-004); no deployment configuration (FR-009); no functional cart/checkout/auth (FR-008)

**Scale/Scope**: One route (`/`), ~6-8 sample products, no auth/cart/checkout — homepage only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (no ratified principles yet) — there are no formal project gates to check against. Proceeding under Spec Kit's general defaults: avoid unnecessary abstraction, don't add a backend/test framework/dependency the spec doesn't require. This plan introduces zero new dependencies and zero new architectural layers (no API routes, no state management library, no test framework), which trivially satisfies a "keep it simple" default.

**Result**: PASS (no violations to justify; Complexity Tracking table omitted).

**Post-Phase-1 re-check**: The Phase 0/1 design (research.md, data-model.md, quickstart.md) introduces zero new dependencies and zero new architectural layers beyond what's listed above — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-ecommerce-homepage-demo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no API, CLI, or other machine-readable interface (FR-004/FR-009 explicitly exclude a backend). See "Contracts" note in Phase 1 below.

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx         # existing root layout (from scaffold) — unchanged
│   ├── page.tsx           # homepage route — replaced with the demo homepage composition
│   └── globals.css        # existing global styles (from scaffold) — unchanged
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx  # branding + primary nav (FR-002)
│   │   └── SiteFooter.tsx  # informational links (FR-005)
│   └── home/
│       ├── Hero.tsx        # hero/banner section (FR-003)
│       ├── ProductGrid.tsx # responsive grid layout (FR-004, FR-006)
│       └── ProductCard.tsx # single product: image, name, price (FR-004, FR-007)
├── data/
│   └── products.ts         # static placeholder product data (FR-004)
└── types/
    └── product.ts           # Product type definition

public/
└── products/                # local static product images (avoids next.config remotePatterns)
```

**Structure Decision**: Single Next.js App Router project (already scaffolded at repo root) — "Option 1: Single project" adapted to Next.js conventions. New feature code is presentational components under `src/components` plus a static data module under `src/data`, both consumed by `src/app/page.tsx`. No `backend/`/`frontend/` split and no `tests/` directory, matching the Testing decision above.

## Complexity Tracking

*No violations — table omitted per Constitution Check result.*
