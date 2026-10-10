import { BsCarFront, BsLightningCharge, BsSpeedometer2, BsTrophy } from 'react-icons/bs';
import { useCountUp } from './useCountUp';

function Kpi({ icon: Icon, label, value, sub, index, accent }) {
  return (
    <div
      className="chart-enter rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>
          <Icon className="text-lg text-white" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
  );
}

/**
 * KPI stat cards with animated count-ups, computed from the (filtered) dataset.
 */
export default function KpiCards({ processed, loading = false }) {
  const total = processed?.totalVehicles ?? 0;
  const bev = processed?.vehicleTypeData?.find((d) => d.name.includes('Battery Electric'))?.value ?? 0;
  const phev = processed?.vehicleTypeData?.find((d) => d.name.includes('Plug-in Hybrid'))?.value ?? 0;
  const bevShare = total > 0 ? (bev / (bev + phev || 1)) * 100 : 0;
  const avgRange = processed?.rangeStats?.average ?? 0;
  const topMake = processed?.manufacturerData?.[0];

  const totalStr = useCountUp(total, { duration: 900 });
  const shareStr = useCountUp(bevShare, { duration: 900, decimals: 1 });
  const rangeStr = useCountUp(avgRange, { duration: 900 });
  const topMakeCount = useCountUp(topMake?.count ?? 0, { duration: 900 });

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="mt-3 h-8 w-2/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi index={0} icon={BsCarFront} label="Vehicles" value={totalStr} sub="in current view" accent="bg-blue-500" />
      <Kpi index={1} icon={BsLightningCharge} label="BEV share" value={`${shareStr}%`} sub={`${bev.toLocaleString()} battery electric`} accent="bg-emerald-500" />
      <Kpi index={2} icon={BsSpeedometer2} label="Avg. range" value={`${rangeStr} mi`} sub="electric range" accent="bg-violet-500" />
      <Kpi
        index={3}
        icon={BsTrophy}
        label="Top make"
        value={topMake ? topMake.name : '—'}
        sub={topMake ? `${topMakeCount} vehicles` : undefined}
        accent="bg-amber-500"
      />
    </div>
  );
}
