import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.fromDashboard) {
      toast.info("Нэвтрэнэ үү!", {
        toastId: "auth-msg",
        style: { fontSize: "15px", minHeight: "60px" },
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  async function doLogin() {
  setError("");
  const u = username.trim();

  if (!u || !password) {
    setError("Бүх талбарыг бөглөнө үү");
    return;
  }

  setLoading(true);

  try {
    // 🔴 АЛДАА: Энд 'await' орхигдсон байсан
    // Мөн api.post-оо ашиглах нь илүү дээр (interceptors ажиллахын тулд)
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      username: u,
      password: password,
    });

    console.log("Login response data:", response.data);

    // Backend-ээс ирж буй түлхүүр үгсийг (key) шалгах
    const token = response.data?.token || response.data?.accessToken;
    const user = response.data?.user;

    if (token) {
      // AuthContext-ийн signIn функц рүү дамжуулах
      signIn(user, token);

      toast.success("Амжилттай нэвтэрлээ! 🎉");
      
      // Navigate хийхээс өмнө бага зэрэг хүлээх эсвэл шууд шилжих
      navigate("/dashboard", { replace: true });
    } else {
      setError("Токен олдсонгүй. Backend-ийн response-г шалгана уу.");
    }

  } catch (err) {
    console.error("Login detail error:", err);
    // Сүлжээний эсвэл серверийн алдааг барих
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      (err.message === "Network Error" 
        ? "Сервертэй холбогдож чадсангүй. URL эсвэл Сүлжээгээ шалгана уу." 
        : "Нэвтрэхэд алдаа гарлаа.");
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

        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <span
            onClick={() => navigate("/forgot-password")}
            style={{ fontSize: "12px", color: "#888", cursor: "pointer", textDecoration: "underline" }}
          >
            Нууц үгээ мартсан уу?
          </span>
        </div>

        {error && (
          <div className="login-err" style={{
            color: '#ff4d4d',
            fontSize: '13px',
            marginBottom: '15px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        <button className="login-btn" onClick={doLogin} disabled={loading}>
          {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "25px", color: "#666" }}>
          Бүртгэлгүй юу?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#00bcd4", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
          >
            Бүртгүүлэх
          </span>
        </p>
      </div>
    </div>
  );
}