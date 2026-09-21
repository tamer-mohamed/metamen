"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_SRC = "/products/placeholder.svg";

export default function ProductImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      className="object-cover"
      onError={() => setImgSrc(FALLBACK_SRC)}
    />
  );
}
