
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
              if (range <= 50) ranges['0-50']++;
              else if (range <= 100) ranges['51-100']++;
              else if (range <= 150) ranges['101-150']++;
              else if (range <= 200) ranges['151-200']++;
              else if (range <= 250) ranges['201-250']++;
              else if (range > 250) ranges['251+']++;
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
          .sort((a, b) => a.year - b.year),

      // CAFV Eligibility Distribution
      cafvData: Object.entries(
          csvData.reduce((acc, row) => {
              const status = row['Clean Alternative Fuel Vehicle (CAFV) Eligibility'];
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
              .filter(range => !isNaN(range));

          return {
              average: ranges.reduce((a, b) => a + b, 0) / ranges.length,
              min: Math.min(...ranges),
              max: Math.max(...ranges),
              median: ranges.sort((a, b) => a - b)[Math.floor(ranges.length / 2)]
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
              const utilities = row['Electric Utility'].split('||');
              utilities.forEach(utility => {
                acc[utility.trim()] = (acc[utility.trim()] || 0) + 1;
              });
              return acc;
            }, {})
          )
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        };
      
        return processedData;
      };
      


    const getModelRangeDistribution = (modelData) => {
      const ranges = {
        '0-50': [],
        '51-100': [],
        '101-150': [],
        '151-200': [],
        '201-250': [],
        '251+': []
      };
    
      // Group models by their electric range
      modelData.forEach(model => {
        const range = model.range;
        if (range <= 50) {
          ranges['0-50'].push(model);
        } else if (range <= 100) {
          ranges['51-100'].push(model);
        } else if (range <= 150) {
          ranges['101-150'].push(model);
        } else if (range <= 200) {
          ranges['151-200'].push(model);
        } else if (range <= 250) {
          ranges['201-250'].push(model);
        } else {
          ranges['251+'].push(model);
        }
      });
    
      const result = Object.entries(ranges).map(([range, models]) => ({
        range,
        count: models.length,
        models: models.map(model => model.model)
      }));
    
      return result;
    };

    const modelData = [
      { manufacturer: 'Tesla', model: 'Model S', range: 370 },
      { manufacturer: 'Tesla', model: 'Model 3', range: 353 },
      { manufacturer: 'Nissan', model: 'Leaf', range: 226 },
      { manufacturer: 'Chevrolet', model: 'Bolt', range: 259 },
      { manufacturer: 'Ford', model: 'Mustang Mach-E', range: 300 },
      { manufacturer: 'Audi', model: 'e-tron', range: 222 },
      { manufacturer: 'Nissan', model: 'Leaf Plus', range: 226 },
      { manufacturer: 'BMW', model: 'i3', range: 153 },
      { manufacturer: 'Hyundai', model: 'Kona Electric', range: 258 }
    ];
    
    const rangeDistribution = getModelRangeDistribution(modelData);
      
      export { processEVData, rangeDistribution };