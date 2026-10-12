import { HashRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <HashRouter>
      <Dashboard />
    </HashRouter>
  );
}
