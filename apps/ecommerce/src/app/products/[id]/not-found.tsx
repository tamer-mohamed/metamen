import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="mt-2 text-black/60 dark:text-white/60">
        We couldn&apos;t find the product you&apos;re looking for.
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
