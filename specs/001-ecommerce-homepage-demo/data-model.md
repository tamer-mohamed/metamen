# Phase 1 Data Model: Ecommerce Homepage Demo

## Product (sample)

Represents a single static, placeholder item rendered in the homepage's product grid. Not persisted anywhere — defined entirely as in-repo static data (see [research.md](./research.md#3-sample-product-data-source)).

| Field              | Type    | Required | Notes |
|--------------------|---------|----------|-------|
| `id`               | string  | yes      | Stable unique slug (e.g., `"canvas-tote-bag"`), used as React list key |
| `name`             | string  | yes      | Display name shown on the product card |
| `priceInPiastres`  | integer | yes      | Price stored as an integer count of piastres, per the project-wide money convention in [CLAUDE.md](../../CLAUDE.md) — never a float. Formatted for display at render time. |
| `imageSrc`         | string  | yes      | Path to a local static asset under `public/products/` |
| `category`         | string  | yes      | Short label shown on the card (e.g., `"Bags"`, `"Shoes"`) |

**Validation rules**:
- `priceInPiastres` MUST be a positive integer (no fractional/float values).
- `name` and `category` MUST be non-empty strings.
- `imageSrc` MUST reference a file that exists under `public/products/` at build time (no remote URLs — see research.md §2).

**Relationships**: None — a flat list of independent sample products. No relationship to any other entity in this feature.

**State transitions**: None — the data is static and read-only for the lifetime of the app; there is no create/update/delete flow for products in this feature (FR-008 excludes cart/checkout/auth, and by extension any product management).

## Notes on scope

No other entities are introduced by this feature. Categories, cart items, orders, and users are out of scope per the spec's Assumptions and FR-008.
