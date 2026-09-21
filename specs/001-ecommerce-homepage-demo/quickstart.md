# Quickstart: Validate the Ecommerce Homepage Demo

## Prerequisites

- Node.js and `pnpm` installed (see repo root `pnpm-workspace.yaml` / `package.json` for the pinned `packageManager`)
- Dependencies installed: `pnpm install`

## Run it

```bash
pnpm dev
```

Then open `http://localhost:3000` in a browser.

## What to check

Walk through the acceptance scenarios from [spec.md](./spec.md#user-scenarios--testing-mandatory) in order:

1. **Storefront shell (User Story 1 / FR-001, FR-002, FR-003)**
   - Page loads at `/` with a header showing branding and primary navigation.
   - A hero/banner section is visible at the top of the page.

2. **Sample products (User Story 2 / FR-004, FR-006, FR-007)**
   - Scroll down: a grid of product cards is visible, each with an image, name, and price.
   - Resize the browser (or use devtools device toolbar) across mobile / tablet / desktop widths — the grid reflows (see [data-model.md](./data-model.md) for the `Product` shape and [plan.md](./plan.md) for the breakpoint approach) without horizontal scroll or overlapping content.
   - Confirm no broken-image icons — every product image should render (or fall back to a placeholder if a source file is missing).

3. **Page shell / footer (User Story 3 / FR-005)**
   - Scroll to the bottom: a footer with informational links is visible.

4. **No unintended surface area (FR-008, FR-009)**
   - Confirm there is no functional "Add to cart" action, no checkout flow, no login/auth UI, and no product-detail page navigation — this is a homepage-only demo.
   - Confirm the app requires no deployment step and no environment variables — `pnpm dev` alone is sufficient.

## Automated check (optional)

Use the project's installed `webapp-testing` skill to drive a browser against `http://localhost:3000` and confirm:
- No console errors on load
- No failed network requests for images
- Layout renders correctly at common mobile/tablet/desktop viewport widths (per [research.md](./research.md#5-validation-approach), this replaces a committed automated test suite for this feature)
