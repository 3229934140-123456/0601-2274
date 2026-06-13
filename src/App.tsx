import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RegionProvider } from "./context/RegionContext";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import CommunityDetail from "./pages/Community";
import Warnings from "./pages/Warnings";
import WarningDetail from "./pages/Warnings/Detail";
import Plan from "./pages/Plan";
import Reports from "./pages/Reports";
import Data from "./pages/Data";

export default function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/community/:id"
              element={
                <MainLayout>
                  <CommunityDetail />
                </MainLayout>
              }
            />
            <Route
              path="/warnings"
              element={
                <MainLayout>
                  <Warnings />
                </MainLayout>
              }
            />
            <Route
              path="/warnings/:id"
              element={
                <MainLayout>
                  <WarningDetail />
                </MainLayout>
              }
            />
            <Route
              path="/plan"
              element={
                <MainLayout>
                  <Plan />
                </MainLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <MainLayout>
                  <Reports />
                </MainLayout>
              }
            />
            <Route
              path="/data"
              element={
                <MainLayout>
                  <Data />
                </MainLayout>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </RegionProvider>
    </AuthProvider>
  );
}
