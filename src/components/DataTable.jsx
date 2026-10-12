import ChartCard from './ChartCard';

export default function DataTable({ spec }) {
  if (!spec) return null;
  return (
    <ChartCard title={spec.title} subtitle={spec.subtitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {spec.columns.map((c) => (
                <th key={c} className="pb-3 pr-4 font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition">
                {row.map((cell, j) => (
                  <td key={j} className={`py-2.5 pr-4 ${j === 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 tabular-nums'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
