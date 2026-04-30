import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import api from "../axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify'; 

export default function LoginPage({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Dashboard руу нэвтрээгүй орох үед харуулах ЦОРЫН ГАНЦ Toast
  useEffect(() => {
    if (location.state?.fromDashboard) {
      toast.info("Та эхлээд нэвтрэнэ үү!", { toastId: "auth-msg" });
      
      // Дахин дахин гаргахгүйн тулд state-ийг цэвэрлэх
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  async function doLogin() {
    setError("");
    const u = username.trim();

    // Талбаруудыг шалгах - Зөвхөн текстээр алдаа харуулна
    if (!u || !password) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/login`, {
        username: u,
        password: password
      });

      if (response.data && response.data.accessToken) {
        const { user, accessToken } = response.data;
        // Нэвтрэх үед Toast харуулахгүй байж болно, эсвэл зөвхөн амжилтыг үлдээж болно
        signIn(user, accessToken);
      } else {
        setError("Нэвтрэх мэдээлэл дутуу ирлээ.");
      }

    } catch (err) {
      // Серверээс ирсэн алдааг зөвхөн setError-т өгнө[cite: 2]
      const msg = err.response?.data?.message || "Сервертэй холбогдоход алдаа гарлаа";
      setError(msg);
    } finally {
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
          placeholder="Хэрэглэгчийн нэр"
        />

        <label className="f-label">Нууц үг</label>
        <input
          className="f-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && doLogin()}
          disabled={loading}
          placeholder="••••••••"
        />

        {/* Улаан алдааны бичиг хэвээрээ үлдэнэ */}
        {error && (
          <div className="login-err" style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          className="login-btn"
          onClick={doLogin}
          disabled={loading}
        >
          {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "20px", color: "#666" }}>
          Бүртгэлгүй юу?{" "}
          <span
            onClick={onNavigate}
            style={{ color: "#00bcd4", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
          >
            Бүртгүүлэх
          </span>
        </p>
      </div>
    </div>
  );
}