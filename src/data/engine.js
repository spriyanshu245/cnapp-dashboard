// Dataset registry: every dataset speaks the same adapter interface so the
// whole dashboard (KPIs, charts, filters, live stream, pitch mode) works
// unchanged across EV, SaaS and fintech data.

import Papa from 'papaparse';
import { processEVData, validateSchema } from '../components/dataProcessor';
import { genSaas, genFintech } from './synthetic';
import sampleCsvUrl from '../Electric_Vehicle_Population_Data.csv?url';

const compact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const int = (n) => Math.round(n).toLocaleString('en-US');
const money = (n, cur = '$') => cur + compact(n);
const pct = (n, d = 1) => `${n.toFixed(d)}%`;

// ---------------- EV (bundled CSV) ----------------
const loadEv = () =>
  new Promise((resolve, reject) => {
    Papa.parse(sampleCsvUrl, {
      download: true, worker: true, header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: (r) => (r.errors && r.errors.length ? reject(new Error('parse')) : resolve(r.data)),
      error: (e) => reject(e),
    });
  });

const shortType = (n) => (n.includes('Battery Electric') ? 'BEV' : 'PHEV');

const ev = {
  id: 'ev',
  name: 'EV Population',
  tagline: 'Electric-vehicle adoption intelligence',
  kind: 'csv',
  load: loadEv,
  validate: validateSchema,
  process: (rows) => processEVData(rows),
  applyFilters: (rows, f) =>
    rows.filter(
      (r) =>
        (!f.type || r['Electric Vehicle Type'] === f.type) &&
        (!f.make || r.Make === f.make) &&
        (!f.county || r.County === f.county) &&
        (!f.year || String(r['Model Year']) === String(f.year))
    ),
  dimensions: [
    { key: 'type', label: 'Type', get: (r) => r['Electric Vehicle Type'] },
    { key: 'make', label: 'Make', get: (r) => r.Make },
    { key: 'county', label: 'County', get: (r) => r.County },
    { key: 'year', label: 'Year', get: (r) => (r['Model Year'] != null ? String(r['Model Year']) : null) },
  ],
  kpis: (p) => {
    const total = p.totalVehicles;
    const bev = p.vehicleTypeData.find((d) => d.name.includes('Battery Electric'))?.value ?? 0;
    const phev = p.vehicleTypeData.find((d) => d.name.includes('Plug-in'))?.value ?? 0;
    const share = total ? (bev / (bev + phev || 1)) * 100 : 0;
    const yrs = p.yearData;
    const latest = yrs[yrs.length - 1]?.count ?? 0;
    const prev = yrs[yrs.length - 2]?.count ?? 0;
    const yoy = prev ? ((latest - prev) / prev) * 100 : 0;
    return [
      { id: 'v', label: 'Vehicles', value: total, format: 'int', deltaPct: yoy, deltaLabel: 'YoY', spark: yrs.slice(-12).map((d) => d.count) },
      { id: 's', label: 'BEV share', value: share, format: 'pct', sub: `${int(bev)} battery electric` },
      { id: 'r', label: 'Avg. range', value: p.rangeStats.average, format: 'int', suffix: ' mi', sub: 'electric range' },
      { id: 'm', label: 'Top make', value: p.manufacturerData[0]?.name ?? '—', format: 'text', sub: `${int(p.manufacturerData[0]?.count ?? 0)} vehicles` },
    ];
  },
  trend: (p) => ({
    title: 'Registrations by model year',
    subtitle: 'Adoption curve',
    data: p.yearData.map((d) => ({ x: String(d.year), y: d.count })),
  }),
  donut: (p) => ({
    title: 'Powertrain mix',
    subtitle: 'BEV vs PHEV',
    data: p.vehicleTypeData.map((d) => ({ name: shortType(d.name), value: d.value })),
  }),
  bars: (p) => ({
    title: 'Top manufacturers',
    subtitle: 'By registrations',
    data: p.manufacturerData.slice(0, 8).map((d) => ({ name: d.name, value: d.count })),
  }),
  table: (p) => ({
    title: 'Top models',
    subtitle: 'Most registered',
    columns: ['Model', 'Vehicles', 'Share'],
    rows: p.modelData.slice(0, 8).map((d) => [d.name, int(d.value), pct((d.value / (p.totalVehicles || 1)) * 100)]),
  }),
  liveEvent: (rows) => {
    const r = rows[Math.floor(Math.random() * rows.length)];
    if (!r) return null;
    return { title: `New ${r.Make} ${r.Model} registered`, sub: `${r.County || '—'} County · ${r['Model Year'] || ''}`.trim() };
  },
  pitch: (p) => {
    const total = p.totalVehicles;
    const bev = p.vehicleTypeData.find((d) => d.name.includes('Battery Electric'))?.value ?? 0;
    const share = total ? (bev / total) * 100 : 0;
    const yrs = p.yearData;
    const growth = yrs.length > 1 && yrs[0].count ? ((yrs[yrs.length - 1].count / yrs[0].count - 1) * 100) : 0;
    const top = p.manufacturerData[0];
    return [
      { kicker: 'The headline', headline: int(total), sub: 'electric vehicles tracked in this dataset', visual: 'kpis', insight: `Battery-electrics are ${share.toFixed(1)}% of the fleet — the transition is past the tipping point.` },
      { kicker: 'The curve', headline: `${growth >= 0 ? '+' : ''}${Math.round(growth)}%`, sub: `registrations, ${yrs[0]?.year} → ${yrs[yrs.length - 1]?.year}`, visual: 'trend', insight: 'Adoption is compounding year over year — infrastructure demand follows this curve.' },
      { kicker: 'The mix', headline: `${share.toFixed(0)}% BEV`, sub: 'powertrain split', visual: 'donut', insight: 'Pure electrics dominate new registrations; hybrids are the bridge, not the destination.' },
      { kicker: 'The leaders', headline: top?.name ?? '—', sub: `${int(top?.count ?? 0)} vehicles on the road`, visual: 'bars', insight: 'A handful of manufacturers own the market — partnerships here decide distribution.' },
      { kicker: 'The takeaway', headline: 'Electrify everything', sub: 'charging, fleet, insurance — the stack around these vehicles', visual: 'kpis', insight: 'Every one of these vehicles needs charging, servicing and software. That is the opportunity.' },
    ];
  },
};

