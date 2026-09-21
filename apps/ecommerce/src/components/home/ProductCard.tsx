import { formatPiastres } from "@metamen/core";
import type { Product } from "@/types/product";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
        <ProductImage src={product.imageSrc} alt={product.name} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
        {product.category}
      </p>
      <h3 className="text-sm font-medium sm:text-base">{product.name}</h3>
      <p className="mt-1 text-sm font-semibold sm:text-base">
        {formatPiastres(product.priceInPiastres)}
      </p>
    </article>
  );
}
