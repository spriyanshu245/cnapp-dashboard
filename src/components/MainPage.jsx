import { useState } from "react";
import { SlArrowDown,SlOptionsVertical, SlRefresh } from "react-icons/sl";
import { BsClockFill, BsPlusLg } from "react-icons/bs";
import Sidebar from './SideBar';
import EVDataVisualization from './EVDataVisualization';

function MainPage() {
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [data, setData] = useState(null);


  const handleAddWidgetClick = () => {
    setShowSidebar(true);
  };
   
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
          <div className="dark:text-white text-black text-base">Electric Vehicle Data Insights</div>
        </div>
        <div className="flex justify-between w-1/6">
          <button
            onClick={handleAddWidgetClick}
            className="flex items-center rounded-md py-2 px-3 text-sm dark:bg-[#1F1F1F] bg-white border dark:border-[#343A40] text-black dark:text-white">
            Add DataSet{" "}
            <BsPlusLg className="ml-2" />
          </button>
          <div className="flex items-center dark:bg-[#1F1F1F]  text-black dark:text-white border bg-white dark:border-[#343A40] rounded-md py-2 px-3 text-sm">
             <SlRefresh/>
          </div>
        </div>
      </div>
      {showSidebar && (
        <Sidebar onClose={() => setShowSidebar(false)} setData={setData}/>
      )}
      {data && <EVDataVisualization data={data} />}
    </>
  );
}

export default MainPage;