// ---------------- SaaS (synthetic) ----------------
const saasProcess = (rows) => {
  const byMonth = {};
  rows.forEach((r) => {
    const b = (byMonth[r.month] = byMonth[r.month] || { mrr: 0, customers: 0, churned: 0, gained: 0, label: r.monthLabel });
    b.mrr += r.mrr; b.customers += r.customers; b.churned += r.churned; b.gained += r.gained;
  });
  const months = Object.keys(byMonth).map(Number).sort((a, b) => a - b).map((m) => byMonth[m]);
  const byPlan = {};
  rows.forEach((r) => { byPlan[r.plan] = (byPlan[r.plan] || 0) + r.mrr; });
  const byRegion = {};
  rows.forEach((r) => {
    const b = (byRegion[r.region] = byRegion[r.region] || { mrr: 0, customers: 0 });
    b.mrr += r.mrr; b.customers += r.customers;
  });
  return { months, byPlan, byRegion };
};

const saas = {
  id: 'saas',
  name: 'SaaS Revenue',
  tagline: 'Subscription growth & retention command center',
  kind: 'synthetic',
  load: async () => genSaas(),
  validate: null,
  process: saasProcess,
  applyFilters: (rows, f) =>
    rows.filter((r) => (!f.plan || r.plan === f.plan) && (!f.region || r.region === f.region)),
  dimensions: [
    { key: 'plan', label: 'Plan', get: (r) => r.plan },
    { key: 'region', label: 'Region', get: (r) => r.region },
  ],
  kpis: (p) => {
    const m = p.months;
    const last = m[m.length - 1], prev = m[m.length - 2];
    const mom = prev.mrr ? ((last.mrr - prev.mrr) / prev.mrr) * 100 : 0;
    const custDelta = prev.customers ? ((last.customers - prev.customers) / prev.customers) * 100 : 0;
    const churn = last.customers ? (last.churned / last.customers) * 100 : 0;
    return [
      { id: 'm', label: 'MRR', value: last.mrr, format: 'money', deltaPct: mom, deltaLabel: 'MoM', spark: m.slice(-12).map((x) => x.mrr) },
      { id: 'c', label: 'Customers', value: last.customers, format: 'int', deltaPct: custDelta, deltaLabel: 'MoM', spark: m.slice(-12).map((x) => x.customers) },
      { id: 'n', label: 'New logos', value: last.gained, format: 'int', sub: 'this month' },
      { id: 'h', label: 'Churn rate', value: churn, format: 'pct', sub: 'of base, monthly', invert: true },
    ];
  },
  trend: (p) => ({
    title: 'MRR trajectory',
    subtitle: 'Last 24 months',
    data: p.months.map((x) => ({ x: x.label, y: x.mrr })),
    money: true,
  }),
  donut: (p) => ({
    title: 'Revenue by plan',
    subtitle: 'MRR mix',
    data: Object.entries(p.byPlan).map(([name, value]) => ({ name, value })),
    money: true,
  }),
  bars: (p) => ({
    title: 'Customers by region',
    subtitle: 'Latest month footprint',
    data: Object.entries(p.byRegion).map(([name, v]) => ({ name, value: v.customers })).sort((a, b) => b.value - a.value),
  }),
  table: (p) => ({
    title: 'Regional performance',
    subtitle: 'MRR and customers',
    columns: ['Region', 'MRR', 'Customers'],
    rows: Object.entries(p.byRegion).map(([name, v]) => [name, money(v.mrr), int(v.customers)]),
  }),
  liveEvent: (rows) => {
    const r = rows[Math.floor(Math.random() * rows.length)];
    if (!r) return null;
    const kinds = [
      { title: `New ${r.plan} signup`, sub: `${r.region} · ${money(r.mrr / Math.max(r.customers, 1))} ACV` },
      { title: `Expansion revenue`, sub: `${r.plan} · ${r.region}` },
      { title: `Churn prevented`, sub: `${r.plan} account retained` },
    ];
    return kinds[Math.floor(Math.random() * kinds.length)];
  },
  pitch: (p) => {
    const m = p.months;
    const growth = m[0].mrr ? ((m[m.length - 1].mrr / m[0].mrr - 1) * 100) : 0;
    const plans = Object.entries(p.byPlan).sort((a, b) => b[1] - a[1]);
    return [
      { kicker: 'The headline', headline: money(m[m.length - 1].mrr), sub: 'monthly recurring revenue', visual: 'kpis', insight: `MRR compounded ${Math.round(growth)}% over 24 months — retention, not just acquisition, drives this.` },
      { kicker: 'The curve', headline: `+${Math.round(growth)}%`, sub: 'MRR growth, 24 months', visual: 'trend', insight: 'Net expansion outpaces churn every single quarter. The engine is efficient.' },
      { kicker: 'The mix', headline: plans[0][0], sub: `${money(plans[0][1])} — largest plan line`, visual: 'donut', insight: 'High-ARPU plans carry the mix; moving mid-market up is the lever.' },
      { kicker: 'The footprint', headline: Object.keys(p.byRegion).length + ' regions', sub: 'revenue across four geos', visual: 'bars', insight: 'Diversified by geography — no single-region concentration risk.' },
      { kicker: 'The takeaway', headline: 'Durable growth', sub: 'efficient, diversified, expanding', visual: 'kpis', insight: 'This is the profile acquirers pay premiums for: growth with retention.' },
    ];
  },
};

