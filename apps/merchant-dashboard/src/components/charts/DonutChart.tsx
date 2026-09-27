"use client";

import { useState } from "react";
import { formatPiastres } from "@metamen/core";

const SIZE = 180;
const CENTER = SIZE / 2;
const RADIUS = 70;
const STROKE_WIDTH = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 3;

type DonutSlice = { label: string; valueInPiastres: number; percent: number; color: string };

/** Precomputes each slice's dash geometry from a running (never mutated in place) cumulative percent. */
function buildDonutSegments(slices: DonutSlice[]) {
  return slices.reduce<
    (DonutSlice & { index: number; dashArray: string; dashOffset: number })[]
  >((acc, slice, index) => {
    const cumulativePercent = acc.reduce((sum, segment) => sum + segment.percent, 0);
    const visibleLength = Math.max(
      (slice.percent / 100) * CIRCUMFERENCE - SEGMENT_GAP,
      0,
    );
    return [
      ...acc,
      {
        ...slice,
        index,
        dashArray: `${visibleLength} ${CIRCUMFERENCE - visibleLength}`,
        dashOffset: -((cumulativePercent / 100) * CIRCUMFERENCE),
      },
    ];
  }, []);
}

export function DonutChart({
  title,
  totalLabel,
  totalValueInPiastres,
  slices,
}: {
  title: string;
  totalLabel: string;
  totalValueInPiastres: number;
  slices: { label: string; valueInPiastres: number; percent: number; color: string }[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const segments = buildDonutSegments(slices);

  return (
    <div className="min-w-0 rounded-md border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-xs font-medium uppercase text-[var(--chart-text-secondary)]">
        {title}
      </h3>
      <div className="mt-3 flex min-w-0 flex-col items-center gap-4">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-36 shrink-0"
          role="img"
          aria-label={`${title}: ${totalLabel} ${formatPiastres(totalValueInPiastres)}`}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--chart-grid)"
            strokeWidth={STROKE_WIDTH}
          />
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {segments.map((segment) => (
              <circle
                key={segment.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={hoverIndex === segment.index ? STROKE_WIDTH + 5 : STROKE_WIDTH}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="butt"
                onMouseEnter={() => setHoverIndex(segment.index)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{
                  transition: "stroke-width 150ms ease-out, opacity 150ms ease-out",
                  opacity:
                    hoverIndex === null || hoverIndex === segment.index ? 1 : 0.45,
                  animation: `chart-fade-in 500ms ease-out ${segment.index * 60}ms both`,
                  cursor: "pointer",
                }}
              />
            ))}
          </g>
          <text
            x={CENTER}
            y={CENTER - 6}
            textAnchor="middle"
            className="fill-current text-[13px] font-semibold"
          >
            {formatPiastres(totalValueInPiastres)}
          </text>
          <text
            x={CENTER}
            y={CENTER + 11}
            textAnchor="middle"
            fill="var(--chart-muted)"
            className="text-[11px] uppercase"
          >
            {totalLabel}
          </text>
        </svg>

        <ul className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
          {segments.map((segment) => (
            <li
              key={segment.label}
              onMouseEnter={() => setHoverIndex(segment.index)}
              onMouseLeave={() => setHoverIndex(null)}
              className="flex min-w-0 cursor-pointer items-center gap-2 rounded px-1 py-0.5 transition-opacity"
              style={{
                opacity: hoverIndex === null || hoverIndex === segment.index ? 1 : 0.5,
              }}
            >
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="min-w-0 flex-1 truncate" title={segment.label}>
                {segment.label}
              </span>
              <span className="shrink-0 whitespace-nowrap text-black/60 dark:text-white/60">
                {formatPiastres(segment.valueInPiastres)}
              </span>
              <span className="w-10 shrink-0 text-right font-medium">
                {Math.round(segment.percent)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
