import { Bricolage_Grotesque } from "next/font/google";
import { formatPiastres } from "@metamen/core";
import type { Product } from "@/types/product";
import ProductImage from "@/components/home/ProductImage";
import BuyNowButton from "./BuyNowButton";
import SizeSelector from "./SizeSelector";

const display = Bricolage_Grotesque({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
});

export default function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-4 py-10 sm:grid-cols-2 sm:gap-12 sm:px-6 sm:py-16">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F1EBDD] motion-safe:animate-reveal">
        <ProductImage src={product.imageSrc} alt={product.name} />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-sm text-black/55 dark:text-white/55">
          {product.category}
        </p>
        <h1
          className={`${display.className} mt-2 text-4xl leading-tight tracking-tight sm:text-5xl`}
        >
          {product.name}
        </h1>
        <p className="mt-4 text-xl font-medium">
          {formatPiastres(product.priceInPiastres)}
        </p>

        {product.description && (
          <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-black/70 dark:text-white/70">
            {product.description}
          </p>
        )}

        {product.sizes && (
          <div className="mt-7">
            <SizeSelector sizes={product.sizes} />
          </div>
        )}

        <div className="mt-7">
          <BuyNowButton productId={product.id} />
        </div>

        <div className="mt-8 space-y-1.5 text-sm text-black/55 dark:text-white/55">
          <p>Hand wash cold, dry flat to keep its shape.</p>
          <p>Ships within 2 business days.</p>
        </div>
      </div>
    </div>
  );
}
