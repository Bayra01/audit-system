import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import DashboardPage from "./dashboard/DashboardPage";
import ViolationsPage from "./dashboard/ViolationsPage";
import EmailPage from "./dashboard/EmailPage";

// ════════════════════════════════════════════════════════
// ТОГТМОЛУУД
// ════════════════════════════════════════════════════════
const today = () => new Date().toISOString().split("T")[0];

export const SEV_MAP = {
  low: { label: "Бага", bg: "#e8f8f0", color: "#1a7a45", dot: "#2ecc71" },
  medium: { label: "Дунд", bg: "#fef9e7", color: "#7d6608", dot: "#f1c40f" },
  high: { label: "Өндөр", bg: "#fef0e7", color: "#784212", dot: "#e67e22" },
  critical: { label: "Ноцтой", bg: "#fdecea", color: "#78281f", dot: "#e74c3c" },
};

export const STAT_MAP = {
  new: { label: "Шинэ", bg: "#eaf4fd", color: "#1a5276", dot: "#3498db" },
  pending: { label: "Шалгагдаж буй", bg: "#f4ecf7", color: "#6c3483", dot: "#9b59b6" },
  resolved: { label: "Шийдвэрлэсэн", bg: "#e8f8f0", color: "#1a7a45", dot: "#2ecc71" },
};
const SEED = [
  { id: 1, name: "Зөвшөөрөлгүй нэвтрэх оролдлого", type: "Security", severity: "high", date: today(), status: "new" },
  { id: 2, name: "Системийн удаашрал", type: "Performance", severity: "medium", date: today(), status: "resolved" },
  { id: 3, name: "Өгөгдөл алдагдах эрсдэл", type: "Data", severity: "critical", date: today(), status: "pending" },
  { id: 4, name: "Ватсапп группээр мэдээлэл задруулсан", type: "Security", severity: "high", date: today(), status: "new" },
  { id: 5, name: "Дотоод сүлжээний тасалдал", type: "Infrastructure", severity: "medium", date: today(), status: "resolved" },
  { id: 6, name: "Серверийн диск дүүрсэн", type: "Infrastructure", severity: "high", date: today(), status: "pending" },
  { id: 7, name: "Ажилтан ажлын байранд унтсан", type: "HR", severity: "low", date: today(), status: "new" },
  { id: 8, name: "Санхүүгийн программ гацсан", type: "Software", severity: "high", date: today(), status: "pending" },
  { id: 9, name: "Нууц үг алдагдсан байж болзошгүй", type: "Security", severity: "critical", date: today(), status: "new" },
  { id: 10, name: "Тайлан хоцроосон", type: "Management", severity: "low", date: today(), status: "resolved" },
  { id: 11, name: "Хэрэглэгчийн мэдээлэл буруу бүртгэгдсэн", type: "Data", severity: "medium", date: today(), status: "pending" },
  { id: 12, name: "API хариу өгөхгүй байна", type: "Performance", severity: "high", date: today(), status: "new" },
  { id: 13, name: "Цаг бүртгэлийн төхөөрөмж эвдэрсэн", type: "Hardware", severity: "medium", date: today(), status: "new" },
];

