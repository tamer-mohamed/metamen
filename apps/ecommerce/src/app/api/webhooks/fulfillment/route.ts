import { applyVerifiedFulfillmentUpdate } from "@metamen/core/server";
import type { FulfillmentStatus } from "@metamen/core/server";
import type { NextRequest } from "next/server";

const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "created",
  "shipped",
  "delivered",
  "failed",
  "returned",
];

interface FulfillmentWebhookBody {
  // No persistence layer exists yet (see CLAUDE.md), so there is nowhere to
  // look these Kashier ids up from — the caller must supply both directly.
  // A real carrier integration would need these to have been stored when the
  // order was placed (CLAUDE.md: "Persisting the Kashier transactionId").
  kashierOrderId?: unknown;
  kashierTransactionId?: unknown;
  status?: unknown;
  returnedAmountInPiastres?: unknown;
}

export async function POST(request: NextRequest) {
  // There is no real carrier integrated yet (CLAUDE.md's carrier notes — the
  // build-vs-buy decision, #23, is still open), so there is no vendor-defined
  // signature scheme to verify like Kashier's own webhook signature. This
  // shared secret is a stand-in until a real carrier dictates the real one.
  const expectedSecret = process.env.FULFILLMENT_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return Response.json({ error: "misconfigured" }, { status: 500 });
  }
  if (request.headers.get("x-webhook-secret") !== expectedSecret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as FulfillmentWebhookBody | null;

  const kashierOrderId =
    typeof body?.kashierOrderId === "string" ? body.kashierOrderId : undefined;
  const kashierTransactionId =
    typeof body?.kashierTransactionId === "string"
      ? body.kashierTransactionId
      : undefined;
  const status =
    typeof body?.status === "string" &&
    FULFILLMENT_STATUSES.includes(body.status as FulfillmentStatus)
      ? (body.status as FulfillmentStatus)
      : undefined;
  const returnedAmountInPiastres =
    typeof body?.returnedAmountInPiastres === "number"
      ? body.returnedAmountInPiastres
      : undefined;

  if (!kashierOrderId || !kashierTransactionId || !status) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  const secretKey = process.env.KASHIER_TEST_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "misconfigured" }, { status: 500 });
  }

  try {
    const result = await applyVerifiedFulfillmentUpdate(
      { secretKey },
      {
        orderId: kashierOrderId,
        transactionId: kashierTransactionId,
        update: { status, returnedAmountInPiastres },
      },
    );

    if (result.outcome === "rejected") {
      console.error(
        "[api/webhooks/fulfillment] re-verification refused the update:",
        result.reason,
      );
      return Response.json({ error: "unverified" }, { status: 409 });
    }

    return Response.json({ ok: true, action: result.action }, { status: 200 });
  } catch (error) {
    console.error("[api/webhooks/fulfillment] failed to apply update:", error);
    return Response.json({ error: "processing_failed" }, { status: 502 });
  }
}
