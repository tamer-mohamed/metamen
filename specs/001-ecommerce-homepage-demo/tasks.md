---
description: "Task list template for feature implementation"
---

# Tasks: Ecommerce Homepage Demo

**Input**: Design documents from `/specs/001-ecommerce-homepage-demo/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Not included — no automated test suite was requested in the spec. Validation is manual/visual via the project's `webapp-testing` skill (see research.md §5), covered in the Polish phase below.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Next.js App Router project at the repository root, per [plan.md](./plan.md#project-structure): `src/app/`, `src/components/`, `src/data/`, `src/types/`, `public/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the empty directories this feature's files will live in

- [X] T001 [P] Create component directories: `src/components/layout/` and `src/components/home/`, plus `src/data/` and `src/types/`, per plan.md Project Structure
- [X] T002 [P] Create `public/hero/` and `public/products/` and add local placeholder image files (one hero banner image, 6-8 product images) — local static files only, no remote URLs, per research.md §2

**Checkpoint**: Directory structure exists; no code yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare the single shared entry point (`src/app/page.tsx`) that every user story below composes into

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Update metadata (title, description) in `src/app/layout.tsx` to reflect the demo store's branding
- [X] T004 Replace the default create-next-app content in `src/app/page.tsx` with a minimal Server Component shell (no imports yet), ready for story components to be composed in (depends on T001)

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Land on a recognizable storefront (Priority: P1) 🎯 MVP

**Goal**: A visitor sees a header with branding/navigation and a hero banner, and recognizes the page as an online store.

**Independent Test**: Load the homepage and visually confirm a header (branding + nav) and a hero banner render, independent of any product data (spec.md User Story 1, Acceptance Scenarios 1-2).

### Implementation for User Story 1

- [X] T005 [P] [US1] Create `SiteHeader` component with branding/logo and primary navigation in `src/components/layout/SiteHeader.tsx` (FR-002)
- [X] T006 [P] [US1] Create `Hero` component with a banner image (via `next/image`, sourced from `public/hero/`) and introductory copy in `src/components/home/Hero.tsx` (FR-003, FR-007)
- [X] T007 [US1] Compose `SiteHeader` and `Hero` into `src/app/page.tsx` (depends on T004, T005, T006)
- [X] T008 [US1] Apply responsive Tailwind CSS styling to `SiteHeader` and `Hero` per research.md §4 breakpoints (mobile/tablet/desktop) (FR-006)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — homepage shows header + hero.

---

## Phase 4: User Story 2 - Browse sample products (Priority: P2)

**Goal**: A visitor sees a responsive grid of sample products, each with an image, name, and price.

**Independent Test**: Load the homepage and confirm a grid of product cards renders with image, name, and price, and that a missing product image falls back to a placeholder (spec.md User Story 2, Acceptance Scenarios 1-2).

### Implementation for User Story 2

- [X] T009 [P] [US2] Define the `Product` type (`id`, `name`, `priceInPiastres`, `imageSrc`, `category`) in `src/types/product.ts` per data-model.md
- [X] T010 [P] [US2] Create 6-8 sample products, typed with `Product`, in `src/data/products.ts` — prices stored as integer piastres per [CLAUDE.md](../../CLAUDE.md)'s money convention, never floats (FR-004, depends on T009)
- [X] T011 [P] [US2] Create `ProductCard` component in `src/components/home/ProductCard.tsx` rendering a product image (`next/image`, sourced from `public/products/`, with a placeholder fallback if a source is missing), name, and formatted price (FR-004, FR-007, depends on T009). Image rendering + error fallback factored into a small client leaf (`ProductImage.tsx`) since `onError` requires client-side handling; `ProductCard` itself stays a Server Component.
- [X] T012 [US2] Create `ProductGrid` component in `src/components/home/ProductGrid.tsx` rendering a responsive grid (1 col mobile / 2-3 col tablet / 4 col desktop, per research.md §4) of `ProductCard`s sourced from `src/data/products.ts` (FR-004, FR-006, depends on T010, T011)
- [X] T013 [US2] Compose `ProductGrid` into `src/app/page.tsx` below the hero section (depends on T007, T012)
- [X] T014 [US2] Format `priceInPiastres` for display inside `ProductCard` (e.g., divide by 100 and apply a currency symbol) — formatting only, the stored value stays an integer (depends on T011)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently — homepage shows header + hero + product grid.

---

## Phase 5: User Story 3 - See a complete page shell (Priority: P3)

**Goal**: A visitor sees a footer with standard storefront information at the bottom of the page.

**Independent Test**: Load the homepage, scroll to the bottom, and confirm a footer with informational links renders (spec.md User Story 3, Acceptance Scenario 1).

### Implementation for User Story 3

- [X] T015 [P] [US3] Create `SiteFooter` component with informational links (About, Contact, policy placeholders) in `src/components/layout/SiteFooter.tsx` (FR-005)
- [X] T016 [US3] Compose `SiteFooter` into `src/app/page.tsx` below the product grid (depends on T013, T015)

**Checkpoint**: All user stories should now be independently functional — full homepage complete (header, hero, product grid, footer).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against the spec and quickstart guide

- [X] T017 [P] Verify responsive layout (no horizontal scroll, no overlapping content) across mobile/tablet/desktop viewport widths, using the `webapp-testing` skill, per quickstart.md
- [X] T018 [P] Verify no browser console errors and no broken/failed image requests, using the `webapp-testing` skill, per quickstart.md
- [X] T019 Run `pnpm lint` from the repo root and fix any issues
- [X] T020 Run the full [quickstart.md](./quickstart.md) validation walkthrough end-to-end and confirm every acceptance scenario in spec.md passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T004) - no dependency on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (T004) and on T007 (composes into the same `page.tsx` below the hero) - independently testable once its own tasks land
- **User Story 3 (Phase 5)**: Depends on Foundational (T004) and on T013 (composes into the same `page.tsx` below the product grid) - independently testable once its own tasks land
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Component creation tasks (marked [P]) can run in parallel with each other
- Composition into `src/app/page.tsx` happens last within each story, after that story's components exist
- Story complete before moving to next priority (recommended order: US1 → US2 → US3, since each appends to the same `page.tsx` beneath the previous story's section)

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T005 and T006 (US1 components) can run in parallel
- T009, then T010 and T011 (US2: type first, then data + component in parallel)
- T017 and T018 (Polish validation checks) can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational (T004) completes, launch US1 component tasks together:
Task: "Create SiteHeader component in src/components/layout/SiteHeader.tsx"
Task: "Create Hero component in src/components/home/Hero.tsx"
```

## Parallel Example: User Story 2

```bash
# After T009 (Product type) completes, launch these together:
Task: "Create sample product data in src/data/products.ts"
Task: "Create ProductCard component in src/components/home/ProductCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Load the homepage locally and confirm header + hero render correctly
5. This is a demo-only feature with no deployment step — "demo if ready" means running `pnpm dev` and viewing it

### Incremental Delivery

1. Complete Setup + Foundational → shared `page.tsx` shell ready
2. Add User Story 1 → validate independently → header + hero visible (MVP)
3. Add User Story 2 → validate independently → product grid now also visible
4. Add User Story 3 → validate independently → footer now also visible (full homepage)
5. Each story adds value without breaking the previous stories' sections

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Prices are always integer piastres end-to-end (data → formatting), per CLAUDE.md — never floats
- No test tasks were generated; validation is manual/visual per quickstart.md and the `webapp-testing` skill
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
