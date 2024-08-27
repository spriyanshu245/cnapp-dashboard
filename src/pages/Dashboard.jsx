import { useState } from 'react';
import MainPage from "../components/MainPage";
import TopBar from "../components/TopBar";

function Dashboard(props) {
  const [data, setData] = useState([]);

  const handleFilter = (newData) => {
    setData(newData);
  };
    return (
      <div className="h-screen w-screen dark:bg-black bg-[#ECEFF3]">
        <TopBar onFilter = {handleFilter}/>
        <MainPage filterdWidget = {data}/>
      </div>
    );
  }

export default Dashboard;
