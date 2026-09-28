import { createPaymentSession } from "@metamen/core/server";
import type { NextRequest } from "next/server";
import { products } from "@/data/products";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    productId?: unknown;
  } | null;

  const productId =
    typeof body?.productId === "string" ? body.productId : undefined;
  const product = productId
    ? products.find((p) => p.id === productId)
    : undefined;

  if (!product) {
    return Response.json({ error: "unknown_product" }, { status: 404 });
  }

  const secretKey = process.env.KASHIER_TEST_SECRET_KEY;
  const apiKey = process.env.KASHIER_TEST_API_KEY;
  const merchantId = process.env.KASHIER_TEST_MERCHANT_ID;

  if (!secretKey || !apiKey || !merchantId) {
    return Response.json({ error: "misconfigured" }, { status: 500 });
  }

  try {
    const session = await createPaymentSession(
      { secretKey, apiKey, merchantId },
      {
        productId: product.id,
        amountInPiastres: product.priceInPiastres,
        connectedAccount: {
          merchantId: "MID-XXXXX-XXX"
        },
        // Kashier rejects "localhost" as a merchantRedirect hostname (it
        // requires a publicly-resolvable-looking domain), so local dev needs
        // a tunnel (e.g. ngrok) exposed via PUBLIC_APP_URL. Falls back to the
        // request's own origin, which is correct once actually deployed.
        merchantRedirect: new URL(
          "/checkout/result",
          process.env.PUBLIC_APP_URL || request.nextUrl.origin,
        ).toString(),
      },
    );

    return Response.json({ url: session.sessionUrl }, { status: 201 });
  } catch (error) {
    console.error("[api/checkout] session creation failed:", error);
    return Response.json({ error: "session_creation_failed" }, { status: 502 });
  }
}
