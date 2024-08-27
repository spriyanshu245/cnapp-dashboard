import { useContext, useState } from 'react';
import { DataContext } from '../DataContext';
import { RxCross2 } from 'react-icons/rx';

const Sidebar = ({ onClose }) => {
  const { widgetData, setWidgetData } = useContext(DataContext);
  const categories = widgetData.map((category) => category.category);
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [widgetsToRemove, setWidgetsToRemove] = useState([]);

  const handleTabChange = (category) => {
    setActiveTab(category);
  };

  const handleWidgetRemove = (widgetId) => {
    setWidgetsToRemove((prevWidgets) => prevWidgets.includes(widgetId) ? prevWidgets.filter((id) => id !== widgetId) : [...prevWidgets, widgetId]);
  };

  const handleWidgetRemoveCancel = (widgetId) => {
    setWidgetsToRemove((prevWidgets) => prevWidgets.filter((id) => id !== widgetId));
  };

  const handleConfirmRemove = () => {
    const updatedData = widgetData.map((category) => {
      if (category.category === activeTab) {
        const updatedWidgets = category.widgets.filter((widget) => !widgetsToRemove.includes(widget.id));
        return { ...category, widgets: updatedWidgets };
      }
      return category;
    });
    setWidgetData(updatedData);
    setWidgetsToRemove([]);
  };

  const handleCancelRemove = () => {
    setWidgetsToRemove([]);
  };

  return (
    <div
      className="fixed top-0 right-0 max-w-5xl h-screen bg-white dark:bg-[#141517] border-l dark:border-[#343A40]"
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center bg-blue-900 mb-4">
        <h2 className="text-lg text-white font-medium mx-4 my-4 dark:text-gray-300">Add Widget</h2>
        <button
          className="text-lg text-gray-300 font-medium mr-4 dark:text-gray-300 hover:text-white dark:hover:text-white transition duration-300 ease-in-out dark:transition dark:duration-300 dark:ease-in-out"
          onClick={onClose}
        >
          <RxCross2 />
        </button>
      </div>
      <span className="mx-2 dark:text-white">Personalise your dashboard by adding the following widgets</span>
      <div className="flex flex-row flex-wrap mb-2 p-4">
        {categories.map((category) => (
          <button
            key={category}
            className={`pb-2 mx-2 ${activeTab === category ? 'text-blue-800 dark:text-white border-b-blue-800' : 'border-none'} hover:text-blue-800 border hover:border-b-blue-800 dark:text-gray-300 dark:hover:text-white transition duration-300 ease-in-out`}
            onClick={() => handleTabChange(category)}
          >
            <span className="truncate dark:truncate">{category}</span>
          </button>
        ))}
      </div>
      <div className="overflow-y-auto h-full dark:overflow-y-auto dark:h-full px-4">
        {widgetData.find((category) => category.category === activeTab).widgets.map((widget) => (
          <div key={widget.id} className="flex items-center p-2 mb-2 border border-spacing-8 rounded hover:bg-gray-300 border-solid dark:text-white dark:hover:bg-blue-800">
            <input
              type="checkbox"
              checked={!widgetsToRemove.includes(widget.id)}
              onChange={() => {
                if (widgetsToRemove.includes(widget.id)) {
                  handleWidgetRemoveCancel(widget.id)
                } else {
                  handleWidgetRemove(widget.id)
                }
              }}
              className="mr-2"
            />
            <span className="text-lg dark:text-white">{widget.name}</span>
          </div>
        ))}

        {widgetsToRemove.length > 0 && (
          <div className="flex justify-end mt-4">
            <button className="mx-2 bg-transparent hover:bg-blue-800 text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded-md"
              onClick={handleCancelRemove}>
              Cancel
            </button>
            <button className="bg-transparent hover:bg-blue-800 text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded-md"
              onClick={handleConfirmRemove}>
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;