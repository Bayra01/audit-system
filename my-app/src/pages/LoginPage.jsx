import { useState } from "react";

// onNavigate пропсыг нэмж өгсөн
export default function LoginPage({ onLogin, onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    setError("");
    if (!username.trim() || !password) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }
    setLoading(true);
    try {
      const u = username.trim();
      if (u === "admin" && password === "password") {
        onLogin?.({ username: u, role: "Admin" });
      } else {
        setError("Хэрэглэгч эсвэл нууц үг буруу");
      }
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
        <div className="login-sub">Хэрэглэгчийн мэдээллээ оруулна уу</div>

        <label className="f-label">Хэрэглэгчийн нэр</label>
        <input
          className="f-input"
          type="text"
          placeholder="admin"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doLogin()}
        />

        <label className="f-label">Нууц үг</label>
        <input
          className="f-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doLogin()}
        />

        <div className="login-err">{error}</div>

        <button
          className="login-btn"
          onClick={doLogin}
          disabled={loading}
        >
          {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "20px", color: "#888" }}>
          Бүртгэлгүй юу?{" "}
          <span 
            onClick={(e) => {
              e.preventDefault(); // Хуудас дахин ачаалагдахаас сэргийлнэ
              onNavigate(); // App.jsx-д байгаа хуудас солих функцийг дуудна
            }} 
            style={{ 
              color: "#00bcd4", 
              textDecoration: "none", 
              fontWeight: "bold",
              cursor: "pointer" 
            }}
          >
            Бүртгүүлэх
          </span>
        </p>
      </div>
    </div>
  );
}