import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard"


function App() {
  return (
    <div>
      <HashRouter>
        <Routes>
        <Route path="/" element={<Dashboard/>}/>
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
