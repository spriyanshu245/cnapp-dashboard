import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BsGearFill, BsPlayCircleFill, BsMoonStarsFill, BsSunFill, BsGrid1X2Fill, BsBarChartLineFill, BsBroadcast } from 'react-icons/bs';
import { useDashboard } from '../state/DashboardContext';

const TITLES = { '/': 'Overview', '/analytics': 'Analytics', '/live': 'Live stream' };
const MOBILE_NAV = [
  { to: '/', label: 'Overview', icon: BsGrid1X2Fill, end: true },
  { to: '/analytics', label: 'Analytics', icon: BsBarChartLineFill },
  { to: '/live', label: 'Live', icon: BsBroadcast },
];

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pulse-theme');
      const isDark = saved ? saved === 'dark' : true;
      document.documentElement.classList.toggle('dark', isDark);
      setDark(isDark);
    } catch { /* noop */ }
  }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('pulse-theme', next ? 'dark' : 'light'); } catch { /* noop */ }
    setDark(next);
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 transition hover:border-blue-400/60 hover:text-blue-500"
    >
      {dark ? <BsSunFill /> : <BsMoonStarsFill />}
    </button>
  );
}

export default function TopBar({ onOpenConfig, onPitch }) {
  const { dataset, config } = useDashboard();
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-white/10 bg-white/75 dark:bg-black/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 sm:px-8 py-3.5 lg:pl-8">
        <div className="lg:hidden flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-black text-white">◉</span>
          <span className="font-extrabold tracking-tight text-gray-900 dark:text-white">Pulse</span>
        </div>
        <h1 className="hidden sm:block text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          {TITLES[pathname] || 'Overview'}
        </h1>
        <button
          onClick={onOpenConfig}
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 transition hover:border-blue-400/60"
          title="Switch dataset / configure"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: config.accent }} />
          {dataset.name}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onPitch}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-blue-600/40 hover:brightness-110 active:scale-95"
          >
            <BsPlayCircleFill /> <span className="hidden sm:inline">Present</span>
          </button>
          <button
            onClick={onOpenConfig}
            aria-label="Configure dashboard"
            className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 transition hover:border-blue-400/60 hover:text-blue-500"
          >
            <BsGearFill />
          </button>
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-1 px-4 pb-2.5 lg:hidden">
        {MOBILE_NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                isActive ? 'bg-blue-500/12 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <n.icon /> {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
