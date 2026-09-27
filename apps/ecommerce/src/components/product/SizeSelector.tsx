"use client";

import { useState } from "react";

export default function SizeSelector({ sizes }: { sizes: string[] }) {
  const [selected, setSelected] = useState(sizes[Math.floor(sizes.length / 2)]);

  return (
    <div>
      <p className="text-sm text-black/60 dark:text-white/60">Size</p>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
        {sizes.map((size) => {
          const isSelected = size === selected;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(size)}
              className={
                "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors " +
                (isSelected
                  ? "border-[#45543F] bg-[#45543F] text-white dark:border-[#9FB093] dark:bg-[#9FB093] dark:text-[#171717]"
                  : "border-black/15 text-black/70 hover:border-black/30 dark:border-white/15 dark:text-white/70 dark:hover:border-white/30")
              }
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
