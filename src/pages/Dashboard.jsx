import MainPage from "../components/MainPage";
import TopBar from "../components/TopBar";

function Dashboard() {
  return (
    <div className="min-h-screen w-full dark:bg-black bg-[#ECEFF3]">
      <TopBar />
      <MainPage />
    </div>
  );
}

export default Dashboard;
