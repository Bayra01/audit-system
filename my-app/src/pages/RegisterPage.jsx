import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Шууд шилжилт хийхийн тулд
import api from "../axios"; 

export default function RegisterPage({ onNavigate }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "User",
    password: "",
    confirm: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(f, v) {
    setForm(p => ({ ...p, [f]: v }));
  }

  async function handleRegister(e) {
    if (e) e.preventDefault();
    setError("");

    // Баталгаажуулалт
    if (!form.username || !form.email || !form.password) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Нууц үг таарахгүй байна");
      return;
    }

    setLoading(true);

    try {
      // Backend-ийн бүтцээс хамаарч /auth/register эсвэл /register байна
      await api.post("/auth/register", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });

      alert("Бүртгэл амжилттай үүслээ! ✅");
      
      // Бүртгүүлсний дараа шууд нэвтрэх хуудас руу шилжинэ
      navigate("/login");
      
    } catch (err) {
      const msg = err.response?.data?.message || "Бүртгэх үед алдаа гарлаа.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="loginPage">
      <div className="login-card" style={{ width: "400px" }}>
        <div className="login-brand">
          <div className="login-brand-icon">📋</div>
          <div className="login-brand-text">Хяналтын Систем</div>
        </div>

        <div className="login-h">Бүртгүүлэх</div>
        <div className="login-sub">Шинэ хэрэглэгч үүсгэх</div>

        <div className="fg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div className="fl">
            <label className="f-label">Нэр</label>
            <input 
              className="f-input" 
              type="text" 
              value={form.username} 
              onChange={e => handleChange("username", e.target.value)} 
              disabled={loading}
            />
          </div>
          <div className="fl">
            <label className="f-label">Үүрэг</label>
            <select 
              className="f-input" 
              value={form.role} 
              onChange={e => handleChange("role", e.target.value)}
              disabled={loading}
            >
              <option value="User">Хэрэглэгч</option>
              <option value="Admin">Админ</option>
            </select>
          </div>
        </div>

        <label className="f-label">Имэйл хаяг</label>
        <input 
          className="f-input" 
          type="email" 
          value={form.email} 
          onChange={e => handleChange("email", e.target.value)} 
          disabled={loading}
        />

        <label className="f-label">Нууц үг</label>
        <input 
          className="f-input" 
          type="password" 
          value={form.password} 
          onChange={e => handleChange("password", e.target.value)} 
          disabled={loading}
        />

        <label className="f-label">Нууц үг баталгаажуулах</label>
        <input 
          className="f-input" 
          type="password" 
          value={form.confirm} 
          onChange={e => handleChange("confirm", e.target.value)} 
          onKeyDown={e => e.key === "Enter" && !loading && handleRegister()}
          disabled={loading}
        />

        {error && <div className="login-err" style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}

        <button className="login-btn" onClick={handleRegister} disabled={loading}>
          {loading ? "Бүртгэж байна..." : "Бүртгүүлэх →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "20px", color: "#888" }}>
          Аль хэдийн бүртгэлтэй юу?{" "}
          <span onClick={onNavigate} style={{ color: "#00bcd4", fontWeight: "bold", cursor: "pointer" }}>Нэвтрэх</span>
        </p>
      </div>
    </div>
  );
}