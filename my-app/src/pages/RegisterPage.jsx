import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../api/axios"; // Чиний зассан axios instance
import { toast } from "react-toastify";

export default function RegisterPage() {
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

  // Имэйл шалгах Regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function handleChange(f, v) {
    setForm(p => ({ ...p, [f]: v }));
  }

  async function handleRegister(e) {
    if (e) e.preventDefault(); // Form submit үед хуудас дахин ачааллахаас сэргийлнэ
    setError("");

    // 1. Оролтын утгуудыг цэвэрлэх (Trim)
    const username = form.username.trim();
    const email = form.email.trim();
    const { password, confirm, role } = form;

    // 2. Баталгаажуулалт (Validation)
    if (!username || !email || !password || !confirm) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Зөв имэйл хаяг оруулна уу");
      return;
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    if (password !== confirm) {
      setError("Нууц үг таарахгүй байна");
      return;
    }

    setLoading(true);

    try {
      // Backend-ийн зам ихэвчлэн /signup эсвэл /register байдаг
      await api.post("/auth/signup", {
        username,
        email,
        password,
        role
      });

      toast.success("Бүртгэл амжилттай! Одоо нэвтэрнэ үү. ✅");
      navigate("/login");
      
    } catch (err) {
      // Алдааны мессежийг илүү дэлгэрэнгүй харуулах
      const msg = err.response?.data?.message || "Бүртгэх үед алдаа гарлаа. Серверээ шалгана уу.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="loginPage">
      {/* Form ашигласнаар Enter дарахад handleRegister ажиллана */}
      <form className="login-card" style={{ width: "400px" }} onSubmit={handleRegister}>
        <div className="login-brand">
          <div className="login-brand-icon">📋</div>
          <div className="login-brand-text">Хяналтын Систем</div>
        </div>

        <div className="login-h">Бүртгүүлэх</div>
        <div className="login-sub" style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
          Шинэ хэрэглэгч үүсгэх
        </div>

        <div className="fg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div className="fl">
            <label className="f-label">Нэр</label>
            <input 
              className="f-input" 
              type="text" 
              value={form.username} 
              onChange={e => handleChange("username", e.target.value)} 
              disabled={loading}
              placeholder="Хэрэглэгчийн нэр"
              required
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
          placeholder="example@mail.com"
          required
        />

        <label className="f-label">Нууц үг</label>
        <input 
          className="f-input" 
          type="password" 
          value={form.password} 
          onChange={e => handleChange("password", e.target.value)} 
          disabled={loading}
          placeholder="••••••••"
          required
        />

        <label className="f-label">Нууц үг баталгаажуулах</label>
        <input 
          className="f-input" 
          type="password" 
          value={form.confirm} 
          onChange={e => handleChange("confirm", e.target.value)} 
          disabled={loading}
          placeholder="••••••••"
          required
        />

        {error && (
          <div style={{ 
            color: '#fff', 
            backgroundColor: '#ff4d4d', 
            padding: '10px', 
            borderRadius: '5px', 
            fontSize: '13px', 
            marginBottom: '15px', 
            textAlign: 'center' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <button 
          type="submit" 
          className="login-btn" 
          disabled={loading}
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Бүртгэж байна..." : "Бүртгүүлэх →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "25px", color: "#666" }}>
          Аль хэдийн бүртгэлтэй юу?{" "}
          <span 
            onClick={() => navigate("/login")} 
            style={{ color: "#00bcd4", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
          >
            Нэвтрэх
          </span>
        </p>
      </form>
    </div>
  );
}