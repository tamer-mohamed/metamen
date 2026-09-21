# Phase 0 Research: Ecommerce Homepage Demo

No `NEEDS CLARIFICATION` markers remained in the Technical Context — the tech stack was already fixed by the project scaffold, and the feature's own scope (static demo homepage) resolves the rest via defaults from the spec's Assumptions. The research below covers the technology/pattern choices needed to implement the spec's requirements idiomatically.

## 1. Rendering strategy: Server Components vs. Client Components

**Decision**: Render the homepage and all new components (`SiteHeader`, `Hero`, `ProductGrid`, `ProductCard`, `SiteFooter`) as React Server Components (the App Router default) — no `"use client"` directive.

**Rationale**: The page has no interactive state, user input, or client-only browser APIs (FR-008 explicitly excludes functional cart/checkout/auth). Server Components ship zero JS for this content, which is the Next.js-recommended default for static/dummy pages and directly supports SC-004 (performance score).

**Alternatives considered**: Client Component homepage — rejected; adds unnecessary client-side JS bundle for a page with no interactivity.

## 2. Image handling

**Decision**: Use `next/image` for the hero image and every product image, backed by local files under `public/products/` (and `public/hero/`), each with explicit `width`/`height` (or `fill` inside a sized container).

**Rationale**: `next/image` auto-optimizes and lazy-loads images and enforces reserved layout space, which is exactly what FR-007 asks for (fast loading, no visible layout shift) without the spec needing to name the API. Using local files (rather than a remote placeholder-image service) avoids any `next.config.ts` `images.remotePatterns` changes, keeping the app fully offline/local-only per FR-009.

**Alternatives considered**: Plain `<img>` tags — rejected, no built-in optimization or CLS prevention. Remote placeholder-image service (e.g., a public placeholder URL) — rejected, adds an external network dependency to a feature that must run fully locally with no external calls.

## 3. Sample product data source

**Decision**: Define sample products as a typed static array exported from `src/data/products.ts`, imported directly by the Server Component tree (no `fetch`, no API route).

**Rationale**: Matches FR-004 ("static placeholder data... no backend, database, or external API") with the simplest possible mechanism. A Server Component can import and render the array directly at build/request time with zero runtime data-fetching code.

**Alternatives considered**: A local JSON file loaded via `fetch()` — rejected as unnecessary indirection. A Next.js Route Handler (`app/api/products/route.ts`) serving mock JSON — rejected; introduces a backend-shaped layer the spec explicitly excludes.

## 4. Layout & responsiveness

**Decision**: Use Tailwind CSS 4 utility classes with CSS Grid for `ProductGrid` (1 column on mobile, 2-3 on tablet, 4 on desktop via `sm:`/`lg:` breakpoints) and Flexbox for header/footer layout.

**Rationale**: Tailwind is already configured by the scaffold; utility-first responsive classes satisfy FR-006 (responsive layout) with no additional dependency or config.

**Alternatives considered**: CSS Modules — rejected, redundant given Tailwind is already the project's styling solution. A component/UI library (e.g., shadcn/ui) — rejected as disproportionate overhead for a single static page.

## 5. Validation approach

**Decision**: Validate the implemented homepage manually using the project's installed `webapp-testing` skill (Playwright-driven): load the page, check for console errors and broken images, and check layout at mobile/tablet/desktop viewport widths — no automated test suite is authored.

**Rationale**: Matches the Testing decision in Technical Context. The feature has no business logic to unit-test; its "correctness" is entirely visual/structural, which the `webapp-testing` skill's browser-based checks are suited for. Matches CLAUDE.md-adjacent project pragmatism of not adding tooling beyond what a feature needs.

**Alternatives considered**: A full Playwright test suite committed to the repo — rejected as disproportionate to a "dummy homepage only" demo with no deployment and no regression risk beyond this one PR.
