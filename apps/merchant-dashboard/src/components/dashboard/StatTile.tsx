export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 p-6 dark:border-white/10">
      <h2 className="text-xs font-medium uppercase text-black/60 dark:text-white/60">
        {label}
      </h2>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
