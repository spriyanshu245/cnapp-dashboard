import { useState, useEffect, useContext } from 'react';
import { MdOutlineKeyboardArrowDown, MdOutlinePersonOutline } from "react-icons/md";
import { DataContext } from '../DataContext';
import ThemeToggle from "./ThemeToggle";


function TopBar({onFilter}) {
  const { widgetData } = useContext(DataContext);
  const [searchInput, setSearchInput] = useState('');

const handleSearch = (event) => {
  setSearchInput(event.target.value.toLowerCase());
};

const filteredWidgets = widgetData.map((category) => {
  const filteredCategoryWidgets = category.widgets.filter((widget) =>
    widget.name.toLowerCase().includes(searchInput)
  );
  return { ...category, widgets: filteredCategoryWidgets };
});

useEffect(() => {
  let timerId = setTimeout(() => {
    onFilter(filteredWidgets)
  }, 1000);
  return () => {
    clearTimeout(timerId)
  }
}, [searchInput])

  return (
    <div className="h-16 w-screen top-0 z-10 flex sticky px-8 justify-between items-center border-b-2 bg-white  dark:bg-[#1F1F1F] text-[#5B5F66] dark:text-white dark:border-[#343A40] border-[#E0E0E0]">
      <div className="dark:text-white text-black text-base">Home {">"} Dashboard V2</div>
      <div className="flex items-center justify-between space-x-4">
        <form className="mr-6">
          <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white bg-gray-200">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              value={searchInput}
              onChange={handleSearch}
              type="search"
              id="default-search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search anything.." required />
          </div>
        </form>
        User<MdOutlineKeyboardArrowDown className="text-xl" />
        <ThemeToggle />
        <MdOutlinePersonOutline/>User
      </div>
    </div>
  );
}

export default TopBar;
