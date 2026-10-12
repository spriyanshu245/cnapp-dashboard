import { useEffect, useRef, useState } from 'react';
import { BsPlayFill, BsPauseFill, BsBroadcast } from 'react-icons/bs';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../state/DashboardContext';
import ActivityFeed from '../components/ActivityFeed';
import ChartCard from '../components/ChartCard';

let uid = 0;
const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

export default function LiveView() {
  const { dataset, rows, summary, status, config } = useDashboard();
  const accent = config.accent;
  const [playing, setPlaying] = useState(false);
  const [events, setEvents] = useState([]);
  const [ticks, setTicks] = useState(0);
  const [series, setSeries] = useState([]);
  const timer = useRef(null);

  // Seed the live series from the dataset trend tail
  useEffect(() => {
    if (!summary) return;
    const tail = dataset.trend(summary).data.slice(-24).map((d, i) => ({ x: i, y: d.y }));
    setSeries(tail);
    setEvents([]);
    setTicks(0);
    setPlaying(false);
  }, [dataset, summary]);

  useEffect(() => {
    if (!playing || !summary) return;
    timer.current = setInterval(() => {
      const ev = dataset.liveEvent(rows);
      if (ev) {
        setEvents((es) => [{ id: ++uid, time: now(), ...ev }, ...es].slice(0, 30));
      }
      setTicks((t) => t + 1);
      setSeries((s) => {
        const last = s[s.length - 1]?.y ?? 100;
        const next = Math.max(1, last * (1 + (Math.random() - 0.45) * 0.12));
        return [...s.slice(-29), { x: (s[s.length - 1]?.x ?? 0) + 1, y: Math.round(next) }];
      });
    }, 1400);
    return () => clearInterval(timer.current);
  }, [playing, dataset, rows, summary]);

  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Live stream
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${playing ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${playing ? 'bg-emerald-500 live-dot' : 'bg-gray-400'}`} />
              {playing ? 'Streaming' : 'Paused'}
            </span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dataset.name} · simulated real-time feed</p>
        </div>
        <button
          onClick={() => status === 'ready' && setPlaying((p) => !p)}
          disabled={status !== 'ready'}
          className="ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-40"
          style={{ background: accent, boxShadow: `0 8px 24px ${accent}55` }}
        >
          {playing ? <BsPauseFill /> : <BsPlayFill />}
          {playing ? 'Pause' : status === 'ready' ? 'Start stream' : 'Loading…'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Events processed', value: ticks.toLocaleString() },
          { label: 'Throughput', value: playing ? '~43/min' : '—' },
          { label: 'Stream health', value: playing ? 'Nominal' : 'Idle' },
        ].map((s, i) => (
          <div key={s.label} className="chart-enter rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartCard title="Live throughput" subtitle="Rolling window">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="liveFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accent} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="y" stroke={accent} strokeWidth={2.4} fill="url(#liveFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
        <div className="xl:col-span-2">
          <ActivityFeed events={events} accent={accent} />
        </div>
      </div>

      {!playing && events.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <BsBroadcast className="text-blue-500" />
          Hit <strong>Start stream</strong> — this is the moment that lands in demos.
        </p>
      )}
    </div>
  );
}
