import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { BsPlusLg, BsDatabase } from 'react-icons/bs';
import Sidebar from './SideBar';
import EVDataVisualization from './EVDataVisualization';
import KpiCards from './KpiCards';
import FilterChips from './FilterChips';
import EmptyState from './EmptyState';
import ChartCard from './ChartCard';
import { processEVData, validateSchema } from './dataProcessor';
import sampleCsvUrl from '../Electric_Vehicle_Population_Data.csv?url';

const EMPTY_FILTERS = { type: null, make: null, county: null, year: null };

function applyFilters(rows, filters) {
  return rows.filter((row) => {
    if (filters.type && row['Electric Vehicle Type'] !== filters.type) return false;
    if (filters.make && row.Make !== filters.make) return false;
    if (filters.county && row.County !== filters.county) return false;
    if (filters.year && String(row['Model Year']) !== String(filters.year)) return false;
    return true;
  });
}

export default function MainPage() {
  const [rawRows, setRawRows] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showSidebar, setShowSidebar] = useState(false);

  const ingest = (rows, label) => {
    const check = validateSchema(rows);
    if (!check.ok) {
      setStatus('error');
      setError(check.message);
      return;
    }
    setRawRows(rows);
    setSourceLabel(label);
    setFilters(EMPTY_FILTERS);
    setStatus('ready');
    setError('');
  };

  // Auto-load the bundled sample CSV on first visit (parsed in a worker).
  useEffect(() => {
    let cancelled = false;
    Papa.parse(sampleCsvUrl, {
      download: true,
      worker: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (cancelled) return;
        if (result.errors && result.errors.length > 0) {
          setStatus('error');
          setError('Could not parse the bundled sample dataset.');
          return;
        }
        ingest(result.data, `Sample dataset · ${result.data.length.toLocaleString()} rows`);
      },
      error: (err) => {
        if (cancelled) return;
        setStatus('error');
        setError(`Could not load the bundled sample dataset: ${err.message}`);
      },
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReplaceDataset = (rows, fileName) => {
    ingest(rows, `${fileName} · ${rows.length.toLocaleString()} rows`);
    setShowSidebar(false);
  };

  const selectFilter = (key, value) => {
    if (value === null || value === undefined || value === '') return;
    setFilters((f) => ({ ...f, [key]: f[key] === value ? null : value }));
  };
  const clearOne = (key) => setFilters((f) => ({ ...f, [key]: null }));
  const clearAll = () => setFilters(EMPTY_FILTERS);

  const filteredRows = useMemo(() => applyFilters(rawRows, filters), [rawRows, filters]);
  const processed = useMemo(
    () => (rawRows.length > 0 ? processEVData(filteredRows) : null),
    [rawRows, filteredRows]
  );

  const loading = status === 'loading';

  return (
    <>
      {/* Page header */}
      <div className="flex sticky top-16 z-10 px-8 py-4 w-full justify-between items-center dark:bg-[#1F1F1F] bg-gray-50 dark:border-[#33383F] border-b border-[#E0E0E0]">
        <div>
          <div className="dark:text-white text-black text-base font-medium">Electric Vehicle Data Insights</div>
          {sourceLabel && (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <BsDatabase /> {sourceLabel}
              {filteredRows.length !== rawRows.length && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 font-semibold text-blue-700 dark:text-blue-300">
                  {filteredRows.length.toLocaleString()} shown
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowSidebar(true)}
          className="flex items-center rounded-md py-2 px-3 text-sm dark:bg-[#1F1F1F] bg-white border dark:border-[#343A40] text-black dark:text-white transition hover:shadow"
        >
          {rawRows.length > 0 ? 'Replace DataSet' : 'Add DataSet'} <BsPlusLg className="ml-2" />
        </button>
      </div>

      {showSidebar && (
        <Sidebar onClose={() => setShowSidebar(false)} onDataset={handleReplaceDataset} />
      )}

      <div className="px-8 py-6 space-y-5">
        {status === 'error' && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5">
            <h3 className="font-semibold text-red-800 dark:text-red-200">Couldn't load the dataset</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setShowSidebar(true)}
              className="mt-3 rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Upload a CSV instead
            </button>
          </div>
        )}

        {(loading || status === 'ready') && (
          <>
            {status === 'ready' && <FilterChips filters={filters} onClearOne={clearOne} onClearAll={clearAll} />}
            <KpiCards processed={processed} loading={loading} />
            {loading ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <ChartCard key={i} title="" loading />
                ))}
              </div>
            ) : filteredRows.length === 0 ? (
              <EmptyState
                message="No vehicles match the current filters. Try removing a filter or two."
                onClear={clearAll}
              />
            ) : (
              <EVDataVisualization processed={processed} onSelect={selectFilter} />
            )}
          </>
        )}
      </div>
    </>
  );
}
