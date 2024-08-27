import { useEffect, useState, useContext } from "react";
import { DataContext } from '../DataContext';
import { SlArrowDown,SlOptionsVertical, SlRefresh } from "react-icons/sl";
import { BsClockFill, BsPlusLg } from "react-icons/bs";
import Categories from './Categories';
import Sidebar from './SideBar';


function MainPage({filteredWidget}) {
  const contextData = useContext(DataContext);
  const [widgetData, setWidgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleAddWidgetClick = () => {
    setShowSidebar(true);
  };

  useEffect(() => {
      try {
        setLoading(true);
        setWidgetData(contextData.widgetData)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
  }, [contextData]);

  useEffect(() => {
    setWidgetData(filteredWidget);
  }, [filteredWidget]);
   
  if (loading) {
    return (
      <div className="bg-[#ECEFF3] dark:bg-black dark:text-white text-[#5B5F66] flex h-screen w-full justify-center items-center">
        Loading ...
      </div>
    );
  }

  return (
    <>
      <div className="flex sticky top-16 z-10 px-8 py-4 w-full justify-between  dark:bg-[#1F1F1F] bg-gray-50 dark:border-[#33383F] border-[#E0E0E0]">
        <div className="w-2/3">
          <div className="dark:text-white text-black text-base">CNAPP DASHBOARD</div>
        </div>
        <div className="flex justify-between w-1/3">
          <button
            onClick={handleAddWidgetClick}
            className="flex items-center rounded-md py-2 px-3 text-sm dark:bg-[#1F1F1F] bg-white border dark:border-[#343A40] text-black dark:text-white">
            Add Widget{" "}
            <BsPlusLg className="ml-2" />
          </button>
          <div className="flex items-center dark:bg-[#1F1F1F]  text-black dark:text-white border bg-white dark:border-[#343A40] rounded-md py-2 px-3 text-sm">
             <SlRefresh/>
          </div>
          <div className="flex items-center dark:bg-[#1F1F1F] border bg-white text-black dark:text-white dark:border-[#343A40] rounded-md py-2 px-3 text-sm">
          <SlOptionsVertical/>
          </div>
          <div className="flex items-center dark:bg-[#1F1F1F] bg-white border dark:border-[#343A40] text-black dark:text-white rounded-md py-2 px-3 text-sm">
           <BsClockFill className="mr-2" />| last 2 days
            <SlArrowDown className="ml-2" />
          </div>
        </div>
      </div>
      
      <div className="bg-[#ECEFF3] dark:bg-[#1F1F1F] dark:text-blue-50">
        {widgetData?.map((category) => (
          <div key={category.id} className="mb-4">
            <Categories data={category} />
          </div>
        ))}
      </div>

      {showSidebar && (
        <Sidebar onClose={() => setShowSidebar(false)} />
      )}
    </>
  );
}

export default MainPage;