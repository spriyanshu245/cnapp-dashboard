// Reusable dashboard widgets. All charts are recharts; all respect dark mode
// via Tailwind classes and take an accent color prop.
import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { useCountUp } from './useCountUp';
import { formatKpi } from '../data/engine';

const CATEGORICAL = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export function useIsDark() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

function Delta({ pct, label, invert }) {
  if (pct == null || Number.isNaN(pct)) return null;
  const up = pct >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
        good ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'
      }`}
    >
      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%{label ? ` ${label}` : ''}
    </span>
  );
}

export function KpiCard({ kpi, index = 0, accent = '#3b82f6' }) {
  const display = formatKpi(kpi);
  const numeric = typeof kpi.value === 'number';
  const animated = useCountUp(numeric ? kpi.value : 0, { duration: 800 });
  const shown = kpi.format === 'text' ? display : numeric ? formatKpi({ ...kpi, value: parseFloat(animated) || 0 }) : display;
  return (
    <div
      className="chart-enter rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm backdrop-blur"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{kpi.label}</p>
        <Delta pct={kpi.deltaPct} label={kpi.deltaLabel} invert={kpi.invert} />
      </div>
      <p className="mt-2 truncate text-[1.7rem] font-bold tracking-tight text-gray-900 dark:text-white" title={display}>
        {shown}
      </p>
      {kpi.sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{kpi.sub}</p>}
      {kpi.spark && kpi.spark.length > 1 && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpi.spark.map((y, i) => ({ i, y }))} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="y" stroke={accent} strokeWidth={1.8} fill={`url(#spark-${kpi.id})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const tickStyle = (dark) => ({ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 11 });

export function TrendChart({ spec, accent = '#3b82f6', height = 300 }) {
  const dark = useIsDark();
  const data = useMemo(() => {
    const d = spec.data || [];
    if (d.length <= 40) return d;
    const step = Math.ceil(d.length / 40);
    return d.filter((_, i) => i % step === 0);
  }, [spec]);
  return (
    <ChartCard title={spec.title} subtitle={spec.subtitle}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.45} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#ffffff12' : '#00000010'} vertical={false} />
            <XAxis dataKey="x" tick={tickStyle(dark)} axisLine={false} tickLine={false} minTickGap={48} />
            <YAxis tick={tickStyle(dark)} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : v)} />
            <Tooltip content={<ChartTooltip money={spec.money} />} />
            <Area type="monotone" dataKey="y" stroke={accent} strokeWidth={2.4} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function DonutChart({ spec, height = 300 }) {
  const dark = useIsDark();
  const total = spec.data.reduce((a, d) => a + d.value, 0) || 1;
  return (
    <ChartCard title={spec.title} subtitle={spec.subtitle}>
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip money={spec.money} />} />
            <Pie data={spec.data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} strokeWidth={0}>
              {spec.data.map((_, i) => (
                <Cell key={i} fill={CATEGORICAL[i % CATEGORICAL.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{spec.data.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">segments</p>
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {spec.data.slice(0, 6).map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORICAL[i % CATEGORICAL.length] }} />
            <span className="truncate text-gray-600 dark:text-gray-300">{d.name}</span>
            <span className="ml-auto font-semibold text-gray-900 dark:text-white">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function BarsChart({ spec, accent = '#3b82f6', height = 300, onSelect }) {
  const dark = useIsDark();
  const data = (spec.data || []).slice(0, 8);
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ChartCard title={spec.title} subtitle={spec.subtitle}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#ffffff12' : '#00000010'} horizontal={false} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ ...tickStyle(dark), width: 110 }} axisLine={false} tickLine={false} width={118} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? '#ffffff08' : '#00000008' }} />
            <Bar dataKey="value" radius={[4, 8, 8, 4]} onClick={(d) => onSelect && onSelect(d?.name)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
              {data.map((d, i) => (
                <Cell key={d.name} fill={accent} fillOpacity={0.55 + 0.45 * (d.value / max)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