// ---------------- Fintech (synthetic) ----------------
const finProcess = (rows) => {
  const byDay = {};
  rows.forEach((r) => {
    const b = (byDay[r.day] = byDay[r.day] || { volume: 0, txns: 0, label: r.date, ok: 0, n: 0 });
    b.volume += r.volume; b.txns += r.txns; b.ok += r.successRate * r.txns; b.n += r.txns;
  });
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b).map((d) => ({ ...byDay[d], success: byDay[d].ok / byDay[d].n }));
  const byChannel = {};
  rows.forEach((r) => {
    const b = (byChannel[r.channel] = byChannel[r.channel] || { volume: 0, txns: 0 });
    b.volume += r.volume; b.txns += r.txns;
  });
  const byRegion = {};
  rows.forEach((r) => {
    const b = (byRegion[r.region] = byRegion[r.region] || { volume: 0, txns: 0 });
    b.volume += r.volume; b.txns += r.txns;
  });
  const totTx = rows.reduce((a, r) => a + r.txns, 0);
  const totVol = rows.reduce((a, r) => a + r.volume, 0);
  const succ = totTx ? rows.reduce((a, r) => a + r.successRate * r.txns, 0) / totTx : 0;
  return { days, byChannel, byRegion, totTx, totVol, succ };
};

