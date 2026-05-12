import { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function EmailPage() {
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const sendEmail = async () => {
    if (!email.to || !email.subject || !email.body) {
      toast.warning("Бүх талбарыг бөглөнө үү.");
      return;
    }
    setSending(true);
    try {
      await api.post("/email/send", email);
      toast.success("Имэйл амжилттай илгээгдлээ ✓");
      setEmail({ to: "", subject: "", body: "" });
    } catch (err) {
      toast.error("Имэйл илгээхэд алдаа гарлаа.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-wrapper">
      <div className="email-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <h2>Имэйл илгээх</h2>
          <p>Шаардлагатай мэдээллийг энд бөглөж илгээнэ үү</p>
        </div>

        {/* Input Fields */}
        <div className="form-body">
          <div className="input-group">
            <label>Хүлээн авагчийн имэйл</label>
            <input
              type="email"
              value={email.to}
              onChange={e => setEmail(p => ({ ...p, to: e.target.value }))}
              placeholder="name@company.com"
            />
          </div>

          <div className="input-group">
            <label>Гарчиг</label>
            <input
              type="text"
              value={email.subject}
              onChange={e => setEmail(p => ({ ...p, subject: e.target.value }))}
              placeholder="Имэйлийн сэдэв..."
            />
          </div>

          <div className="input-group">
            <label>Агуулга</label>
            <textarea
              value={email.body}
              onChange={e => setEmail(p => ({ ...p, body: e.target.value }))}
              placeholder="Мессежээ энд бичнэ үү..."
              rows={5}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-footer">
          <button className="btn-secondary" onClick={() => setEmail({ to: "", subject: "", body: "" })}>
            Цэвэрлэх
          </button>
          <button className="btn-primary" onClick={sendEmail} disabled={sending}>
            {sending ? <div className="loader"></div> : "Илгээх"}
          </button>
        </div>
      </div>

      <style>{`
        .email-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 120px);
          padding: 20px;
          background: #f8fafc;
        }

        .email-card {
          width: 100%;
          maxWidth: 500px;
          background: #ffffff;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .icon-circle {
          width: 56px;
          height: 56px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .card-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .card-header p {
          font-size: 14px;
          color: #64748b;
          margin-top: 8px;
        }

        .form-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          margin-left: 4px;
        }

        .input-group input, .input-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .input-group input:focus, .input-group textarea:focus {
          background: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-footer {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-secondary {
          flex: 1;
          padding: 12px;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .btn-primary {
          flex: 2;
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        .loader {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}