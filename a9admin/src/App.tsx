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
import UserTools from "./pages/UserTools";
import VacanciesScreen from "./pages/VacanciesScreen";
import Layout from "./components/Layout";

// Higher Order Component to wrap pages with Layout
const WithLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <WithLayout>
              <Home />
            </WithLayout>
          }
        />
        <Route
          path="/tools"
          element={
            <WithLayout>
              <ToolsDashboard />
            </WithLayout>
          }
        />
        <Route
          path="/tools-promotions"
          element={
            <WithLayout>
              <ToolsPromotions />
            </WithLayout>
          }
        />
        <Route
          path="/users"
          element={
            <WithLayout>
              <UsersDashboard />
            </WithLayout>
          }
        />
        <Route
          path="/Businesses"
          element={
            <WithLayout>
              <Businesses />
            </WithLayout>
          }
        />
        <Route
          path="/Explorers"
          element={
            <WithLayout>
              <Explorers />
            </WithLayout>
          }
        />
        <Route
          path="/user-balance/:user_id"
          element={
            <WithLayout>
              <UserBalance />
            </WithLayout>
          }
        />
        <Route
          path="/AdnaDashboard"
          element={
            <WithLayout>
              <AdnaDashboard />
            </WithLayout>
          }
        />
        <Route
          path="/user-tools/:userId"
          element={
            <WithLayout>
              <UserTools />
            </WithLayout>
          }
        />
        <Route
          path="/user-vacancies/:userId"
          element={
            <WithLayout>
              <VacanciesScreen />
            </WithLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
