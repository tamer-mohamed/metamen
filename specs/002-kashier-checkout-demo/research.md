# Phase 0 Research: Kashier Checkout Demo

## 1. Payment Session request contract

**Decision**: `POST https://test-api.kashier.io/v3/payment/sessions`, headers `Authorization: <Secret Key>` + `api-key: <Payment API Key>` (both server-side secrets, no hash). Body:

| Field | Type | Notes |
|---|---|---|
| `amount` | string | Decimal in major currency unit, e.g. `"450.00"` — **not** piastres, not a number type |
| `currency` | string | `"EGP"` |
| `order` | string | **Must be unique per session — Kashier rejects any repeat.** See note below. |
| `merchantId` | string | Our test `MID-...` |
| `merchantRedirect` | string (URL) | Where Kashier returns the shopper after payment |
| `display` | string | `"en"` |
| `type` | string | `"one-time"` |
| `manualCapture` | boolean | Omit / `false` — per spec, auto-capture so money "lands" immediately (no capture step in this milestone) |
| `customer` | object | **Required**, undocumented in the pages fetched during planning — discovered only via a live `400` from Kashier's sandbox. Shape: `{ email: string, reference: string }`. This demo has no accounts/cart (spec Assumptions), so `kashier.ts` synthesizes a guest identity per checkout attempt rather than threading a real customer identity through from the UI. |

Response: `{ sessionUrl: "https://payments.kashier.io/session/<id>?mode=test", ... }`. Redirect the browser there.

**`order` is a unique reference, not a free-form label — reusing one is rejected, not overwritten.** Discovered live: sending the same `order` value twice returns `400 {"error":{"cause":"Session cannot be created"},"messages":{"en":"Sessions cannot be created, another session is opened or paid"},"status":"FAILURE","sessionUrl":"..."}` on the second call — a genuinely new error shape (bilingual `messages`, `status: "FAILURE"`, and, oddly, a `sessionUrl` pointing at the *earlier, colliding* session). The status code is a real `400` (confirmed by direct reproduction), so `!response.ok` in `kashier.ts` catches it correctly — the risk was in what we *send*, not in how we read the response. Sending the bare `productId` as `order` (the original implementation) meant every repeat checkout of the same product — including our own repeated testing — collided with the prior attempt. Fixed by sending `${productId}-${randomUUID()}` instead. This has a knock-on effect: `checkout/result/page.tsx`'s product lookup from the returned order reference must match by *prefix*, not equality.

**`merchantRedirect` must be a publicly-resolvable-looking URL — `localhost` is rejected outright.** Discovered live: both `http://localhost:3000/...` and `https://localhost:3000/...` fail identical validation (`"merchantRedirect" must be a valid URL"`), while `https://example.com/...` passes it. The scheme is irrelevant; the hostname is what's rejected — consistent with a schema validator (e.g. Joi's `.uri()`) that requires a real-looking domain by default. Local development therefore requires a tunnel (e.g. `ngrok http 3000`) exposing the app under a real HTTPS URL; `apps/ecommerce/src/app/api/checkout/route.ts` reads an optional `PUBLIC_APP_URL` env var for this, falling back to the request's own origin (correct once actually deployed).

**Rationale**: This is the hosted-checkout path `CLAUDE.md` mandates — no `Kashier-Hash`, card data never touches our systems.

**Alternatives considered**: Direct API (`fep.kashier.io/v3/orders`, `Kashier-Hash` auth) — rejected per `CLAUDE.md`, pulls card handling into our PCI scope for no benefit in a demo.

## 2. Amount unit conversion at the API boundary

**Decision**: Add one narrow function to `@metamen/core`'s Kashier module: `piastresToKashierAmount(value: Piastres): string`, doing `(value / 100).toFixed(2)`. Used only immediately before the Kashier request body is built.

**Rationale**: `formatPiastres` (existing) produces a human-readable currency string (`"EGP 450.00"`) for display — not what Kashier's API wants (a bare decimal string, no currency symbol). Conflating the two would either break the API call or produce a wrong display string. Isolating the float-producing division to one named function, right at the external-API boundary, keeps the "integer piastres, never floats" rule intact everywhere else per `CLAUDE.md`.

**Alternatives considered**: Reusing `formatPiastres` and stripping the currency symbol — rejected, fragile (locale-dependent formatting) and conflates two different concerns.

## 3. The `merchantRedirect` return contract — now confirmed live

