/**
 * Dark-mode-aware tooltip for recharts (plain HTML so Tailwind dark: works).
 */
export default function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload || payload.length === 0) return null;
  const title = labelFormatter ? labelFormatter(label) : label;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-3 py-2 shadow-xl backdrop-blur">
      {title != null && title !== '' && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color || entry.payload?.fill || '#8884d8' }}
          />
          <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {valueFormatter ? valueFormatter(entry.value, entry) : Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
