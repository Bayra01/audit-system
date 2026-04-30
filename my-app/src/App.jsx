import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// 1. ToastContainer болон CSS-ийг заавал импортлох
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  // Систем хэрэглэгчийн мэдээллийг шалгаж байх үед харуулах
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Уншиж байна...
      </div>
    );
  }

  return (
    <Routes>
      {/* Нэвтрэх хуудас: Хэрэв нэвтэрсэн бол шууд Dashboard руу */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Бүртгүүлэх хуудас */}
      <Route 
        path="/register" 
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Хяналтын самбар: Хамгаалалттай зам[cite: 1] */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <Dashboard />
          ) : (
            // Нэвтрээгүй бол 'state' дамжуулан Login руу шилжүүлнэ[cite: 1]
            <Navigate to="/login" state={{ fromDashboard: true }} replace />
          )
        } 
      />

      {/* Бусад бүх буруу хаяг дээр ажиллах logic[cite: 1] */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Үндсэн маршрутууд[cite: 1] */}
        <AppRoutes />
        
        {/* Мэдэгдэл харуулах контейнер - Зөвхөн нэг л байх ёстой[cite: 1] */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true} // Шинэ мэдэгдэл дээрээ харагдана
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          stacked // Олон мэдэгдэл гарвал давхарлаж харуулна
        />
      </BrowserRouter>
    </AuthProvider>
  );
}