import { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function EmailPage() {
  const [email, setEmail] = useState({ to: "", subj: "", body: "" });
  const [sending, setSending] = useState(false);

  const sendEmail = async () => {
    if (!email.to || !email.subj || !email.body) {
      toast.warning("Бүх талбарыг бөглөнө үү.");
      return;
    }
    setSending(true);
    try {
      await api.post("/email/send", email);
      toast.success("Имэйл амжилттай илгээгдлээ ✓");
      setEmail({ to: "", subj: "", body: "" });
    } catch {
      toast.error("Имэйл илгээхэд алдаа гарлаа.");
    } finally {
      setSending(false);
    }
  };

  const inp = {
    width: "100%", padding: "10px 14px",
    border: "1px solid #e0e0e0", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#fafafa",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
        Имэйл илгээх
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "#aaa" }}>
        Хариуцагч болон менежер рүү шууд имэйл илгээх
      </p>

      <div style={{ background: "#fff", borderRadius: 14, padding: 28, border: "0.5px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>

        {/* To */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 }}>
            Хүлээн авагч (To)
          </label>
          <input
            type="email"
            value={email.to}
            onChange={e => setEmail(p => ({ ...p, to: e.target.value }))}
            placeholder="example@mail.com"
            style={inp}
          />
        </div>

        {/* Subject */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 }}>
            Гарчиг (Subject)
          </label>
          <input
            type="text"
            value={email.subj}
            onChange={e => setEmail(p => ({ ...p, subj: e.target.value }))}
            placeholder="Имэйлийн гарчиг..."
            style={inp}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 }}>
            Агуулга (Body)
          </label>
          <textarea
            value={email.body}
            onChange={e => setEmail(p => ({ ...p, body: e.target.value }))}
            placeholder="Имэйлийн агуулга..."
            rows={8}
            style={{ ...inp, resize: "vertical", minHeight: 140, fontFamily: "inherit" }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f0f0f0", marginBottom: 20 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#bbb" }}>
            {email.body.length > 0 ? `${email.body.length} тэмдэгт` : ""}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setEmail({ to: "", subj: "", body: "" })}
              style={{
                padding: "9px 20px", border: "1px solid #eee", borderRadius: 8,
                background: "#fff", color: "#888", fontSize: 13, cursor: "pointer",
              }}
            >
              Цэвэрлэх
            </button>
            <button
              onClick={sendEmail}
              disabled={sending}
              style={{
                background: sending ? "#85b7eb" : "#3498db",
                color: "#fff", border: "none", padding: "9px 24px",
                borderRadius: 9, cursor: sending ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {sending ? (
                <>
                  <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Илгээж байна...
                </>
              ) : "✉️  Илгээх"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}