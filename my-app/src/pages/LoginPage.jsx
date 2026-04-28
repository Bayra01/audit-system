import { useState } from "react";
import api from "../axios";

export default function LoginPage({ onLogin, onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    setError("");
    const u = username.trim();

    if (!u || !password) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }

    setLoading(true);

    try {
      const url = import.meta.env.VITE_API_BASE_URL;

      // 1. Сервер рүү хүсэлт илгээх
      const response = await api.post(`${url}/auth/login`,
        { username: u, password: password },
        { timeout: 60000, withCredentials: false }
      );

      // 2. Хариуг шалгах
      if (response.data && response.data.accessToken) {
        // Token болон бусад мэдээллийг хадгалах
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("role", response.data.user.role || "User");

        // 3. App.jsx-ийн handleAuthSuccess-ийг дуудаж, Navigate хийлгэх
        onLogin?.(response.data.user);
      } else {
        setError("Нэвтрэх мэдээлэл дутуу ирлээ.");
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Серверээс ирсэн алдааны мессежийг харуулах
      const msg = err.response?.data?.message || "Хэрэглэгчийн нэр эсвэл нууц үг буруу";
      setError(msg);
    } finally {
      // Алдаа гарсан тохиолдолд товчлуурыг буцааж идэвхжүүлнэ
      setLoading(false);
    }
  }

  return (
    <div id="loginPage">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">📋</div>
          <div className="login-brand-text">Хяналтын Систем</div>
        </div>

        <div className="login-h">Нэвтрэх</div>
        
        <label className="f-label">Хэрэглэгчийн нэр</label>
        <input
          className="f-input"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && doLogin()}
          disabled={loading}
        />

        <label className="f-label">Нууц үг</label>
        <input
          className="f-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && doLogin()}
          disabled={loading}
        />

        {error && <div className="login-err" style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}

        <button
          className="login-btn"
          onClick={doLogin}
          disabled={loading}
        >
          {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "20px" }}>
          Бүртгэлгүй юу?{" "}
          <span onClick={onNavigate} style={{ color: "#00bcd4", cursor: "pointer", fontWeight: "bold" }}>
            Бүртгүүлэх
          </span>
        </p>
      </div>
    </div>
  );
}