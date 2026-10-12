import { BsFilter } from 'react-icons/bs';

const shortVal = (v) =>
  v === 'Battery Electric Vehicle (BEV)' ? 'BEV' : v === 'Plug-in Hybrid Electric Vehicle (PHEV)' ? 'PHEV' : String(v);

/**
 * Active cross-filter chips (generic across datasets) with per-chip clear + clear-all.
 */
export default function FilterChips({ filters, labels = {}, onClearOne, onClearAll }) {
  const active = Object.entries(filters).filter(([, v]) => v !== null && v !== undefined);

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        <BsFilter /> Filters
      </span>
      {active.length === 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Click any bar or segment to cross-filter the dashboard
        </span>
      )}
      {active.map(([key, value]) => (
        <button
          key={key}
          onClick={() => onClearOne(key)}
          className="group flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200 transition hover:bg-blue-200 dark:hover:bg-blue-900/70"
          title="Remove filter"
        >
          <span className="text-blue-500 dark:text-blue-400">{labels[key] || key}:</span>
          <span className="max-w-[180px] truncate font-semibold">{shortVal(value)}</span>
          <span className="text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-200">✕</span>
        </button>
      ))}
      {active.length > 0 && (
        <button
          onClick={onClearAll}
          className="rounded-full px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 underline-offset-2 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
