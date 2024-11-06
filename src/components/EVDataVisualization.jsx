import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EVDataVisualization = ({ data }) => {
    const { vehicleTypeData, manufacturerData, countyData, rangeData, yearData, cafvData, modelData, rangeStats, cityData, rangeDistribution, utilityData } = data;

    const combinedData = manufacturerData.map(manufacturer => {
        const models = modelData.filter(model => model.manufacturer === manufacturer.name);
        const averageRange = rangeData.reduce((sum, range) => sum + range, 0) / rangeData.length || 0;
      
        return {
          manufacturer: manufacturer.name,
          count: manufacturer.count,
          averageRange: averageRange
        };
      });

    return (
      <div>
        <h2>Vehicle Type Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={vehicleTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {vehicleTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
  
        <h2>Top Manufacturers</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={manufacturerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
  
        <h2>County Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={countyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
  
        <h2>Electric Range Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rangeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
  
        <h2>Model Year Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={yearData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
        </ResponsiveContainer>
  
        <h2>CAFV Eligibility Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={cafvData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {cafvData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
  
        <h2>Top Models</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={modelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
  
        <h2>Electric Range Stats</h2>
        <p>Average Range: {rangeStats.average.toFixed(2)} miles</p>
        <p>Minimum Range: {rangeStats.min} miles</p>
        <p>Maximum Range: {rangeStats.max} miles</p>
        <p>Median Range: {rangeStats.median} miles</p>

        <h2>Manufacturer vs Average Electric Range</h2>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="manufacturer" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageRange" fill="#82ca9d" />
        </BarChart>
        </ResponsiveContainer>
  
        <h2>City Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={cityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
        </ResponsiveContainer>
    </div>
    );
}

  
export default EVDataVisualization;