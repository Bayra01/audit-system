import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";

// Dashboard layout
import Dashboard from "./pages/Dashboard";

// Dashboard inner pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import EmailPage from "./pages/dashboard/EmailPage";
import ViolationsPage from "./pages/dashboard/ViolationsPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* PROTECTED DASHBOARD ROUTES */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* default dashboard */}
        <Route index element={<DashboardPage />} />

        {/* sub pages */}
        <Route path="email" element={<EmailPage />} />
        <Route path="violations" element={<ViolationsPage />} />
        <Route path="users" element={<div />} /> {/* Dashboard дотроо зохицуулна */}
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />

        {/* Toast styles */}
        <style>{`
          .Toastify__toast {
            min-height: 48px !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }
          .Toastify__toast-body {
            padding: 0 !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
          }
          .Toastify__close-button {
            align-self: center !important;
          }

          .Toastify__toast--success {
            background: #ffffff !important;
            color: #1a7a45 !important;
            border: 1px solid #b7e4c7 !important;
            border-left: 4px solid #2ecc71 !important;
          }

          .Toastify__toast--info {
            background: #ffffff !important;
            color: #1a5276 !important;
            border-left: 4px solid #3498db !important;
          }

          .Toastify__toast--warning {
            background: #ffffff !important;
            color: #7d6608 !important;
            border-left: 4px solid #f1c40f !important;
          }

          .Toastify__toast--error {
            background: #ffffff !important;
            color: #78281f !important;
            border-left: 4px solid #e74c3c !important;
          }
        `}</style>

        <ToastContainer
          limit={3}
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
          style={{ width: "280px" }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}