const fintech = {
  id: 'fintech',
  name: 'Payments Pulse',
  tagline: 'Transaction volume & success-rate intelligence',
  kind: 'synthetic',
  load: async () => genFintech(),
  validate: null,
  process: finProcess,
  applyFilters: (rows, f) =>
    rows.filter((r) => (!f.channel || r.channel === f.channel) && (!f.region || r.region === f.region)),
  dimensions: [
    { key: 'channel', label: 'Channel', get: (r) => r.channel },
    { key: 'region', label: 'Region', get: (r) => r.region },
  ],
  kpis: (p) => {
    const d = p.days;
    const w1 = d.slice(-7), w2 = d.slice(-14, -7);
    const v1 = w1.reduce((a, x) => a + x.volume, 0), v2 = w2.reduce((a, x) => a + x.volume, 0);
    const wow = v2 ? ((v1 - v2) / v2) * 100 : 0;
    const t1 = w1.reduce((a, x) => a + x.txns, 0);
    return [
      { id: 'v', label: 'Volume (7d)', value: v1, format: 'inr', deltaPct: wow, deltaLabel: 'WoW', spark: d.slice(-14).map((x) => x.volume) },
      { id: 't', label: 'Transactions', value: t1, format: 'int', sub: 'last 7 days' },
      { id: 's', label: 'Success rate', value: p.succ * 100, format: 'pct', sub: 'authorization rate' },
      { id: 'a', label: 'Avg. ticket', value: p.totTx ? p.totVol / p.totTx : 0, format: 'inr0', sub: 'per transaction' },
    ];
  },
  trend: (p) => ({
    title: 'Payment volume',
    subtitle: 'Last 90 days',
    data: p.days.map((x) => ({ x: x.label, y: x.volume })),
    money: '₹',
  }),
  donut: (p) => ({
    title: 'Volume by channel',
    subtitle: 'Payment mix',
    data: Object.entries(p.byChannel).map(([name, v]) => ({ name, value: v.volume })),
    money: '₹',
  }),
  bars: (p) => ({
    title: 'Transactions by region',
    subtitle: '90-day count',
    data: Object.entries(p.byRegion).map(([name, v]) => ({ name, value: v.txns })).sort((a, b) => b.value - a.value),
  }),
  table: (p) => ({
    title: 'Channel performance',
    subtitle: 'Volume leaders',
    columns: ['Channel', 'Volume', 'Transactions'],
    rows: Object.entries(p.byChannel).map(([name, v]) => [name, '₹' + compact(v.volume), int(v.txns)]),
  }),
  liveEvent: (rows) => {
    const r = rows[Math.floor(Math.random() * rows.length)];
    if (!r) return null;
    return { title: `${int(r.txns)} txns via ${r.channel}`, sub: `${r.region} · ₹${compact(r.volume)} volume` };
  },
  pitch: (p) => {
    const d = p.days;
    const growth = d[0].volume ? ((d[d.length - 1].volume / d[0].volume - 1) * 100) : 0;
    const ch = Object.entries(p.byChannel).sort((a, b) => b[1].volume - a[1].volume)[0];
    return [
      { kicker: 'The headline', headline: '₹' + compact(p.totVol), sub: 'processed in 90 days', visual: 'kpis', insight: `Authorization rate holds at ${(p.succ * 100).toFixed(1)}% while volume scales — reliability is the moat.` },
      { kicker: 'The curve', headline: `+${Math.round(growth)}%`, sub: 'daily volume, 90 days', visual: 'trend', insight: 'Weekend peaks are predictable — capacity planning writes itself.' },
      { kicker: 'The mix', headline: ch[0], sub: 'dominant rail by volume', visual: 'donut', insight: 'One rail carries the network; routing intelligence protects the margin.' },
      { kicker: 'The footprint', headline: Object.keys(p.byRegion).length + ' regions', sub: 'pan-India coverage', visual: 'bars', insight: 'Balanced regional spread de-risks concentration.' },
      { kicker: 'The takeaway', headline: 'Scale + reliability', sub: 'the payments flywheel', visual: 'kpis', insight: 'Volume compounds, success stays high — exactly what enterprise clients diligence.' },
    ];
  },
};

export const DATASETS = [ev, saas, fintech];
export const getDataset = (id) => DATASETS.find((d) => d.id === id) || DATASETS[0];

export const formatKpi = (kpi) => {
  const v = kpi.value;
  switch (kpi.format) {
    case 'money': return money(v);
    case 'inr': return '₹' + compact(v);
    case 'inr0': return '₹' + int(v);
    case 'pct': return pct(v);
    case 'text': return String(v);
    default: return int(v) + (kpi.suffix || '');
  }
};
