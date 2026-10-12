import { useEffect, useRef } from 'react';
import { BsX, BsCheck2, BsUpload } from 'react-icons/bs';
import { useDashboard } from '../state/DashboardContext';

const ACCENTS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const WIDGET_LABELS = {
  kpis: 'KPI cards', trend: 'Trend chart', donut: 'Mix donut',
  bars: 'Leaderboard', table: 'Data table', feed: 'Info panel',
};

export default function ConfigDrawer({ open, onClose }) {
  const { datasets, datasetId, setDatasetId, dataset, config, updateConfig, toggleWidget, replaceDataset } = useDashboard();
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="drawer-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="drawer-panel absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#101014] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">Configure</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Datasets, widgets & theme</p>
          </div>
          <button onClick={onClose} aria-label="Close configurator" className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
            <BsX className="text-xl" />
          </button>
        </div>

        {/* Dataset */}
        <section className="mt-7">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Dataset</h3>
          <div className="space-y-2.5">
            {datasets.map((d) => {
              const active = d.id === datasetId;
              return (
                <button
                  key={d.id}
                  onClick={() => setDatasetId(d.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                    active
                      ? 'border-blue-500/60 bg-blue-500/8 shadow-md'
                      : 'border-gray-200 dark:border-white/10 hover:border-blue-400/40'
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black text-white" style={{ background: active ? config.accent : '#6b728055' }}>
                    {d.name[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-gray-900 dark:text-white">{d.name}</span>
                    <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{d.tagline}</span>
                  </span>
                  {active && <BsCheck2 className="ml-auto shrink-0 text-lg text-blue-500" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Widgets */}
        <section className="mt-7">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Overview widgets</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(WIDGET_LABELS).map(([key, label]) => {
              const on = config.widgets[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleWidget(key)}
                  className={`rounded-xl border px-3.5 py-3 text-sm font-semibold text-left transition ${
                    on
                      ? 'border-blue-500/60 bg-blue-500/8 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <span className={`mr-2 inline-block h-2 w-2 rounded-full ${on ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Accent */}
        <section className="mt-7">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Accent color</h3>
          <div className="flex gap-2.5">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => updateConfig({ accent: c })}
                aria-label={`Accent ${c}`}
                className={`h-10 w-10 rounded-full transition hover:scale-110 ${config.accent === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </section>

        {/* Data */}
        <section className="mt-7">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Data source</h3>
          {dataset.kind === 'csv' ? (
            <>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files[0]) replaceDataset(e.target.files[0]); e.target.value = ''; }} />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-white/15 px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 transition hover:border-blue-400/60 hover:text-blue-500"
              >
                <BsUpload /> Upload your own CSV
              </button>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Must match the EV dataset schema — validated on load.</p>
            </>
          ) : (
            <p className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 p-4 text-sm text-gray-500 dark:text-gray-400">
              This is a built-in synthetic model — deterministic, so every demo shows the same numbers.
            </p>
          )}
        </section>

        <p className="mt-8 text-center text-[11px] text-gray-400 dark:text-gray-500">Configuration is saved locally in your browser.</p>
      </aside>
    </div>
  );
}
