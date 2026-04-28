import { useState, useEffect } from 'react';
import './App.css'; 
import './style.css'; 

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from './pages/Dashboard';

function App() {
  const [page, setPage] = useState("login"); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");
    if (savedUser) {
      setUser({ username: savedUser, role: savedRole });
      setPage("dashboard");
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    if (userData.username) {
      localStorage.setItem("username", userData.username);
      localStorage.setItem("role", userData.role || "User");
      setUser(userData);
      setPage("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage("login");
  };

  // --- Dashboard рендер хийх (Гадуур нь нэмэлт div-гүй) ---
  if (page === "dashboard") {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // --- Login болон Register ---
  return (
    <>
      {page === "login" ? (
        <LoginPage onLogin={handleAuthSuccess} onNavigate={() => setPage("register")} />
      ) : (
        <RegisterPage onRegister={() => setPage("login")} onNavigate={() => setPage("login")} />
      )}
    </>
  );
}

export default App;