import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { useDarkMode } from './useDarkMode';

const PALETTE = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1'];
const TYPE_SHORT = {
  'Battery Electric Vehicle (BEV)': 'BEV',
  'Plug-in Hybrid Electric Vehicle (PHEV)': 'PHEV',
};

const payloadOf = (d) => (d && d.payload) || d || {};
const fmtInt = (v) => Number(v).toLocaleString('en-US');

function axisTheme(dark) {
  return {
    tick: { fill: dark ? '#9ca3af' : '#6b7280', fontSize: 11 },
    grid: dark ? '#1f2937' : '#e9edf2',
  };
}

function Gradient({ id, from, to }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  );
}

/**
 * Full chart grid. Clicking pie slices, bars and line points cross-filters
 * every chart via onSelect(filterKey, value) — values toggle in the parent.
 */
export default function EVDataVisualization({ processed, onSelect }) {
  const dark = useDarkMode();
  const t = axisTheme(dark);
  const {
    vehicleTypeData, manufacturerData, countyData, rangeData,
    yearData, cafvData, modelData, rangeStats, cityData,
  } = processed;

  const makeFromModel = (modelName) => {
    const hit = manufacturerData.find((m) => modelName.startsWith(m.name + ' '));
    return hit ? hit.name : String(modelName).split(' ')[0];
  };

  const vTicks = { ...t.tick };
  const compact = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : v);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Vehicle type — donut, click to filter */}
      <ChartCard index={0} title="Vehicle type" subtitle="Click a slice to filter" clickable>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={vehicleTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={95}
              paddingAngle={3}
              cornerRadius={5}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              onClick={(d) => onSelect('type', payloadOf(d).name)}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              {vehicleTypeData.map((entry, i) => (
                <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} stroke={dark ? '#111827' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip labelFormatter={(l) => TYPE_SHORT[l] || l} />} />
            <Legend formatter={(v) => TYPE_SHORT[v] || v} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* CAFV eligibility — donut */}
      <ChartCard index={1} title="CAFV eligibility" subtitle="Clean Alternative Fuel Vehicle status">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={cafvData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={95}
              paddingAngle={3}
              cornerRadius={5}
              label={({ percent }) => (percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
              labelLine={false}
            >
              {cafvData.map((entry, i) => (
                <Cell key={entry.name} fill={PALETTE[(i + 2) % PALETTE.length]} stroke={dark ? '#111827' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(v) => (v.length > 34 ? v.slice(0, 34) + '…' : v)} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Manufacturers — horizontal bars, click to filter */}
      <ChartCard index={2} title="Top manufacturers" subtitle="Click a bar to filter by make" clickable>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={manufacturerData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <Gradient id="gradMake" from="#3b82f6" to="#1e40af" />
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
            <XAxis type="number" tick={vTicks} tickFormatter={compact} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={vTicks} width={78} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" name="Vehicles" fill="url(#gradMake)" radius={[0, 6, 6, 0]} barSize={18}
              onClick={(d) => onSelect('make', payloadOf(d).name)} style={{ cursor: 'pointer' }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Counties — horizontal bars, click to filter */}
      <ChartCard index={3} title="Top counties" subtitle="Click a bar to filter by county" clickable>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={countyData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <Gradient id="gradCounty" from="#10b981" to="#047857" />
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
            <XAxis type="number" tick={vTicks} tickFormatter={compact} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={vTicks} width={78} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" name="Vehicles" fill="url(#gradCounty)" radius={[0, 6, 6, 0]} barSize={18}
              onClick={(d) => onSelect('county', payloadOf(d).name)} style={{ cursor: 'pointer' }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Range distribution */}
      <ChartCard
        index={4}
        title="Electric range distribution"
        subtitle={`Avg ${rangeStats.average.toFixed(0)} mi · Median ${rangeStats.median} mi · Min ${rangeStats.min} mi · Max ${rangeStats.max} mi`}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rangeData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <Gradient id="gradRange" from="#8b5cf6" to="#5b21b6" />
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="range" tick={vTicks} axisLine={false} tickLine={false} />
            <YAxis tick={vTicks} tickFormatter={compact} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" name="Vehicles" fill="url(#gradRange)" radius={[6, 6, 0, 0]} barSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Model year trend — click a point to filter */}
      <ChartCard index={5} title="Adoption over time" subtitle="Click a point to filter by model year" clickable>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={yearData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="year" tick={vTicks} axisLine={false} tickLine={false} />
            <YAxis tick={vTicks} tickFormatter={compact} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone" dataKey="count" name="Vehicles"
              stroke="#06b6d4" strokeWidth={2.5}
              dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#06b6d4', stroke: dark ? '#111827' : '#fff', strokeWidth: 2 }}
              onClick={(d) => onSelect('year', payloadOf(d).year)}
              style={{ cursor: 'pointer' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top models — horizontal bars, click filters by make */}
      <ChartCard index={6} title="Top models" subtitle="Click a bar to filter by its make" clickable>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={modelData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <Gradient id="gradModel" from="#f59e0b" to="#b45309" />
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
            <XAxis type="number" tick={vTicks} tickFormatter={compact} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ ...vTicks, fontSize: 10 }} width={118} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" name="Vehicles" fill="url(#gradModel)" radius={[0, 6, 6, 0]} barSize={14}
              onClick={(d) => onSelect('make', makeFromModel(payloadOf(d).name))} style={{ cursor: 'pointer' }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cities */}
      <ChartCard index={7} title="Top cities" subtitle="By registered vehicles">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={cityData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <Gradient id="gradCity" from="#ec4899" to="#9d174d" />
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
            <XAxis type="number" tick={vTicks} tickFormatter={compact} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ ...vTicks, fontSize: 10 }} width={92} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" name="Vehicles" fill="url(#gradCity)" radius={[0, 6, 6, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
