import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardProvider } from '../state/DashboardContext';
import Sidebar from '../components/shell/Sidebar';
import TopBar from '../components/TopBar';
import ConfigDrawer from '../components/ConfigDrawer';
import PitchMode from '../components/PitchMode';
import Overview from '../views/Overview';
import Analytics from '../views/Analytics';
import LiveView from '../views/LiveView';

export default function Dashboard() {
  const [configOpen, setConfigOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#ECEFF3] dark:bg-black">
        <Sidebar onOpenConfig={() => setConfigOpen(true)} />
        <div className="lg:pl-60">
          <TopBar onOpenConfig={() => setConfigOpen(true)} onPitch={() => setPitchOpen(true)} />
          <main>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/live" element={<LiveView />} />
            </Routes>
          </main>
        </div>
        <ConfigDrawer open={configOpen} onClose={() => setConfigOpen(false)} />
        {pitchOpen && <PitchMode onClose={() => setPitchOpen(false)} />}
      </div>
    </DashboardProvider>
  );
}
