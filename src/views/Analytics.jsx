import { useMemo } from 'react';
import { useDashboard } from '../state/DashboardContext';
import { TrendChart, DonutChart, BarsChart } from '../components/widgets';
import FilterChips from '../components/FilterChips';
import EmptyState from '../components/EmptyState';

function DimPanel({ dim, rows, active, onToggle, accent }) {
  const options = useMemo(() => {
    const counts = {};
    rows.forEach((r) => {
      const v = dim.get(r);
      if (v == null || v === '') return;
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [dim, rows]);
  const max = Math.max(...options.map((o) => o.count), 1);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{dim.label}</p>
      <div className="space-y-1">
        {options.map((o) => {
          const isActive = active === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onToggle(dim.key, o.value)}
              className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                isActive ? 'bg-blue-500/12 font-semibold text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{o.value}</span>
              <span className="text-xs tabular-nums text-gray-400">{o.count.toLocaleString()}</span>
              <span className="h-1.5 rounded-full transition-all" style={{ width: `${Math.max(8, (o.count / max) * 56)}px`, background: isActive ? accent : '#9ca3af55' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { dataset, rows, filtered, summary, status, filters, setFilter, clearFilter, clearFilters, config } = useDashboard();
  const accent = config.accent;

  const chips = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null)),
    [filters]
  );
  const labels = useMemo(
    () => Object.fromEntries(dataset.dimensions.map((d) => [d.key, d.label])),
    [dataset]
  );

  const selectDim = (key, value) => setFilter(key, value);
  const barDim = dataset.dimensions.find((d) => ['make', 'region', 'plan', 'channel', 'county'].includes(d.key));

  return (
    <div className="px-4 sm:px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Explorer</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Slice {dataset.name.toLowerCase()} by any dimension — every chart follows.</p>
      </div>

      <FilterChips filters={chips} labels={labels} onClearOne={clearFilter} onClearAll={clearFilters} />

      {status === 'loading' || !summary ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState message="No records match the current filters." onClear={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            {dataset.dimensions.map((dim) => (
              <DimPanel key={dim.key} dim={dim} rows={rows} active={filters[dim.key]} onToggle={selectDim} accent={accent} />
            ))}
          </div>
          <div className="space-y-4 min-w-0">
            <TrendChart spec={dataset.trend(summary)} accent={accent} />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DonutChart spec={dataset.donut(summary)} />
              <BarsChart
                spec={dataset.bars(summary)}
                accent={accent}
                onSelect={(name) => barDim && selectDim(barDim.key, name)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
