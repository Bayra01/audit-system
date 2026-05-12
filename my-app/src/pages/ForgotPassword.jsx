import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("identify");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. OTP код илгээх
  const handleSendCode = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email) { setError("Имэйл хаягаа оруулна уу!"); return; }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Баталгаажуулах код имэйл рүү илгээгдлээ ✓");
      setStep("otp");
      setOtp("");
    } catch (err) {
      setError(err?.response?.data?.message || "Код илгээхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  // 2. OTP + Шинэ нууц үг — нэг алхамд шийдэх
  // 3. Шинэ нууц үг хадгалах
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) { setError("Нууц үг дор хаяж 6 тэмдэгт байх ёстой."); return; }
    if (newPassword !== confirmPassword) { setError("Нууц үг таарахгүй байна."); return; }

    setLoading(true);
    try {
      // Backend-ийн хүлээж авч буй нэршлүүдээр (otp, password, confirmPassword) илгээх
      await api.post("/auth/reset-password", { 
        email, 
        otp, 
        password: newPassword, // Backend дээр 'newPass = newPassword || password' гэж байгаа тул 'password' гэж явуулахад болно
        confirmPassword 
      });

      toast.success("Нууц үг амжилттай шинэчлэгдлээ! Нэвтэрч орно уу.", { autoClose: 3000 });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Нууц үг шинэчлэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: "identify", label: "Имэйл" },
    { key: "otp",      label: "Шинэ нууц үг" },
  ];
  const currentIdx = steps.findIndex(s => s.key === step);

  return (
    <div id="loginPage">
      <div className="login-card" style={{ maxWidth: "400px" }}>
        <div className="login-brand">
          <div className="login-brand-icon">🛡️</div>
          <div className="login-brand-text">Аюулгүй байдал</div>
        </div>

        {/* Алхамын мөр */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {steps.map((s, i) => {
            const done   = currentIdx > i;
            const active = currentIdx === i;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "#2ecc71" : active ? "#3498db" : "#eee",
                  color: done || active ? "#fff" : "#aaa",
                  transition: "all 0.3s",
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 11, color: active ? "#3498db" : done ? "#2ecc71" : "#aaa", fontWeight: active ? 600 : 400 }}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div style={{ width: 20, height: 1, background: done ? "#2ecc71" : "#eee", transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── АЛХАМ 1: ИМЭЙЛ ── */}
        {step === "identify" && (
          <>
            <div className="login-h" style={{ fontSize: "18px" }}>Нууц үг сэргээх</div>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", textAlign: "center" }}>
              Бүртгэлтэй имэйл хаягаа оруулж баталгаажуулах код авна уу.
            </p>
            <form onSubmit={handleSendCode}>
              <label className="f-label">Имэйл хаяг</label>
              <input
                className="f-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@tavanbogd.com"
                disabled={loading}
              />
              {error && <div style={{ color: "#ff4d4d", fontSize: "13px", marginBottom: "10px" }}>⚠️ {error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Илгээж байна..." : "Код илгээх"}
              </button>
            </form>
          </>
        )}

        {/* ── АЛХАМ 2: КОД + ШИНЭ НУУЦ ҮГ — нэг дор ── */}
        {step === "otp" && (
          <>
            <div className="login-h">Нууц үг шинэчлэх</div>
            <p style={{ fontSize: "13px", color: "#666", textAlign: "center", marginBottom: 16 }}>
              <b>{email}</b> хаягт ирсэн кодыг болон шинэ нууц үгээ оруулна уу.
            </p>
            <form onSubmit={handleResetPassword}>
              {/* OTP */}
              <label className="f-label">Баталгаажуулах код</label>
              <input
                className="f-input"
                style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: 700 }}
                type="text"
                maxLength="6"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="······"
                disabled={loading}
              />

              {/* Шинэ нууц үг */}
              <label className="f-label" style={{ marginTop: 12 }}>Шинэ нууц үг</label>
              <input
                className="f-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />

              {/* Нууц үг давтах */}
              <label className="f-label" style={{ marginTop: 8 }}>Нууц үг давтах</label>
              <input
                className="f-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />

              {error && (
                <div style={{ color: "#ff4d4d", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Хадгалж байна..." : "Хадгалах"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <span
                  onClick={() => { if (!loading) { setStep("identify"); setError(""); setOtp(""); } }}
                  style={{ color: "#aaa", cursor: "pointer", fontSize: "12px" }}
                >
                  ← Буцах
                </span>
                <span
                  onClick={() => { if (!loading) handleSendCode(); }}
                  style={{ color: "#3498db", cursor: "pointer", fontSize: "12px" }}
                >
                  Код дахин илгээх
                </span>
              </div>
            </form>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <span onClick={() => navigate("/login")} style={{ color: "#888", cursor: "pointer", fontSize: "13px" }}>
            ← Нэвтрэх рүү буцах
          </span>
        </div>
      </div>
    </div>
  );
}