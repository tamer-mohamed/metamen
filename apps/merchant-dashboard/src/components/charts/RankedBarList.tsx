import { formatPiastres } from "@metamen/core";
import type { RankedEntry } from "@/lib/analytics";

export function RankedBarList({
  title,
  color,
  entries,
}: {
  title: string;
  color: string;
  entries: RankedEntry[];
}) {
  const maxValue = Math.max(...entries.map((entry) => entry.valueInPiastres), 1);

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

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">
          No data yet.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2.5">
          {entries.map((entry, index) => {
            const fillPercent = Math.max(
              4,
              Math.round((entry.valueInPiastres / maxValue) * 100),
            );
            return (
              <div key={entry.label} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 truncate" title={entry.label}>
                  {entry.label}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--meter-track)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${fillPercent}%`,
                      backgroundColor: color,
                      transformOrigin: "left",
                      animation: `chart-grow-x 500ms ease-out ${index * 70}ms both`,
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right font-medium">
                  {formatPiastres(entry.valueInPiastres)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