**Confirmed, from a real completed sandbox payment** (a 3D Secure test card's completion redirect — see §9, this is a full top-level navigation, not a `postMessage`):

```
<merchantRedirect>?paymentStatus=SUCCESS&cardDataToken=...&maskedCard=450875******1019
  &merchantOrderId=<the order value we sent, e.g. minimalist-wool-sweater-{uuid}>
  &orderId=<Kashier's own internal order id — NOT ours>&cardBrand=Visa
  &orderReference=TEST-ORD-...&transactionId=TX-...&amount=899&currency=EGP
  &mode=test&signature=...
```

This exactly matches what an early, lower-confidence research pass had suggested — good confirmation that source was reliable, even though it couldn't be verified against machine-readable docs at the time. Concretely: `paymentStatus` (uppercase `SUCCESS`/presumably `FAILED`), our own reference comes back as **`merchantOrderId`**, not `orderId` (that field is Kashier's own internal id — a bare UUID, never one of our product ids, so it's harmless to check but will never match). `checkout/result/page.tsx`'s defensive parsing (case-insensitive match, prefix-match on the order reference) already handles this correctly without changes.

**Still unconfirmed**: whether a separate `failureRedirect` field exists on v3 (a legacy/Direct-API example showed one; the current guide only documents one `merchantRedirect` for all outcomes). Not resolved by this test, since it only exercised the success path. The defensive single-route design in `checkout/result` doesn't depend on the answer either way.

**Architecturally important, discovered via §9's embed work**: this redirect is **not just a fallback**. A 3D Secure challenge's completion causes a full top-level page navigation to `merchantRedirect` — the embedded checkout's `postMessage` channel never fires for it, because the top-level navigation tears down the page (and the `CheckoutDialog` listening on it) entirely. Any card that triggers 3DS completes through this path, not through `onSuccess`/`onFailure`. This means `merchantRedirect` must always point at a real, reachable URL — in local dev, the ngrok tunnel via `PUBLIC_APP_URL` (research.md §1), never a placeholder — or a real payment will strand the shopper on an unrelated page instead of `/checkout/result`.

## 4. Redirect vs. iframe embed

**Superseded — see §9.** Originally decided as full-page redirect for simplicity; the product direction changed to an embedded checkout dialog. Left here as a record of the original reasoning: a redirect satisfies the spec's acceptance scenarios with no extra code, while an iframe embed adds a `window.postMessage` listener and cross-frame UI work.

## 5. Where the Kashier client lives

**Decision**: `packages/core/src/kashier.ts`, exported only from `@metamen/core/server`, never from the default `@metamen/core` browser-safe entry.

**Rationale**: Session creation requires the Secret Key and Payment API Key — both server-side secrets per `CLAUDE.md`. This is exactly the split `@metamen/core`'s two entry points already exist to enforce, and matches epic #2's #5 deliverable (payment sessions belongs in the shared core, not hand-rolled per-app).

## 6. Route Handler vs. Server Action

**Decision**: A Next.js Route Handler (`app/api/checkout/route.ts`) called via `fetch` from a Client Component (`BuyNowButton`), rather than a Server Action.

**Rationale**: `BuyNowButton` needs to redirect the *browser* to an external URL (`sessionUrl`), not just re-render server state — a plain `fetch` → read JSON → `window.location.href = url` is the simplest way to do that from a Client Component. A Server Action would need to return the URL for the client to act on anyway, adding no benefit here.

## 7. Component split

**Decision**: `ProductDetail` (Server Component, renders existing `Product` data) contains `BuyNowButton` (Client Component, the only interactive piece — mirrors the existing `ProductImage` pattern from spec 001, where a small client leaf sits inside an otherwise-server component tree).

**Rationale**: Keeps the same "Server Components by default, client only where interaction requires it" approach already established in `apps/ecommerce`.

## 8. Environment variables

**Decision**: `KASHIER_TEST_SECRET_KEY`, `KASHIER_TEST_API_KEY`, `KASHIER_TEST_MERCHANT_ID` — server-only, read only inside the Route Handler / `@metamen/core/server`, validated present at request time (fail with a clear error per FR-008, not a crash).

**Rationale**: None of these may carry a `NEXT_PUBLIC_` prefix per `CLAUDE.md`. Naming them `_TEST_` explicitly (rather than bare `KASHIER_SECRET_KEY`) makes it obvious at a glance that production credentials are a different, not-yet-introduced concern.

**Operational gotcha discovered during implementation**: Next.js expands unescaped `$VARIABLE` references inside `.env*` files (documented Next.js behavior, not a bug in this app). Kashier's Secret Key contained a literal `$`, which was silently truncated/corrupted on every load with no error — the app sent a mangled key and Kashier correctly reported `401 Invalid token`, which looked exactly like a bad-credential problem and cost significant debugging time before the actual cause (a shell/Next.js parsing quirk, not the credential itself) was isolated. Any value containing `$` must be escaped as `\$` in `.env.local`. This is called out directly in `.env.example` and `quickstart.md` so it isn't rediscovered the same way twice.

## 9. Embedded checkout (supersedes §4)

**Decision**: `BuyNowButton` opens the `sessionUrl` inside an `<iframe>` in a modal dialog (`CheckoutDialog`) rather than a full-page redirect. `merchantRedirect` is still sent on session creation and is **not merely a fallback** — confirmed live (§3), a 3D Secure challenge's completion is a full top-level navigation there, bypassing `postMessage` entirely, and 3DS is common on real cards, not a rare edge case. For a card that never triggers 3DS, success/failure are driven by `window.postMessage` and the app navigates to `/checkout/result` itself instead.

**The `postMessage` contract, and how confident we are in each part**:

| Message (`event.data.message`) | Meaning | Source confidence |
|---|---|---|
| `contentLoaded` | Checkout DOM is ready | Docs page only (via fetch-and-summarize tool) |
| `paymentSuccess` | Payment succeeded | Docs page only |
| `success` | Payment succeeded (raw gateway callback) | **Corroborated** — present in both the docs summary and a real code sample (`Kashier-payments/Php-Checkout-Demo`'s `index.php`, fetched directly) |
| `failure` | Payment failed | **Corroborated**, same as above |
| `urlRedirection` | `{ redirectUrl, redirectMethod }` — checkout needs the *top* window sent to `redirectUrl` (3DS/OTP pages generally refuse to render inside an iframe) | Docs page only |
| `closeIframe` | Shopper closed the checkout | Docs page only |
| `merchantStoreRedirect` | 3DS result callback, carries a `redirectUrl` | Docs page only |

The code sample is from an older, `Kashier-Hash`-based integration (a `<script>` tag with `data-*` attributes, not the v3 Payment Sessions API this app uses), so it isn't a perfect match — but it corroborates the core mechanism (`e.data.message`, string-valued) and the two outcomes that matter most (`success`/`failure`), which is enough signal to build against rather than guessing blind.

**Defensive design, consistent with the rest of this integration**: `CheckoutDialog` verifies `event.origin === "https://payments.kashier.io"` before reading anything from the message (undocumented as a requirement, but standard `postMessage` hygiene — nothing stops an unrelated frame or extension from posting a message to this window). Any message type not in the table above is logged in dev and otherwise ignored — never treated as success, matching the same rule already applied to Kashier's redirect-based webhooks and the `merchantRedirect` query string.

**Verification task carried into implementation** (same pattern as §3's still-open item): the first live embedded checkout — success, failure, and ideally a 3DS-triggering card — should have its actual `event.data` payloads logged and compared against the table above, since it was assembled from a docs summary plus one non-matching code sample rather than confirmed API reference.

**Rationale**: An embedded dialog keeps the shopper on the storefront (no full navigation away and back), which is generally a lower-friction checkout pattern, and lets the checkout pick up `brandColor` theming (§1) for a more integrated look.

**Alternatives considered**: Full-page redirect (§4, the original decision) — simpler and better-documented, but a full navigation away from the storefront is what the embed intentionally avoids.

## 10. `allowedMethods` — InstaPay is offered but not functional for this account

**Decision**: `allowedMethods: "card,wallet,bank_installments"` on session creation, explicitly excluding InstaPay and Basata.

**Reproduced live**: Kashier's checkout UI lists InstaPay and Basata under a "More Methods" overflow even with no `allowedMethods` restriction sent. Selecting InstaPay, entering a test mobile number, and submitting fails every time with a banner reading exactly **"Invalid Merchant ID"** — using the identical `merchantId` a card payment had just completed successfully with moments earlier (§3, §9). Since our request never restricts methods and the failure is specific to one method with an otherwise-working merchant id, this is an account-side provisioning gap on Kashier's end (InstaPay likely requires separate activation, being a distinct interbank rail rather than card processing), not a bug in this app's request.

**Confidence per method**: only `card` has been proven end-to-end (a real payment, including a 3DS challenge, completed successfully — §3). `wallet` and `bank_installments` are included because Kashier's UI presents them as primary, non-overflow options alongside `card` — not because they've been independently tested. If either turns out to have the same account-provisioning problem as InstaPay, remove it from this list the same way.

**Rationale**: Presenting a payment method in the UI that is guaranteed to fail is a worse experience than not offering it. This is a stopgap, not a permanent decision — if InstaPay is later activated for this merchant account (a support conversation with Kashier, not a code change), remove it from the exclusion.
