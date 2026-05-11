import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

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
      const response = await api.post("/auth/login", {
        username: u,
        password: password,
      });

      // ✅ ЗАСВАР 1: Backend-ийн response-г console-д харж token нэрийг шалга
      console.log("Login response:", response.data);

      // ✅ ЗАСВАР 2: token эсвэл accessToken хоёуланг нь дэмжих
      const token = response.data?.token || response.data?.accessToken;
      const user = response.data?.user;

      if (token) {
        // ✅ ЗАСВАР 3: localStorage давхар хадгалахгүй — signIn() дотор хадгалдаг
        signIn(user, token);

        toast.success("Амжилттай нэвтэрлээ! 🎉");
        navigate("/dashboard", { replace: true });
      } else {
        setError("Токен олдсонгүй. Backend-ийн response-г шалгана уу.");
        console.error("Response бүтэц:", response.data);
      }

    } catch (err) {
      console.error("Login detail error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === "Network Error" 
          ? "Сервертэй холбогдож чадсангүй. Сервер асаагүй эсвэл URL буруу байна." 
          : "Сервертэй холбогдоход алдаа гарлаа.");
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