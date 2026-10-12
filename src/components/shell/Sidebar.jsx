import { NavLink } from 'react-router-dom';
import { BsGrid1X2Fill, BsBarChartLineFill, BsBroadcast, BsDatabase } from 'react-icons/bs';
import { useDashboard } from '../../state/DashboardContext';

const NAV = [
  { to: '/', label: 'Overview', icon: BsGrid1X2Fill, end: true },
  { to: '/analytics', label: 'Analytics', icon: BsBarChartLineFill },
  { to: '/live', label: 'Live', icon: BsBroadcast },
];

export default function Sidebar({ onOpenConfig }) {
  const { dataset, rows, status } = useDashboard();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-blue-500/30">
          ◉
        </span>
        <div>
          <p className="text-[1.05rem] font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">Pulse</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Insights</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-500/12 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <n.icon className="text-base" />
            {n.label}
            {n.to === '/live' && (
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 live-dot" title="Stream available" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onOpenConfig}
          className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-3.5 text-left transition hover:border-blue-400/50 hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <BsDatabase /> Dataset
          </div>
          <p className="mt-1.5 truncate text-sm font-bold text-gray-900 dark:text-white">{dataset.name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {status === 'ready' ? `${rows.length.toLocaleString()} records` : dataset.tagline}
          </p>
          <p className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400">Switch →</p>
        </button>
        <p className="mt-3 px-1 text-[11px] text-gray-400 dark:text-gray-500">Pulse v2 · demo workspace</p>
      </div>
    </aside>
  );
}
