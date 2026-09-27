import Link from "next/link";
import { products } from "@/data/products";

// Kashier's exact merchantRedirect query parameter schema is not fully
// documented publicly (research.md §3). We defensively treat only an
// unambiguous success signal as success, and everything else (including a
// missing or unrecognized field) as failure — never the reverse.
const SUCCESS_STATUS_KEYS = ["paymentStatus", "status"];

function isSuccess(searchParams: Record<string, string | string[] | undefined>) {
  return SUCCESS_STATUS_KEYS.some((key) => {
    const value = searchParams[key];
    const first = Array.isArray(value) ? value[0] : value;
    return first?.toLowerCase() === "success";
  });
}

// Kashier is expected to echo back our `order` reference as one of these —
// exact field name unconfirmed, so we check the plausible ones. The order
// value Kashier itself sees is `${productId}-${uniqueSuffix}` (packages/core/src/kashier.ts),
// not a bare product id — Kashier treats `order` as a unique-per-session
// reference and rejects a repeat of the same value outright, so a static
// product id can't be sent as-is. Match by prefix for that path.
//
// The embedded-checkout flow (CheckoutDialog) navigates here directly on a
// postMessage success/failure, and passes the bare product id (it has no
// reason to fabricate a fake suffix) — so an exact match is accepted too.
const ORDER_REFERENCE_KEYS = ["orderId", "merchantOrderId", "order"];

function findPurchasedProduct(
  searchParams: Record<string, string | string[] | undefined>,
) {
  for (const key of ORDER_REFERENCE_KEYS) {
    const value = searchParams[key];
    const first = Array.isArray(value) ? value[0] : value;
    const product =
      first && products.find((p) => p.id === first || first.startsWith(`${p.id}-`));
    if (product) return product;
  }
  return undefined;
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  if (process.env.NODE_ENV !== "production") {
    // First real sandbox run: capture this to correct the parsing above
    // against Kashier's actual redirect contract (quickstart.md).
    console.log("[checkout/result] raw search params:", params);
  }

  if (isSuccess(params)) {
    const product = findPurchasedProduct(params);
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="mt-2 text-black/60 dark:text-white/60">
          {product
            ? `Your payment for ${product.name} was successful.`
            : "Your payment was successful."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
        >
          Back to the homepage
        </Link>
      </div>
    );
  }

  const product = findPurchasedProduct(params);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">Payment not completed</h1>
      <p className="mt-2 text-black/60 dark:text-white/60">
        Your payment was cancelled or could not be completed. No charge was
        made.
      </p>
      <Link
        href={product ? `/products/${product.id}` : "/"}
        className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
      >
        {product ? "Try again" : "Back to the homepage"}
      </Link>
    </div>
  );
}
