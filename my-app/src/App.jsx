import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css'; 
import './style.css'; 

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from './pages/Dashboard';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Ачаалж буй төлөв нэмэв
  const navigate = useNavigate();

  // Хуудас анх ачаалахад localStorage шалгах
  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");
    
    if (savedUser) {
      setUser({ username: savedUser, role: savedRole });
    }
    setLoading(false); // Шалгаж дууссаны дараа loading-ийг зогсооно
  }, []);

  const handleAuthSuccess = (userData) => {
    if (userData && userData.username) {
      localStorage.setItem("username", userData.username);
      localStorage.setItem("role", userData.role || "User");
      
      setUser({ 
        username: userData.username, 
        role: userData.role || "User" 
      });

      // Navigate-ийг setTimeout-гүйгээр шууд хийж болно
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

  // Хэрэв localStorage-оос мэдээлэл уншиж дуусаагүй бол юу ч харуулахгүй (эсвэл spinner)
  if (loading) {
    return <div className="loading-screen">Ачаалж байна...</div>;
  }

  return (
    <Routes>
      {/* Root path */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleAuthSuccess} onNavigate={() => navigate("/register")} />} 
      />

      <Route 
        path="/register" 
        element={<RegisterPage onRegister={() => navigate("/login")} onNavigate={() => navigate("/login")} />} 
      />

      <Route 
        path="/dashboard" 
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      
      {/* 404 handling */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;