const REQUIRED_COLUMNS = [
  'Electric Vehicle Type',
  'Make',
  'Model',
  'County',
  'City',
  'Model Year',
  'Electric Range',
  'Clean Alternative Fuel Vehicle (CAFV) Eligibility',
  'Electric Utility',
];

/**
 * Friendly schema check for uploaded CSVs. Returns { ok, missing, message }.
 */
const validateSchema = (rows) => {
  if (!rows || rows.length === 0) {
    return { ok: false, missing: REQUIRED_COLUMNS, message: 'The CSV appears to be empty — no data rows found.' };
  }
  const cols = Object.keys(rows[0] || {});
  const missing = REQUIRED_COLUMNS.filter((c) => !cols.includes(c));
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: `This doesn't look like an EV dataset. Missing columns: ${missing.join(', ')}.`,
    };
  }
  return { ok: true, missing: [], message: '' };
};

const processEVData = (csvData) => {
  const processedData = {
      totalVehicles: csvData.length,

      vehicleTypeData: [
          {
              name: 'Battery Electric Vehicle (BEV)',
              value: csvData.filter(row => row['Electric Vehicle Type'] === 'Battery Electric Vehicle (BEV)').length
          },
          {
              name: 'Plug-in Hybrid Electric Vehicle (PHEV)',
              value: csvData.filter(row => row['Electric Vehicle Type'] === 'Plug-in Hybrid Electric Vehicle (PHEV)').length
          }
      ],

      // Manufacturer Distribution
      manufacturerData: Object.entries(
          csvData.reduce((acc, row) => {
              acc[row.Make] = (acc[row.Make] || 0) + 1;
              return acc;
          }, {})
      )
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),

      // Geographic Distribution (Counties)
      countyData: Object.entries(
          csvData.reduce((acc, row) => {
              acc[row.County] = (acc[row.County] || 0) + 1;
              return acc;
          }, {})
      )
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),

      // Electric Range Distribution
      rangeData: (() => {
          const ranges = {
              '0-50': 0,
              '51-100': 0,
              '101-150': 0,
              '151-200': 0,
              '201-250': 0,
              '251+': 0
          };

          csvData.forEach(row => {
              const range = parseInt(row['Electric Range']);
              if (isNaN(range)) return;
              if (range <= 50) ranges['0-50']++;
              else if (range <= 100) ranges['51-100']++;
              else if (range <= 150) ranges['101-150']++;
              else if (range <= 200) ranges['151-200']++;
              else if (range <= 250) ranges['201-250']++;
              else ranges['251+']++;
          });

          return Object.entries(ranges).map(([range, count]) => ({
              range,
              count
          }));
      })(),

      // Model Year Distribution
      yearData: Object.entries(
          csvData.reduce((acc, row) => {
              acc[row['Model Year']] = (acc[row['Model Year']] || 0) + 1;
              return acc;
          }, {})
      )
          .map(([year, count]) => ({ year: parseInt(year), count }))
          .filter(d => !isNaN(d.year))
          .sort((a, b) => a.year - b.year),

      // CAFV Eligibility Distribution
      cafvData: Object.entries(
          csvData.reduce((acc, row) => {
              const status = row['Clean Alternative Fuel Vehicle (CAFV) Eligibility'] || 'Unknown';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
          }, {})
      )
          .map(([name, value]) => ({ name, value })),

      // Popular Models by Manufacturer
      modelData: Object.entries(
          csvData.reduce((acc, row) => {
              const key = `${row.Make} ${row.Model}`;
              acc[key] = (acc[key] || 0) + 1;
              return acc;
          }, {})
      )
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15),

      // Electric Range Stats
      rangeStats: (() => {
          const ranges = csvData
              .map(row => parseInt(row['Electric Range']))
              .filter(range => !isNaN(range) && range > 0);
          if (ranges.length === 0) {
              return { average: 0, min: 0, max: 0, median: 0 };
          }
          const sorted = [...ranges].sort((a, b) => a - b);
          return {
              average: ranges.reduce((a, b) => a + b, 0) / ranges.length,
              min: sorted[0],
              max: sorted[sorted.length - 1],
              median: sorted[Math.floor(sorted.length / 2)]
          };
      })(),

      // City Distribution
      cityData: Object.entries(
        csvData.reduce((acc, row) => {
          acc[row.City] = (acc[row.City] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),

      // Utility Provider Distribution
      utilityData: Object.entries(
        csvData.reduce((acc, row) => {
          const raw = row['Electric Utility'];
          if (!raw) return acc;
          const utilities = String(raw).split('||');
          utilities.forEach(utility => {
            const u = utility.trim();
            if (u) acc[u] = (acc[u] || 0) + 1;
          });
          return acc;
        }, {})
      )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };

    return processedData;
};

export { processEVData, validateSchema, REQUIRED_COLUMNS };
