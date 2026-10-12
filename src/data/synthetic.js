// Deterministic demo datasets (SaaS + fintech) with a seeded RNG so every
// visitor sees the same credible numbers.

export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTH_LABELS = (() => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out = [];
  let y = 2024, m = 0;
  for (let i = 0; i < 24; i++) {
    out.push(`${names[m]} ${String(y).slice(2)}`);
    m += 1;
    if (m === 12) { m = 0; y += 1; }
  }
  return out;
})();

// ---------------- SaaS ----------------
export function genSaas() {
  const rnd = mulberry32(42);
  const plans = [
    { name: 'Starter', base: 920, arpu: 29 },
    { name: 'Growth', base: 430, arpu: 99 },
    { name: 'Scale', base: 150, arpu: 349 },
    { name: 'Enterprise', base: 36, arpu: 1299 },
  ];
  const regions = ['North America', 'Europe', 'APAC', 'LATAM'];
  const regionW = [1.45, 1.1, 0.72, 0.45];
  const rows = [];
  plans.forEach((p, pi) => {
    regions.forEach((r, ri) => {
      let customers = Math.round(p.base * regionW[ri] * (0.8 + rnd() * 0.4));
      for (let m = 0; m < 24; m++) {
        const growth = 1 + (0.018 + rnd() * 0.03) * (pi >= 2 ? 1.35 : 1);
        const churned = Math.round(customers * (0.012 + rnd() * 0.018));
        const gained = Math.round(customers * (0.03 + rnd() * 0.05)) + 4;
        customers = Math.max(10, Math.round(customers * growth) - churned + gained);
        rows.push({
          month: m,
          monthLabel: MONTH_LABELS[m],
          plan: p.name,
          region: r,
          customers,
          mrr: Math.round(customers * p.arpu * (0.97 + rnd() * 0.06)),
          churned,
          gained,
        });
      }
    });
  });
  return rows;
}

// ---------------- Fintech ----------------
const DAY_LABELS = (() => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out = [];
  const end = new Date(2026, 9, 11); // fixed anchor -> deterministic
  for (let d = 89; d >= 0; d--) {
    const dt = new Date(end);
    dt.setDate(dt.getDate() - d);
    out.push(`${names[dt.getMonth()]} ${dt.getDate()}`);
  }
  return out;
})();

export function genFintech() {
  const rnd = mulberry32(7);
  const channels = [
    ['UPI', 5200, 850],
    ['Cards', 3100, 1450],
    ['NetBanking', 1400, 3200],
    ['Wallet', 900, 420],
  ];
  const regions = ['North', 'South', 'East', 'West'];
  const regionW = [1.2, 1.05, 0.8, 0.62];
  const dow = [0.78, 0.82, 0.88, 0.94, 1.08, 1.32, 1.22];
  const rows = [];
  for (let d = 0; d < 90; d++) {
    for (let ci = 0; ci < channels.length; ci++) {
      const chName = channels[ci][0];
      const chBase = channels[ci][1];
      const chTicket = channels[ci][2];
      for (let ri = 0; ri < regions.length; ri++) {
        const weekend = dow[d % 7];
        const txns = Math.round(chBase * regionW[ri] * weekend * (0.85 + rnd() * 0.3) * (1 + d * 0.004));
        const avgTicket = Math.round(chTicket * (0.9 + rnd() * 0.2));
        const ok = chName === 'NetBanking' ? 0.927 + rnd() * 0.045 : 0.945 + rnd() * 0.045;
        rows.push({
          day: d,
          date: DAY_LABELS[d],
          channel: chName,
          region: regions[ri],
          txns: txns,
          volume: txns * avgTicket,
          successRate: Math.round(ok * 1000) / 1000,
          avgTicket: avgTicket,
        });
      }
    }
  }
  return rows;
}
