import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Papa from 'papaparse';
import { DATASETS, getDataset } from '../data/engine';

const Ctx = createContext(null);
export const useDashboard = () => useContext(Ctx);

const DEFAULT_CONFIG = {
  widgets: { kpis: true, trend: true, donut: true, bars: true, table: true, feed: true },
  accent: '#3b82f6',
  density: 'comfortable',
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function DashboardProvider({ children }) {
  const [datasetId, setDatasetId] = useState(() => localStorage.getItem('pulse-dataset') || 'ev');
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [filters, setFilters] = useState({});
  const [config, setConfig] = useState(() => loadJSON('pulse-config', DEFAULT_CONFIG));

  const dataset = getDataset(datasetId);

  const ingest = useCallback((nextRows, label, ds) => {
    if (ds.validate) {
      const check = ds.validate(nextRows);
      if (!check.ok) {
        setStatus('error');
        setError(check.message);
        return false;
      }
    }
    setRows(nextRows);
    setSourceLabel(label);
    setFilters({});
    setStatus('ready');
    setError('');
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');
    setFilters({});
    try { localStorage.setItem('pulse-dataset', datasetId); } catch { /* noop */ }
    dataset
      .load()
      .then((r) => {
        if (cancelled) return;
        ingest(r, dataset.kind === 'csv' ? `Sample dataset · ${r.length.toLocaleString()} rows` : `Live model · ${r.length.toLocaleString()} records`, dataset);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setError('Could not load the dataset.');
      });
    return () => { cancelled = true; };
  }, [datasetId, dataset, ingest]);

  const replaceDataset = useCallback(
    (file) => {
      setStatus('loading');
      Papa.parse(file, {
        header: true, dynamicTyping: true, skipEmptyLines: true,
        complete: (result) => ingest(result.data || [], `${file.name} · ${(result.data || []).length.toLocaleString()} rows`, dataset),
        error: () => { setStatus('error'); setError('Could not parse that file.'); },
      });
    },
    [dataset, ingest]
  );

  const filtered = useMemo(() => dataset.applyFilters(rows, filters), [dataset, rows, filters]);
  const summary = useMemo(() => (rows.length ? dataset.process(filtered) : null), [dataset, rows, filtered]);

  const setFilter = useCallback((key, value) => {
    if (value == null || value === '') return;
    setFilters((f) => ({ ...f, [key]: f[key] === value ? undefined : value }));
  }, []);
  const clearFilter = useCallback((key) => {
    setFilters((f) => { const n = { ...f }; delete n[key]; return n; });
  }, []);
  const clearFilters = useCallback(() => setFilters({}), []);

  const updateConfig = useCallback((patch) => {
    setConfig((c) => {
      const next = { ...c, ...patch };
      try { localStorage.setItem('pulse-config', JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);
  const toggleWidget = useCallback((key) => {
    setConfig((c) => {
      const next = { ...c, widgets: { ...c.widgets, [key]: !c.widgets[key] } };
      try { localStorage.setItem('pulse-config', JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const value = {
    dataset, datasetId, setDatasetId, datasets: DATASETS,
    rows, filtered, summary, status, error, sourceLabel,
    filters, setFilter, clearFilter, clearFilters,
    config, updateConfig, toggleWidget,
    replaceDataset,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
