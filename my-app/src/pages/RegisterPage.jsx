import { useState } from "react";
// 1. Axios тохиргоог импортлох
import api from "../axios"; 

export default function RegisterPage({ onRegister, onNavigate }) {
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
    e.preventDefault();
    setError("");

    // Шаардлагатай шалгалтууд
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
      // 2. localStorage-ийн оронд API хүсэлт илгээх
      // Backend дээрх /register зам (route) руу мэдээллийг явуулна
      await api.post("/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      });

      // 3. Амжилттай бол мэдэгдэл харуулаад нэвтрэх хуудас руу шилжинэ
      alert("Бүртгэл амжилттай үүслээ! ✅");
      onRegister?.(); // Энэ нь App.jsx-ийн setPage("login")-ийг ажиллуулна
      
    } catch (err) {
      // 4. Серверээс ирсэн алдааны мессежийг харуулах (Жишээ нь: "Имэйл бүртгэлтэй байна")
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
          disabled={loading}
        />

        {error && <div className="login-err">{error}</div>}

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