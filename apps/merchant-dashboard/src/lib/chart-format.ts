import { formatPiastres } from "@metamen/core";

export type ChartValueFormat = "currency" | "count";

export function formatChartValue(format: ChartValueFormat, value: number): string {
  return format === "currency" ? formatPiastres(value) : value.toLocaleString("en-US");
}
