import { useMemo } from 'react';
import { BsDatabase } from 'react-icons/bs';
import { useDashboard } from '../state/DashboardContext';
import { KpiCard, TrendChart, DonutChart, BarsChart } from '../components/widgets';
import DataTable from '../components/DataTable';
import ActivityFeed from '../components/ActivityFeed';
import FilterChips from '../components/FilterChips';
import EmptyState from '../components/EmptyState';
import ChartCard from '../components/ChartCard';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="mt-3 h-8 w-2/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function Overview() {
  const { dataset, summary, status, error, sourceLabel, filtered, rows, filters, clearFilter, clearFilters, config, setFilter } = useDashboard();
  const w = config.widgets;
  const accent = config.accent;

  const chips = useMemo(
    () => Object.entries(filters).filter(([, v]) => v != null).map(([key, value]) => {
      const dim = dataset.dimensions.find((d) => d.key === key);
      return { key, label: dim?.label ?? key, value };
    }),
    [filters, dataset]
  );

  if (status === 'error') {
    return (
      <div className="px-4 sm:px-8 py-6">
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-6">
          <h3 className="font-semibold text-red-800 dark:text-red-200">Couldn't load the dataset</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Dataset header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">{dataset.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dataset.tagline}</p>
        </div>
        {sourceLabel && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <BsDatabase /> {sourceLabel}
          </span>
        )}
      </div>

      {chips.length > 0 && <FilterChips filters={Object.fromEntries(chips.map((c) => [c.key, c.value]))} labels={Object.fromEntries(chips.map((c) => [c.key, c.label]))} onClearOne={clearFilter} onClearAll={clearFilters} />}

      {status === 'loading' || !summary ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState message="No records match the current filters." onClear={clearFilters} />
      ) : (
        <>
          {w.kpis && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dataset.kpis(summary).map((kpi, i) => (
                <KpiCard key={kpi.id} kpi={kpi} index={i} accent={accent} />
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {w.trend && (
              <div className="xl:col-span-2">
                <TrendChart spec={dataset.trend(summary)} accent={accent} />
              </div>
            )}
            {w.donut && <DonutChart spec={dataset.donut(summary)} />}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {w.bars && <BarsChart spec={dataset.bars(summary)} accent={accent} onSelect={(name) => {
              const dim = dataset.dimensions.find((d) => ['make', 'region', 'plan', 'channel', 'county'].includes(d.key));
              if (dim) setFilter(dim.key, name);
            }} />}
            {w.table && <DataTable spec={dataset.table(summary)} />}
          </div>
          {w.feed && (
            <ChartCard title="About this data" subtitle="How to read this dashboard">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Click any bar to filter the whole dashboard by that segment. Use <strong>Present</strong> up top for a
                guided investor walkthrough, or the gear icon to switch datasets and configure widgets.
                {dataset.kind === 'csv' && ' Upload your own CSV from the configurator to analyze private data.'}
              </p>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}
