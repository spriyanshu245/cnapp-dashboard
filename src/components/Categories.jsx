import React, { useState } from "react";
import { Widget } from './Widget';
import Sidebar from './SideBar';

const Categories = (props) => {
  const widgetData = props.data
  const [showSidebar, setShowSidebar] = useState(false);

  const handleAddWidgetClick = () => {
    setShowSidebar(true);
  };

  return (
    <div className="bg-[#ECEFF3] dark:bg-[#1F1F1F] dark:text-white">
      <div className="text-lg text-black dark:text-white pt-4 mx-8">
        {widgetData.category}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {widgetData.widgets?.map((w) => (
          <div key={w.id} className="mb-4">
            <Widget data={w} />
          </div>
        ))}
        <div id={widgetData.id} className="min-h-52 min-w-80 mb-6 dark:bg-[#141517] bg-white border dark:border-[#343A40] mx-8 rounded-md my-3">
          <div className="flex justify-center items-center h-full">
            <button 
              onClick={handleAddWidgetClick}
              className="text-lg border text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-500 transition duration-300 ease-in-out">
              + Add Widget
            </button>
          </div>
        </div>
      </div>
      {showSidebar && (
        <Sidebar onClose={() => setShowSidebar(false)} />
      )}
    </div>
  );
};

export default Categories;