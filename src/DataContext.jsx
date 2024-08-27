import { createContext, useState, useEffect } from 'react';
import data from "./Data.json"

const DataContext = createContext();

const DataProvider = ({ children }) => {
  localStorage.setItem('widgetData', JSON.stringify(data));
  const [widgetData, setWidgetData] = useState(JSON.parse(localStorage.getItem('widgetData')) || []);

  useEffect(() => {
    localStorage.setItem('widgetData', JSON.stringify(widgetData))
  }, [widgetData]);

  useEffect(() => {
    setWidgetData(JSON.parse(localStorage.getItem('widgetData')) || []);
  }, []);

  return (
    <DataContext.Provider value={{ widgetData, setWidgetData }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataProvider };