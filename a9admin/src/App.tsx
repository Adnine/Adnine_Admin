import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ToolsDashboard from "./pages/ToolsDashboard";
import ToolsPromotions from "./pages/ToolsPromotion";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tools" element={<ToolsDashboard />} />
        <Route path="/tools-promotions" element={<ToolsPromotions />} />
      </Routes>
    </Router>
  );
};

export default App;
