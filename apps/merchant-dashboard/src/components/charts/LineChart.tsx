"use client";

import { useId, useState } from "react";
import type { TrendPoint } from "@/lib/analytics";
import { formatChartValue, type ChartValueFormat } from "@/lib/chart-format";

const WIDTH = 480;
const HEIGHT = 180;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 20;
const PAD_BOTTOM = 24;

const GRID_STEPS = 4;

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

/** Rounds corners at each point with a quadratic curve anchored on the real data points (no overshoot). */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length <= 2) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    path += ` Q${points[i].x},${points[i].y} ${midX},${midY}`;
  }
  const secondLast = points[points.length - 2];
  const last = points[points.length - 1];
  path += ` Q${secondLast.x},${secondLast.y} ${last.x},${last.y}`;
  return path;
}

export function LineChart({
  title,
  data,
  color,
  format,
}: {
  title: string;
  data: TrendPoint[];
  color: string;
  format: ChartValueFormat;
}) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const formatValue = (value: number) => formatChartValue(format, value);

  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = niceMax(Math.max(...data.map((point) => point.value), 1));

  const isSinglePoint = data.length <= 1;
  const xFor = (index: number) =>
    isSinglePoint
      ? WIDTH / 2
      : PAD_LEFT + (index / (data.length - 1)) * innerWidth;
  const yFor = (value: number) =>
    PAD_TOP + innerHeight - (value / maxValue) * innerHeight;

  const plottedPoints = data.map((point, index) => ({
    x: xFor(index),
    y: yFor(point.value),
  }));
  const smoothLinePath = buildSmoothPath(plottedPoints);
  const baselineY = PAD_TOP + innerHeight;
  const smoothAreaPath = `${smoothLinePath} L${xFor(data.length - 1)},${baselineY} L${xFor(0)},${baselineY} Z`;

  const last = data[data.length - 1];
  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="min-w-0 rounded-md border border-black/10 p-4 dark:border-white/10">
      <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase text-[var(--chart-text-secondary)]">
        <span
          aria-hidden
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        {title}
      </h3>
      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label={`${title}: ${formatValue(last?.value ?? 0)} as of ${last?.date ?? "n/a"}`}
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
            let nearest = 0;
            let nearestDistance = Infinity;
            data.forEach((_, index) => {
              const distance = Math.abs(xFor(index) - relativeX);
              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = index;
              }
            });
            setHoverIndex(nearest);
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.24} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {Array.from({ length: GRID_STEPS + 1 }, (_, step) => {
            const y = PAD_TOP + (innerHeight / GRID_STEPS) * step;
            return (
              <line
                key={step}
                x1={PAD_LEFT}
                y1={y}
                x2={WIDTH - PAD_RIGHT}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth={1}
              />
            );
          })}

          <path
            d={smoothAreaPath}
            fill={`url(#${gradientId})`}
            stroke="none"
            style={{ opacity: 0, animation: "chart-fade-in 700ms ease-out 150ms forwards" }}
          />
          <path
            d={smoothLinePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1,
              animation: "chart-draw-in 900ms ease-out forwards",
            }}
          />

          {hovered && (
            <line
              x1={xFor(hoverIndex ?? 0)}
              y1={PAD_TOP}
              x2={xFor(hoverIndex ?? 0)}
              y2={PAD_TOP + innerHeight}
              stroke="var(--chart-baseline)"
              strokeWidth={1}
            />
          )}

          {/* End marker: filled dot with a surface-color ring so it reads over the line. */}
          <circle cx={xFor(data.length - 1)} cy={yFor(last?.value ?? 0)} r={6} fill="var(--background)" />
          <circle cx={xFor(data.length - 1)} cy={yFor(last?.value ?? 0)} r={4} fill={color} />

          {hovered && hoverIndex !== data.length - 1 && (
            <>
              <circle cx={xFor(hoverIndex ?? 0)} cy={yFor(hovered.value)} r={6} fill="var(--background)" />
              <circle cx={xFor(hoverIndex ?? 0)} cy={yFor(hovered.value)} r={4} fill={color} />
            </>
          )}

          <text
            x={xFor(data.length - 1)}
            y={yFor(last?.value ?? 0) - 10}
            textAnchor={isSinglePoint ? "middle" : "end"}
            className="fill-current text-[13px] font-medium"
          >
            {formatValue(last?.value ?? 0)}
          </text>

          {isSinglePoint ? (
            <text x={xFor(0)} y={HEIGHT - 6} textAnchor="middle" fill="var(--chart-muted)" className="text-[12px]">
              {data[0]?.date}
            </text>
          ) : (
            <>
              <text x={xFor(0)} y={HEIGHT - 6} textAnchor="start" fill="var(--chart-muted)" className="text-[12px]">
                {data[0]?.date}
              </text>
              <text x={xFor(data.length - 1)} y={HEIGHT - 6} textAnchor="end" fill="var(--chart-muted)" className="text-[12px]">
                {last?.date}
              </text>
            </>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded border border-black/10 bg-[var(--background)] px-2 py-1 text-xs shadow-sm dark:border-white/10"
            style={{ left: `${(xFor(hoverIndex ?? 0) / WIDTH) * 100}%` }}
          >
            <div className="font-semibold">{formatValue(hovered.value)}</div>
            <div className="text-[var(--chart-text-secondary)]">{hovered.date}</div>
          </div>
        )}
      </div>
    </div>
  );
}
