import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Утасны хэсгийг устгаж, зөвхөн имэйл дээр төвлөрөв
  const [step, setStep] = useState("identify"); 
  const [email, setEmail] = useState(""); 
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  // 1. Код илгээх (Identify)
  const handleSendCode = (e) => {
    e.preventDefault();
    setError(""); 

    if (!email) {
      setError("Имэйл хаягаа оруулна уу!");
      return;
    }
    
    // Имэйл формат шалгах (заавал биш ч байвал зүгээр)
    if (!email.includes("@")) {
      setError("Зөв имэйл хаяг оруулна уу!");
      return;
    }

    console.log(`Имэйл рүү код илгээв: ${email}`);
    setStep("otp");
  };

  // 2. Код шалгах (OTP)
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");

    if (otp.length < 4 || otp.length > 6) {
      setError("Баталгаажуулах код 4-6 тэмдэгт байх ёстой.");
      return;
    }

    const finalOtp = otp.toUpperCase();
    if (finalOtp === "A1B2" || finalOtp === "123456") { 
      setStep("reset");
    } else {
      setError("Буруу код байна!");
    }
  };

  // 3. Нууц үг шинэчлэх (Reset)
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Нууц үг дор хаяж 6 тэмдэгт байх ёстой.");
      return;
    }
    
    toast.success("Нууц үг амжилттай шинэчлэгдлээ! Та нэвтэрч орно уу.", {
      position: "top-right",
      autoClose: 3000
    });

    navigate("/login");
  };

  return (
    <div id="loginPage">
      <div className="login-card" style={{ maxWidth: "400px" }}>
        <div className="login-brand">
          <div className="login-brand-icon">🛡️</div>
          <div className="login-brand-text">Аюулгүй байдал</div>
        </div>

        {/* АЛХАМ 1: ИМЭЙЛ ОРУУЛАХ */}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
              />
              {error && <div style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px' }}>⚠️ {error}</div>}
              <button type="submit" className="login-btn">Код илгээх</button>
            </form>
          </>
        )}

        {/* АЛХАМ 2: OTP ШАЛГАХ */}
        {step === "otp" && (
          <>
            <div className="login-h">Баталгаажуулах</div>
            <p style={{ fontSize: "13px", color: "#666", textAlign: "center" }}>
              <b>{email}</b> хаягт ирсэн кодыг оруулна уу.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <input
                className="f-input"
                style={{ 
                  textAlign: "center", 
                  fontSize: "20px", 
                  letterSpacing: "4px",
                  textTransform: "uppercase"
                }}
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="A1B2C3"
              />
              {error && <div style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>⚠️ {error}</div>}
              <button type="submit" className="login-btn">Баталгаажуулах</button>
              <p onClick={() => { setStep("identify"); setError(""); setOtp(""); }} style={{ textAlign: "center", color: "#00bcd4", cursor: "pointer", fontSize: "12px", marginTop: "10px" }}>Буцах</p>
            </form>
          </>
        )}

        {/* АЛХАМ 3: ШИНЭ НУУЦ ҮГ */}
        {step === "reset" && (
          <>
            <div className="login-h">Шинэ нууц үг</div>
            <form onSubmit={handleResetPassword}>
              <label className="f-label">Шинэ нууц үг тохируулах</label>
              <input
                className="f-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              {error && <div style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '10px' }}>⚠️ {error}</div>}
              <button type="submit" className="login-btn">Хадгалах</button>
            </form>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <span onClick={() => navigate("/login")} style={{ color: "#888", cursor: "pointer", fontSize: "13px" }}>Нэвтрэх рүү буцах</span>
        </div>
      </div>
    </div>
  );
}