import ChartCard from './ChartCard';

// Live event feed — items slide in from the top.
export default function ActivityFeed({ events, accent = '#3b82f6' }) {
  return (
    <ChartCard title="Live activity" subtitle={events.length ? `${events.length} events streaming` : 'Press play to start the stream'}>
      <div className="feed-list max-h-[340px] space-y-2 overflow-y-auto pr-1">
        {events.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            The stream is paused. Nothing to show yet.
          </p>
        )}
        {events.map((e) => (
          <div key={e.id} className="feed-item flex items-start gap-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] p-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full live-dot" style={{ background: accent }} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{e.title}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{e.sub}</p>
            </div>
            <span className="ml-auto shrink-0 text-[11px] tabular-nums text-gray-400 dark:text-gray-500">{e.time}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