// ════════════════════════════════════════════════════════
// ТУСЛАХ КОМПОНЕНТУУД
// ════════════════════════════════════════════════════════
export const Badge = ({ map, val }) => {
  const s = map[val] || { label: val, bg: "#eee", color: "#333", dot: "#aaa" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

export const StatCard = ({ title, value, sub, icon, accent }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "0.5px solid #eee",
    display: "flex", alignItems: "center", gap: 16, flex: 1,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: accent + "18", color: accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// ADMIN USERS КОМПОНЕНТ
// ════════════════════════════════════════════════════════
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await api.get("/auth/users");
      setUsers(response.data);
    } catch (err) {
      toast.error("Хэрэглэгчдийн жагсаалтыг авахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBlock(id, currentStatus) {
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      await api.put(`/auth/users/${id}/status`, { status: newStatus });
      toast.info(`Хэрэглэгчийн төлөв: ${newStatus === "active" ? "Идэвхжүүлсэн" : "Блоклосон"}`);
      setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      toast.error("Төлөв өөрчлөхөд алдаа гарлаа.");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`"${name}" хэрэглэгчийг устгахдаа итгэлтэй байна уу?`)) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success("Хэрэглэгч амжилттай устлаа.");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Устгах үед алдаа гарлаа.");
    }
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleStyle = (role) => role === "Admin"
    ? { background: "#fef3cd", color: "#856404", border: "1px solid #ffc107" }
    : { background: "#e9ecef", color: "#495057", border: "1px solid #dee2e6" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#aaa", fontSize: 14 }}>
      Уншиж байна...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>👥 Хэрэглэгчийн удирдлага</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Нийт: <b style={{ color: "#555" }}>{filteredUsers.length}</b> хэрэглэгч</span>
          <button
            onClick={fetchUsers}
            style={{
              padding: "7px 14px", border: "1px solid #d0e4f7", borderRadius: 8,
              background: "#eaf4fd", color: "#1a5276", fontSize: 12, cursor: "pointer", fontWeight: 500,
            }}
          >
            🔄 Шинэчлэх
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "14px 18px",
        border: "0.5px solid #eee", marginBottom: 16,
      }}>
        <input
          type="text"
          placeholder="🔍  Нэр эсвэл имэйлээр хайх..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: "8px 14px",
            border: "1px solid #e0e0e0", borderRadius: 8,
            fontSize: 14, outline: "none", background: "#fafafa",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #eee", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fb" }}>
              {["#", "Хэрэглэгч", "Имэйл", "Үүрэг", "Төлөв", "Үйлдэл"].map(h => (
                <th key={h} style={{
                  padding: "13px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 600, color: "#888",
                  borderBottom: "1px solid #f0f0f0",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
              <tr key={u._id} style={{ borderBottom: "0.5px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                {/* Avatar + # */}
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#aaa", width: 40 }}>{i + 1}</td>

                {/* Username + avatar */}
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: u.role === "Admin" ? "#ffc107" : "#3498db",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>{u.username}</span>
                  </div>
                </td>

                {/* Email */}
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#666" }}>{u.email}</td>

                {/* Role badge */}
                <td style={{ padding: "13px 16px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    ...roleStyle(u.role),
                  }}>
                    {u.role === "Admin" ? "⭐ Админ" : "👤 Хэрэглэгч"}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: "13px 16px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: u.status === "active" ? "#e8f8f0" : "#fdecea",
                    color: u.status === "active" ? "#1a7a45" : "#78281f",
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: u.status === "active" ? "#2ecc71" : "#e74c3c",
                    }} />
                    {u.status === "active" ? "Идэвхтэй" : "Блоктой"}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleToggleBlock(u._id, u.status)}
                      style={{
                        padding: "5px 12px", border: "none", borderRadius: 7,
                        background: u.status === "active" ? "#fef0e7" : "#e8f8f0",
                        color: u.status === "active" ? "#784212" : "#1a7a45",
                        fontSize: 12, cursor: "pointer", fontWeight: 500,
                      }}
                    >
                      {u.status === "active" ? "🔒 Блоклох" : "✅ Идэвхжүүлэх"}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.username)}
                      style={{
                        padding: "5px 12px", border: "1px solid #f5c6c6", borderRadius: 7,
                        background: "#fdecea", color: "#a32d2d", fontSize: 12, cursor: "pointer",
                      }}
                    >
                      🗑 Устгах
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                  {searchTerm ? "Хайлтад тохирох хэрэглэгч олдсонгүй" : "Хэрэглэгч байхгүй байна"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{
          padding: "12px 16px", borderTop: "0.5px solid #f0f0f0",
          fontSize: 12, color: "#aaa", display: "flex", justifyContent: "space-between",
        }}>
          <span>Нийт: <b style={{ color: "#555" }}>{filteredUsers.length}</b> хэрэглэгч</span>
          {filteredUsers.length !== users.length && <span>({users.length}-с шүүгдсэн)</span>}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════
// VIOLATION MODAL — шинэ маягт
// ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════
// ЗАССАН VIOLATION MODAL КОМПОНЕНТ
// ════════════════════════════════════════════════════════
const EMPTY_ROW = () => ({
  id: Date.now() + Math.random(),
  name: "",
  description: "",
  department: "",
  action: "",
  assignee: "",
  assigneeEmail: "",
  managerName: "",
  executionResponse: "",
  dueDate: ""
});

function ViolationModal({ modal, onClose, onSave }) {
  // 1. Төлөвүүд (State)
  const [meta, setMeta] = useState({
    number: modal.initial?.group_number || "",
    year: modal.initial?.year || new Date().getFullYear().toString(),
    quarter: modal.initial?.quarter || "I улирал",
    severity: modal.initial?.rating || "low",
    status: modal.initial?.status || "new",
  });

  const [rows, setRows] = useState([EMPTY_ROW()]);
  const [importName, setImportName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Modal нээгдэхэд өгөгдлийг цэнэглэх
  useEffect(() => {
    if (modal.initial && modal.editId) {
      setMeta({
        number: modal.initial.group_number || "",
        year: modal.initial.year?.toString() || new Date().getFullYear().toString(),
        quarter: modal.initial.quarter || "I улирал",
        severity: modal.initial.rating || "low",
      });
      // Хэрэв засаж байгаа бол хавсаргасан зөрчлүүдийг харуулна
      if (modal.initial._violations) {
        setRows(modal.initial._violations.map(v => ({
          id: v.id || Math.random(),
          name: v.title,
          description: v.description || "",
          department: v.department || "",
          action: v.action_plan,
          assignee: v.assignee_name,
          assigneeEmail: v.assignee_email || "",
          managerName: v.manager_name || "",
          executionResponse: v.execution_response || "",
          dueDate: v.due_date ? v.due_date.split('T')[0] : ""
        })));
      }
    } else {
      // Шинээр нэмэх үед хоосон мөр
      setRows([EMPTY_ROW()]);
    }
  }, [modal.initial, modal.editId]);

  // 2. Туслах функцүүд
  const setM = (k, v) => setMeta(p => ({ ...p, [k]: v }));
  const addRow = () => setRows(p => [...p, EMPTY_ROW()]);
  const delRow = (id) => {
    if (rows.length <= 1) return;
    setRows(p => p.filter(r => r.id !== id));
  };
  const updateRow = (id, k, v) => setRows(p => p.map(r => r.id === id ? { ...r, [k]: v } : r));

  // Excel импорт хийх функц
  const handleExcelUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('group_number', meta.number);
    formData.append('year', meta.year);
    formData.append('quarter', meta.quarter);
    formData.append('rating', meta.severity);

    try {
      const res = await api.post('/violations/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Controller-оос ирсэн датаг Map хийх
      const importedRows = res.data.violations.map(v => ({
        id: Math.random(),
        name: v.title || v.name || "",
        description: v.description || "",
        department: v.department || "",
        action: v.action_plan || v.action || "",
        assignee: v.assignee_name || v.assignee || "",
        assigneeEmail: v.assignee_email || "",
        managerName: v.manager_name || "",
        executionResponse: v.execution_response || "",
        dueDate: v.due_date ? v.due_date.split('T')[0] : ""
      }));

      setRows(importedRows);
      setImportName(file.name);
      toast.success("Excel файлыг амжилттай уншлаа ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || "Excel уншихад алдаа гарлаа.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalSave = () => {
    onSave({ ...meta, rows }); // Dashboard-ийн saveV функц руу дамжуулна
  };

  const inp = {
    width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0",
    borderRadius: 8, fontSize: 13, background: "#fafafa", outline: "none",
    color: "#222", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 1200, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "0.5px solid #eee" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>{modal.title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }}>✕</button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* 1. Мета мэдээлэл */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>Дугаар</label>
              <input style={inp} placeholder="ЗД-2026-001" value={meta.number} onChange={e => setM("number", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>Жил</label>
              <select style={inp} value={meta.year} onChange={e => setM("year", e.target.value)}>
                {["2026", "2025", "2024", "2023"].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>Улирал</label>
              <select style={inp} value={meta.quarter} onChange={e => setM("quarter", e.target.value)}>
                {["I улирал", "II улирал", "III улирал", "IV улирал"].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>Үнэлгээ</label>
              <select style={inp} value={meta.severity} onChange={e => setM("severity", e.target.value)}>
                {Object.entries(SEV_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5 }}>Төлөв</label>
              <select style={inp} value={meta.status} onChange={e => setM("status", e.target.value)}>
                {Object.entries(STAT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          {/* 2. Зөрчлийн мөрүүд */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 110px 120px 130px 110px 120px 110px 30px", gap: 8, marginBottom: 8 }}>
              {["#", "Зөрчлийн нэр", "Тайлбар", "Хэлтэс", "Арга хэмжээ", "Хариуцагч", "И-мэйл", "Менежер", "Дуусах", ""].map(h => (
                <span key={h} style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {rows.map((row, i) => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 110px 120px 130px 110px 120px 110px 30px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#ccc" }}>{i + 1}</span>
                <input style={inp} placeholder="Нэр..." value={row.name} onChange={e => updateRow(row.id, "name", e.target.value)} />
                <input style={inp} placeholder="Тайлбар..." value={row.description} onChange={e => updateRow(row.id, "description", e.target.value)} />
                <input style={inp} placeholder="Хэлтэс..." value={row.department} onChange={e => updateRow(row.id, "department", e.target.value)} />
                <input style={inp} placeholder="Төлөвлөгөө..." value={row.action} onChange={e => updateRow(row.id, "action", e.target.value)} />
                <input style={inp} placeholder="Хариуцагч..." value={row.assignee} onChange={e => updateRow(row.id, "assignee", e.target.value)} />
                <input style={inp} placeholder="И-мэйл..." value={row.assigneeEmail} onChange={e => updateRow(row.id, "assigneeEmail", e.target.value)} />
                <input style={inp} placeholder="Менежер..." value={row.managerName} onChange={e => updateRow(row.id, "managerName", e.target.value)} />
                <input style={inp} type="date" value={row.dueDate} onChange={e => updateRow(row.id, "dueDate", e.target.value)} />
                <button onClick={() => delRow(row.id)} style={{ border: "none", background: "none", color: "#e74c3c", cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button onClick={addRow} style={{ width: "100%", padding: 8, border: "1px dashed #3498db", borderRadius: 8, color: "#3498db", background: "#f7fbff", cursor: "pointer", fontSize: 12 }}>
              + Шинэ мөр нэмэх
            </button>
          </div>

          {/* 3. Excel Импорт */}
          <label style={{
            display: "block", border: "1px dashed #d0d0d0", borderRadius: 12,
            padding: "20px", textAlign: "center", cursor: "pointer", background: "#fafafa"
          }}>
            <div style={{ fontSize: 20 }}>{isUploading ? "⏳" : "📁"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{isUploading ? "Уншиж байна..." : "Excel файл импортлох"}</div>
            {importName && <div style={{ fontSize: 11, color: "#2ecc71", marginTop: 4 }}>✓ {importName}</div>}
            <input type="file" accept=".xlsx, .xls" style={{ display: "none" }} onChange={e => handleExcelUpload(e.target.files[0])} />
          </label>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 28px", borderTop: "0.5px solid #eee" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Болих</button>
          <button onClick={handleFinalSave} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: "#3498db", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Хадгалах</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SIDEBAR NAV ITEM
// ════════════════════════════════════════════════════════
const NavItem = ({ icon, label, badge, active, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "11px 18px", cursor: "pointer", borderRadius: 10, margin: "2px 10px",
    background: active ? "rgba(52,152,219,0.18)" : "transparent",
    color: active ? "#74c0f7" : "#a0aec0",
    fontWeight: active ? 600 : 400, fontSize: 14,
  }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge != null && (
      <span style={{
        background: "#e74c3c", color: "#fff",
        fontSize: 10, padding: "2px 6px", borderRadius: 10, fontWeight: 600,
      }}>{badge}</span>
    )}
  </div>
);

// ════════════════════════════════════════════════════════
// EDIT VIOLATION MODAL — зөрчил засах тусдаа modal
// ════════════════════════════════════════════════════════
function EditViolationModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    department: item.department || "",
    severity: item.severity || "low",
    status: item.status || "new",
    action: item.action_plan || item.action || "",
    assignee: item.assignee_name || item.assignee || "",
    assigneeEmail: item.assignee_email || item.assigneeEmail || "",
    managerName: item.manager_name || item.managerName || "",
    executionResponse: item.execution_response || item.executionResponse || "",
    dueDate: item.due_date ? item.due_date.split("T")[0] : (item.dueDate || ""),
    type: item.type || "",
    date: item.date || "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inp = {
    width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0",
    borderRadius: 8, fontSize: 13, background: "#fafafa", outline: "none",
    color: "#222", boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 12, color: "#666", display: "block", marginBottom: 5, fontWeight: 500 };
  const fieldWrap = { marginBottom: 16 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #f0f0f0", background: "#f8f9fb", borderRadius: "16px 16px 0 0" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>✏️ Зөрчил засах</h3>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{item.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Үндсэн мэдээлэл */}
          <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "16px", marginBottom: 20, border: "1px solid #eee" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Үндсэн мэдээлэл</div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Зөрчлийн нэр</label>
              <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Зөрчлийн нэр..." />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Тайлбар</label>
              <textarea style={{ ...inp, resize: "vertical", minHeight: 70 }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Дэлгэрэнгүй тайлбар..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Хэлтэс</label>
                <input style={inp} value={form.department} onChange={e => set("department", e.target.value)} placeholder="Хэлтэс..." />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Төрөл</label>
                <input style={inp} value={form.type} onChange={e => set("type", e.target.value)} placeholder="Төрөл..." />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Түвшин</label>
                <select style={inp} value={form.severity} onChange={e => set("severity", e.target.value)}>
                  {Object.entries(SEV_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Төлөв</label>
                <select style={inp} value={form.status} onChange={e => set("status", e.target.value)}>
                  {Object.entries(STAT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Хариуцагчийн мэдээлэл */}
          <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "16px", marginBottom: 20, border: "1px solid #eee" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Хариуцагчийн мэдээлэл</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Хариуцагч</label>
                <input style={inp} value={form.assignee} onChange={e => set("assignee", e.target.value)} placeholder="Хариуцагчийн нэр..." />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>И-мэйл</label>
                <input style={inp} type="email" value={form.assigneeEmail} onChange={e => set("assigneeEmail", e.target.value)} placeholder="email@example.com" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Менежер</label>
                <input style={inp} value={form.managerName} onChange={e => set("managerName", e.target.value)} placeholder="Менежерийн нэр..." />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Дуусах огноо</label>
                <input style={inp} type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Арга хэмжээ */}
          <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "16px", border: "1px solid #eee" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Арга хэмжээ & Гүйцэтгэл</div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Арга хэмжээний төлөвлөгөө</label>
              <textarea style={{ ...inp, resize: "vertical", minHeight: 70 }} value={form.action} onChange={e => set("action", e.target.value)} placeholder="Авах арга хэмжээ..." />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Гүйцэтгэлийн хариу</label>
              <textarea style={{ ...inp, resize: "vertical", minHeight: 70 }} value={form.executionResponse} onChange={e => set("executionResponse", e.target.value)} placeholder="Гүйцэтгэлийн тайлан..." />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 28px", borderTop: "1px solid #f0f0f0", background: "#fafafa", borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, color: "#555" }}>
            Болих
          </button>
          <button onClick={() => onSave(form)} style={{ padding: "9px 26px", borderRadius: 8, border: "none", background: "#3498db", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            ✓ Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ҮНДСЭН DASHBOARD
// ════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "Admin";

  // URL-аас табын нэрийг авах функц
  const getTabFromUrl = (pathname) => {
    const path = pathname.split("/").filter(Boolean).pop();
    return ["violations", "email", "users"].includes(path) ? path : "dashboard";
  };

  const [tab, setTab] = useState(() => getTabFromUrl(location.pathname));

  // URL өөрчлөгдөх бүрт tab state-ийг шинэчлэх (Refresh хийхэд хэрэгтэй)
  useEffect(() => {
    setTab(getTabFromUrl(location.pathname));
  }, [location.pathname]);

  const [data, setData] = useState(SEED.map(x => ({ ...x })));
  const [violationCount, setViolationCount] = useState(0);
  const [modal, setModal] = useState({ open: false, title: "", initial: {}, editId: null });
  const [editModal, setEditModal] = useState({ open: false, item: null });

  // Sidebar badge-д зориулж нийт зөрчлийн тоог backend-с авах
  useEffect(() => {
    api.get("/violations?page=1&limit=1")
      .then(res => setViolationCount(res.data.totalItems ?? 0))
      .catch(() => {});
  }, []);
  const saveV = async (formData) => {
    // 1. Validation: Хоосон утга илгээхээс сэргийлэх
    if (!formData.number?.trim()) {
      toast.warning("Дугаар оруулна уу.");
      return;
    }

    // Зөвхөн нэр нь бөглөгдсөн зөрчлийн мөрүүдийг шүүж авах
    const filledRows = (formData.rows || []).filter(r => r.name?.trim());

    if (!filledRows.length) {
      toast.warning("Дор хаяж нэг зөрчлийн нэрийг бөглөнө үү.");
      return;
    }

    // 2. Data Transformation: Backend-ийн controller-т очих талбарын нэршил
    const payload = {
      group_number: formData.number,
      year: parseInt(formData.year),
      quarter: formData.quarter,
      rating: formData.severity,
      status: formData.status || "new",
      violations: filledRows.map(r => ({
        title: r.name,
        description: r.description || null,
        department: r.department || null,
        action_plan: r.action,
        assignee_name: r.assignee,
        assignee_email: r.assigneeEmail || null,
        manager_name: r.managerName || null,
        execution_response: r.executionResponse || null,
        due_date: r.dueDate || null,
        status: formData.status || "new",
      }))
    };

    try {
      let response;
      if (modal.editId) {
        response = await api.put(`/violations/${modal.editId}/status`, {
          status: formData.status || 'new'
        });
        setData(prev => prev.map(x =>
          x.id === modal.editId ? { ...x, ...payload, id: x.id } : x
        ));
        toast.success("Амжилттай шинэчлэгдлээ ✓");
      } else {
        // ── ШИНЭЭР ҮҮСГЭХ ЛОГИК ──
        response = await api.post('/violations', payload);

        const newGroupId = response.data.groupId || Date.now();

        setData(prev => [{
          id: newGroupId,
          name: payload.violations[0].title,
          type: "Зөрчил",
          severity: payload.rating,
          date: new Date().toISOString().split('T')[0],
          status: payload.status,
          ...payload
        }, ...prev]);

        toast.success("Зөрчил амжилттай бүртгэгдлээ ✓");
        setViolationCount(prev => prev + filledRows.length);
      }

      // Амжилттай болсон бол Modal-ыг хаах
      setModal({ ...modal, open: false });

    } catch (err) {
      // Axios Interceptor-оор ирэх алдааны мессеж
      const errorMsg = err.response?.data?.message || "Хадгалахад алдаа гарлаа.";
      toast.error(errorMsg);
      console.error("Save Error:", err);
    }
  };
  const delV = async (id) => {
    if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
    try {
      await api.delete(`/violations/${id}`);
      setData(prev => prev.filter(x => x.id !== id));
      setViolationCount(prev => Math.max(0, prev - 1));
      toast.info("Устгагдлаа");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Устгахад алдаа гарлаа.');
    }
  };

  const editV = async (item) => {
    try {
      // Backend-аас бүрэн мэдээллийг татаж авах
      const res = await api.get(`/violations/${item.id}`);
      const full = res.data;
      setEditModal({
        open: true,
        item: {
          id: item.id,
          name: full.title || item.name || "",
          description: full.description || "",
          department: full.department || "",
          severity: full.severity || item.severity || "low",
          status: full.status || item.status || "new",
          action: full.action_plan || "",
          assignee: full.assignee_name || "",
          assigneeEmail: full.assignee_email || "",
          managerName: full.manager_name || "",
          executionResponse: full.execution_response || "",
          dueDate: full.due_date ? full.due_date.split("T")[0] : "",
          type: full.type || item.type || "",
          date: item.date || "",
        }
      });
    } catch (err) {
      // Backend GET /violations/:id байхгүй бол local state-ийн өгөгдлийг ашиглах
      setEditModal({
        open: true,
        item: {
          id: item.id,
          name: item.name || item.title || "",
          description: item.description || "",
          department: item.department || "",
          severity: item.severity || "low",
          status: item.status || "new",
          action: item.action_plan || item.action || "",
          assignee: item.assignee_name || item.assignee || "",
          assigneeEmail: item.assignee_email || item.assigneeEmail || "",
          managerName: item.manager_name || item.managerName || "",
          executionResponse: item.execution_response || item.executionResponse || "",
          dueDate: item.due_date ? item.due_date.split("T")[0] : (item.dueDate || ""),
          type: item.type || "",
          date: item.date || "",
        }
      });
    }
  };

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#666" }}>
      Уншиж байна...
    </div>
  );

  const nowDate = new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });
  const TABS = { dashboard: "Ерөнхий тойм", violations: "Бүх зөрчил", email: "Имэйл", users: "Хэрэглэгчид" };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      position: "fixed", top: 0, left: 0, background: "#f0f2f8",
    }}>

      {/* ══════════ SIDEBAR ══════════ */}
      <div style={{
        width: 235, minWidth: 235, background: "#1a2035",
        display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto",
      }}>
        {/* Brand */}
        <div style={{
          padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#3498db",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
          }}>📋</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Хяналтын</div>
            <div style={{ color: "#74c0f7", fontSize: 11 }}>Систем</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: "14px 0 10px" }}>
          <div style={{ padding: "4px 20px 8px", fontSize: 10, color: "#4a5568", letterSpacing: "0.08em", textTransform: "uppercase" }}>Үндсэн</div>
          <NavItem icon="📊" label="Тайлан" active={tab === "dashboard"} onClick={() => navigate("/dashboard")} />
          <NavItem icon="⚠️" label="Бүх зөрчил" active={tab === "violations"} onClick={() => navigate("/dashboard/violations")} badge={violationCount} />
        </div>

        <div style={{ padding: "10px 0" }}>
          <div style={{ padding: "4px 20px 8px", fontSize: 10, color: "#4a5568", letterSpacing: "0.08em", textTransform: "uppercase" }}>Систем</div>
          <NavItem icon="✉️" label="Имэйл" active={tab === "email"} onClick={() => navigate("/dashboard/email")} />
        </div>

        {/* Admin-only section */}
        {isAdmin && (
          <div style={{ padding: "10px 0" }}>
            <div style={{ padding: "4px 20px 8px", fontSize: 10, color: "#4a5568", letterSpacing: "0.08em", textTransform: "uppercase" }}>Админ</div>
            <NavItem icon="👥" label="Хэрэглэгчид" active={tab === "users"} onClick={() => navigate("/dashboard/users")} />
          </div>
        )}

        {/* User + Logout */}
        <div style={{ marginTop: "auto", padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", marginBottom: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: isAdmin ? "#f39c12" : "#3498db",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>{user?.username?.charAt(0).toUpperCase()}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.username}</div>
              <div style={{ color: isAdmin ? "#f39c12" : "#718096", fontSize: 11 }}>
                {isAdmin ? "⭐ Админ" : user?.role}
              </div>
            </div>
          </div>
          <div onClick={signOut} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "9px", cursor: "pointer", color: "#fc8181",
            border: "1px solid rgba(252,129,129,0.3)", borderRadius: 10, fontSize: 13,
          }}>
            🚪 Гарах
          </div>
        </div>
      </div>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOPBAR */}
        <div style={{
          height: 58, background: "#fff", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 28px",
          borderBottom: "0.5px solid #e8ecf0",
        }}>
          <div style={{ fontSize: 14 }}>
            <span style={{ color: "#aaa" }}>Нүүр / </span>
            <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{TABS[tab]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#aaa" }}>{nowDate}</div>
            {isAdmin && (
              <div style={{
                background: "#fef3cd", borderRadius: 20, padding: "5px 12px",
                fontSize: 11, color: "#856404", display: "flex", alignItems: "center", gap: 5,
                border: "1px solid #ffc107",
              }}>
                ⭐ Админ
              </div>
            )}
            <div style={{
              background: "#f0f2f8", borderRadius: 20, padding: "5px 14px",
              fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
              Онлайн
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* ── DASHBOARD TAB ── */}
          {tab === "dashboard" && <DashboardPage data={data} />}

          {/* ── VIOLATIONS TAB ── */}
          {tab === "violations" && (
            <ViolationsPage
              data={data}
              onAdd={(modalState) => setModal(modalState)}
              onEdit={editV}
              onDelete={delV}
            />
          )}

          {/* ── EMAIL TAB ── */}
          {tab === "email" && <EmailPage />}

          {/* ── ADMIN USERS TAB ── */}
          {tab === "users" && isAdmin && <AdminUsers />}

          {/* Guard */}
          {tab === "users" && !isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
              <div style={{ fontSize: 48 }}>🔒</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#555" }}>Хандах эрх байхгүй</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>Энэ хуудас зөвхөн Админд зориулагдсан</div>
              <button onClick={() => setTab("dashboard")} style={{
                marginTop: 8, padding: "8px 20px", background: "#3498db", color: "#fff",
                border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
              }}>Буцах</button>
            </div>
          )}

        </div>
      </div>

      {/* MODAL */}
      {modal.open && (
        <ViolationModal
          modal={modal}
          onClose={() => setModal({ ...modal, open: false })}
          onSave={saveV}
        />
      )}

      {/* EDIT MODAL */}
      {editModal.open && editModal.item && (
        <EditViolationModal
          item={editModal.item}
          onClose={() => setEditModal({ open: false, item: null })}
          onSave={async (updated) => {
            try {
              const payload = {
                title: updated.name,
                description: updated.description || null,
                department: updated.department || null,
                severity: updated.severity,
                status: updated.status,
                action_plan: updated.action || null,
                assignee_name: updated.assignee || null,
                assignee_email: updated.assigneeEmail || null,
                manager_name: updated.managerName || null,
                execution_response: updated.executionResponse || null,
                due_date: updated.dueDate || null,
              };

              // PUT /violations/:id — бүх талбарыг шинэчлэх
              await api.put(`/violations/${updated.id}`, payload);

              setData(prev => prev.map(x =>
                x.id === updated.id
                  ? {
                      ...x,
                      name: updated.name,
                      severity: updated.severity,
                      status: updated.status,
                      type: updated.type || x.type,
                      description: updated.description,
                      department: updated.department,
                      action_plan: updated.action,
                      assignee_name: updated.assignee,
                      assignee_email: updated.assigneeEmail,
                      manager_name: updated.managerName,
                      execution_response: updated.executionResponse,
                      due_date: updated.dueDate,
                    }
                  : x
              ));
              toast.success("Амжилттай шинэчлэгдлээ ✓");
              setEditModal({ open: false, item: null });
            } catch (err) {
              const status = err.response?.status;
              // 404 бол route байхгүй гэсэн үг — backend-д PUT /violations/:id нэмэх хэрэгтэй
              if (status === 404) {
                toast.error("Backend: PUT /violations/:id route олдсонгүй. Backend-д энэ route-ыг нэмнэ үү.");
              } else {
                toast.error(err.response?.data?.message || "Шинэчлэхэд алдаа гарлаа.");
              }
            }
          }}
        />
      )}
    </div>
  );
}