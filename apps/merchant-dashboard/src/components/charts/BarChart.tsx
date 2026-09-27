"use client";

import { useState } from "react";
import { formatChartValue, type ChartValueFormat } from "@/lib/chart-format";

const WIDTH = 480;
const HEIGHT = 180;
const PAD_TOP = 28;
const PAD_BOTTOM = 28;
const BAR_MAX_THICKNESS = 24;
const BAR_GAP = 2;

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function BarChart({
  title,
  bars,
  format,
}: {
  title: string;
  bars: { label: string; value: number; color: string }[];
  format: ChartValueFormat;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const formatValue = (value: number) => formatChartValue(format, value);

  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = niceMax(Math.max(...bars.map((bar) => bar.value), 1));
  const slotWidth = WIDTH / bars.length;
  const barWidth = Math.min(BAR_MAX_THICKNESS, slotWidth - BAR_GAP * 2);

  return (
    <div className="min-w-0 rounded-md border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-xs font-medium uppercase text-[var(--chart-text-secondary)]">
        {title}
      </h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-2 w-full" role="img" aria-label={title}>
        <line
          x1={0}
          y1={PAD_TOP + innerHeight}
          x2={WIDTH}
          y2={PAD_TOP + innerHeight}
          stroke="var(--chart-baseline)"
          strokeWidth={1}
        />

        {bars.map((bar, index) => {
          const barHeight = (bar.value / maxValue) * innerHeight;
          const x = index * slotWidth + (slotWidth - barWidth) / 2;
          const y = PAD_TOP + innerHeight - barHeight;
          const isHovered = hoverIndex === index;

          return (
            <g
              key={bar.label}
              tabIndex={0}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onFocus={() => setHoverIndex(index)}
              onBlur={() => setHoverIndex(null)}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                rx={4}
                fill={bar.color}
                opacity={isHovered ? 0.8 : 1}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center bottom",
                  animation: `chart-grow-in 500ms ease-out ${index * 70}ms both`,
                }}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-current text-[13px] font-medium"
              >
                {formatValue(bar.value)}
              </text>
              <text
                x={x + barWidth / 2}
                y={HEIGHT - 10}
                textAnchor="middle"
                fill="var(--chart-muted)"
                className="text-[12px] uppercase"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
