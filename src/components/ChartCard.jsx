/**
 * Card wrapper for charts: title, staggered entrance, skeleton loading state.
 */
export default function ChartCard({ title, subtitle, index = 0, loading = false, children, onClick, clickable = false }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="h-5 w-2/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="mt-1 h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="mt-4 h-[280px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="chart-enter rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: `${Math.min(index, 10) * 70}ms` }}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div
        onClick={onClick}
        className={clickable ? 'cursor-pointer' : undefined}
        title={clickable ? 'Click to filter' : undefined}
      >
        {children}
      </div>
    </div>
  );
}
