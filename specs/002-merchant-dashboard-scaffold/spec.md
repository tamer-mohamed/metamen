# Feature Specification: Merchant Dashboard Scaffold (Orders List, Order Detail, Income Summary)

**Feature Branch**: `002-merchant-dashboard-scaffold`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "#40" — [GitHub issue #40](https://github.com/tamer-mohamed/metamen/issues/40): "[D14] Merchant dashboard: app scaffold, orders list, income summary (dummy data)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the orders list (Priority: P1)

A merchant opens the dashboard and sees a list of their orders, each showing the product sold, the amount, the payment state (authorized, captured, voided, or refunded), and the order date.

**Why this priority**: This is the minimum needed for the app to read as a "merchant dashboard" at all. Without a populated, scannable orders list, there is nothing to demo and no way to prove the design works across every payment state.

**Independent Test**: Can be fully tested by loading the dashboard and visually confirming a list of orders renders, with each row showing product, amount, payment state, and date, independent of order detail or income summary.

**Acceptance Scenarios**:

1. **Given** the dashboard has loaded, **When** the merchant views the orders list, **Then** they see every order in the dummy dataset, each showing its product, amount, payment state, and order date.
2. **Given** the dummy dataset contains orders in every payment state, **When** the merchant scans the list, **Then** they can visually distinguish authorized, captured, voided, and refunded orders from one another.

---

### User Story 2 - Drill into an order's detail (Priority: P2)

A merchant selects an order from the list and sees a detail view for that single order, confirming the dashboard supports more than a flat list.

**Why this priority**: Order detail is the second most convincing proof of a working dashboard, but it depends on User Story 1's list already existing to select an order from.

**Independent Test**: Can be fully tested by selecting any order from the list and confirming a detail view renders with that order's full information, independent of the income summary.

**Acceptance Scenarios**:

1. **Given** the orders list is visible, **When** the merchant selects an order, **Then** they see a detail view showing that order's product, amount, payment state, and order date.
2. **Given** the merchant is viewing an order's detail, **When** they look for which order they selected, **Then** the detail view unambiguously identifies that specific order (e.g., by order reference).

---

### User Story 3 - See the income summary (Priority: P3)

A merchant looks at a summary figure showing their total income from successfully captured orders, giving an at-a-glance sense of how the business is performing.

**Why this priority**: The income summary is a natural extension once orders exist, but it is the least critical of the three surfaces — a merchant can still get value from browsing and inspecting orders without it.

**Independent Test**: Can be fully tested by loading the dashboard and confirming a single summary figure is displayed, and that it equals the sum of only the captured orders in the dummy dataset (independently computable from the dataset for verification).

**Acceptance Scenarios**:

1. **Given** the dummy dataset contains orders in every payment state, **When** the merchant views the income summary, **Then** the figure shown equals the sum of amounts for orders whose payment state is captured or refunded, and excludes authorized and voided orders (a voided order's hold was released before money was ever captured, so it never contributed).
2. **Given** an order was captured and later refunded, **When** the merchant views the income summary, **Then** that order's amount is still included in the total (the summary is not net of later refunds — a refund does not subtract the order back out).

---

### Edge Cases

- What happens when the merchant selects an order that no longer matches any entry in the dataset (e.g., a stale or invalid reference)? The dashboard should indicate the order cannot be found rather than showing a blank or broken detail view.
- How does the income summary display when there are zero captured orders in the dataset? It should show a clear zero total rather than an empty or missing figure (not expected to occur given the dataset requirement below, but the display must not break if it did).
- How is a voided order visually represented in the list and detail views, given it contributes nothing to income (its hold was released before any money was captured)? Its payment state must still be clearly shown, distinct from authorized, captured, and refunded.
- How is a refunded order visually represented, given it still contributes to income (it was captured before being refunded) even though money was later returned to the customer? Its payment state must be clearly shown as "refunded," distinct from "captured," even though both count toward the income summary.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a merchant dashboard application, separate from the existing storefront, reachable as its own local dev target alongside the other apps in the workspace.
- **FR-002**: System MUST display an orders list where each order shows, at minimum: the product sold, the order amount, the payment state, and the order date.
- **FR-003**: System MUST allow the merchant to open a detail view for any individual order from the list.
- **FR-004**: The order detail view MUST show, at minimum, the same information as the list (product, amount, payment state, order date) plus an unambiguous order reference identifying which order is being viewed.
- **FR-005**: System MUST display an income summary figure equal to the sum of amounts for orders whose payment state is "captured" or "refunded" — both represent money that was successfully captured at some point; orders that are "authorized" or "voided" (never captured) MUST contribute nothing.
- **FR-006**: The income summary MUST NOT subtract a refunded order's amount back out — a captured order's amount counts toward income the moment it is captured and continues to count even if it is later refunded.
- **FR-007**: All dashboard content (orders list, order detail, income summary) MUST be driven entirely by a static, hand-authored dummy dataset — no live order persistence or external order source.
- **FR-008**: The dummy dataset MUST include at least one order in each of the four payment states (authorized, captured, voided, refunded), so every payment-state presentation in the UI is exercised by the data.
- **FR-009**: System MUST present a single demo merchant identity with no login, authentication, or account-switching flow.
- **FR-010**: System MUST NOT include fulfillment status, analytics/trends, filtering, export, or real authentication — these are explicitly out of scope for this feature.

### Key Entities *(include if feature involves data)*

- **Order**: A single past purchase shown on the dashboard. Key attributes: an order reference/identifier, the product sold, the order amount, the payment state (authorized, captured, voided, or refunded), and the order date. Each order carries exactly one payment state at a time.
- **Payment State**: One of four fixed values — authorized, captured, voided, refunded — describing where an order stands in the payment lifecycle. Distinct from any future fulfillment status, which is out of scope here.
- **Income Summary**: A single aggregate figure derived from the Order dataset: the sum of amounts across all orders currently in the "captured" or "refunded" state (both represent money that was captured at some point; a refund does not subtract the amount back out).
- **Merchant**: The single demo identity that owns and views all orders and the income summary. No multi-merchant or multi-tenant concept exists yet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can view the complete orders list, with every order's product, amount, payment state, and date visible, within a few seconds of opening the dashboard.
- **SC-002**: A merchant can go from the orders list to any individual order's detail view in a single selection action.
- **SC-003**: The income summary figure exactly matches the sum of captured-and-refunded order amounts in the dummy dataset, verifiable by manual calculation against the dataset, with no contribution from authorized or voided orders.
- **SC-004**: Every one of the four payment states (authorized, captured, voided, refunded) is visibly represented somewhere in the orders list, so the dashboard can be fully demoed without adding new data.
- **SC-005**: The dashboard is demoable end-to-end (list → detail → income summary) using only the static dummy dataset, with no dependency on real order persistence or a live backend.

## Assumptions

- The static dummy dataset lives inside the new application (mirroring the existing storefront's own hand-authored product dataset) rather than being sourced from the ecommerce app or any shared package.
- Each order in the dummy dataset represents a single product (one line item), matching the issue's singular wording; multi-item orders are not modeled in this phase.
- The income summary is a single all-time total across the whole dummy dataset, with no date-range scoping, filtering, or trend view — those are explicitly deferred to a later analytics phase.
- The dummy dataset contains a small, hand-authored set of orders (roughly on the order of 8-12), enough to populate a realistic-looking list while guaranteeing all four payment states appear at least once.
- Monetary amounts follow the project-wide convention of integer minor-unit (piastre) values rather than floating-point numbers, consistent with the existing storefront app.
- No real authentication, account creation, or session management exists; the single demo merchant identity is implicit and requires no login screen.
- Fulfillment status, real order persistence, multi-tenancy/real auth, and analytics/filtering/export are all out of scope, per the source issue, and are not addressed by this specification.
