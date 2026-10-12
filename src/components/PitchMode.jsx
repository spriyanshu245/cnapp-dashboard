import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsX, BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { useDashboard } from '../state/DashboardContext';
import { TrendChart, DonutChart, BarsChart, KpiCard } from './widgets';

// Full-screen guided walkthrough — the investor/client pitch mode.
export default function PitchMode({ onClose }) {
  const { dataset, summary, config } = useDashboard();
  const accent = config.accent;
  const steps = useMemo(() => (summary ? dataset.pitch(summary) : []), [dataset, summary]);
  const [i, setI] = useState(0);

  const next = useCallback(() => setI((v) => Math.min(v + 1, steps.length - 1)), [steps.length]);
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev]);

  if (!steps.length) return null;
  const step = steps[i];

  const visual = (() => {
    if (step.visual === 'trend') return <TrendChart spec={dataset.trend(summary)} accent={accent} height={260} />;
    if (step.visual === 'donut') return <DonutChart spec={dataset.donut(summary)} height={260} />;
    if (step.visual === 'bars') return <BarsChart spec={dataset.bars(summary)} accent={accent} height={260} />;
    const kpis = dataset.kpis(summary).slice(0, 2);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpis.map((kpi, k) => (
          <KpiCard key={kpi.id} kpi={kpi} index={k} accent={accent} />
        ))}
      </div>
    );
  })();

  return (
    <div className="pitch-overlay fixed inset-0 z-[60] flex flex-col bg-[#07070c]/97 backdrop-blur-2xl">
      {/* progress */}
      <div className="flex gap-1.5 px-6 pt-5 max-w-5xl w-full mx-auto">
        {steps.map((_, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Go to step ${k + 1}`}
            className="h-1 flex-1 rounded-full transition" style={{ background: k <= i ? accent : '#ffffff22' }} />
        ))}
      </div>
      <button onClick={onClose} aria-label="Exit presentation"
        className="absolute right-5 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:text-white hover:border-white/40">
        <BsX className="text-xl" />
      </button>

      <div className="flex flex-1 items-center justify-center px-6 py-8 overflow-y-auto">
        <div key={i} className="pitch-step w-full max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>{step.kicker}</p>
          <h2 className="mt-3 text-5xl sm:text-6xl font-extrabold tracking-tight text-white">{step.headline}</h2>
          <p className="mt-2 text-lg text-white/60">{step.sub}</p>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3 [&>div]:!bg-white/[0.04] [&>div]:!border-white/10">{visual}</div>
            <div className="lg:col-span-2 flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Why it matters</p>
              <p className="text-[1.05rem] leading-relaxed text-white/85">{step.insight}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 pb-6 max-w-5xl w-full mx-auto">
        <button onClick={prev} disabled={i === 0}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-30">
          <BsArrowLeft /> Back
        </button>
        <p className="text-sm tabular-nums text-white/40">{i + 1} / {steps.length}</p>
        {i < steps.length - 1 ? (
          <button onClick={next}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-95"
            style={{ background: accent }}>
            Next <BsArrowRight />
          </button>
        ) : (
          <button onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-95"
            style={{ background: accent }}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}
