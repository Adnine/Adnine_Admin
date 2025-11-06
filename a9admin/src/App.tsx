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
import UsersDashboard from "./pages/UsersDashboard";
import Businesses from "./pages/Businesses";
import Explorers from "./pages/Explorers";
import UserBalance from "./pages/UserBalance";
import AdnaDashboard from "./pages/AdnaDashboard";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tools" element={<ToolsDashboard />} />
        <Route path="/tools-promotions" element={<ToolsPromotions />} />
        <Route path="/users" element={<UsersDashboard />} />
        <Route path="/Businesses" element={<Businesses />} />
        <Route path="/Explorers" element={<Explorers />} />
        <Route path="/user-balance/:user_id" element={<UserBalance />} />
        <Route path="/AdnaDashboard" element={<AdnaDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
