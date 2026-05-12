import { useState, useEffect, useRef } from "react";
import { Badge } from "../Dashboard";
import { SEV_MAP, STAT_MAP } from "../Dashboard";
import api from "../../api/axios";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

// ── Backend response-г normalize хийх ──────────────────────
// Ямар ч бүтэцтэй response ирсэн ч зөв array буцаана
function normalizeResponse(body) {
  // Console-д response-г харуулна — debug хийхэд хэрэгтэй
  console.log("📦 API response:", body);

  // 1. body өөрөө array бол шууд ашиглана
  //    [{ id, title, ... }, ...]
  if (Array.isArray(body)) {
    return { rows: flattenItems(body), total: body.length, totalPages: 1 };
  }

  // 2. body.data array бол
  //    { data: [...], totalItems: N, totalPages: N }
  if (Array.isArray(body?.data)) {
    const rows = flattenItems(body.data);
    const total = body.totalItems ?? body.total ?? body.count ?? rows.length;
    const totalPages = body.totalPages ?? body.pages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
    return { rows, total, totalPages };
  }

  // 3. body.violations array бол
  //    { violations: [...], total: N }
  if (Array.isArray(body?.violations)) {
    const rows = flattenItems(body.violations);
    const total = body.total ?? body.totalItems ?? rows.length;
    const totalPages = body.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
    return { rows, total, totalPages };
  }

  // 4. body.items array бол
  if (Array.isArray(body?.items)) {
    const rows = flattenItems(body.items);
    const total = body.total ?? body.totalItems ?? rows.length;
    const totalPages = body.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
    return { rows, total, totalPages };
  }

  // 5. Танихгүй бүтэц — хоосон
  console.warn("⚠️ Танихгүй response бүтэц:", body);
  return { rows: [], total: 0, totalPages: 1 };
}

// Group эсвэл violation item-г нэгдсэн row болгох
function flattenItems(items) {
  return items.flatMap(item => {
    // Group бүтэц: { id, group_number, violations: [...] }
    if (Array.isArray(item.violations) && item.violations.length > 0) {
      return item.violations.map(v => mapViolation(v, item));
    }
    // Хоосон violations array бүхий group
    if (Array.isArray(item.violations) && item.violations.length === 0) {
      return [mapGroup(item)];
    }
    // Шууд violation object
    return [mapViolation(item, null)];
  });
}

function mapViolation(v, group) {
  return {
    id: v.id ?? v._id,
    groupId: group?.id ?? group?._id ?? null,
    name: v.title ?? v.name ?? "—",
    type: v.type ?? group?.type ?? v.department ?? "",
    severity: v.severity ?? group?.rating ?? "low",
    status: v.status ?? group?.status ?? "new",
    date: parseDate(v.createdAt ?? v.created_at ?? group?.createdAt ?? group?.created_at),
    description: v.description ?? "",
    department: v.department ?? "",
    action_plan: v.action_plan ?? "",
    assignee_name: v.assignee_name ?? "",
    assignee_email: v.assignee_email ?? "",
    manager_name: v.manager_name ?? "",
    execution_response: v.execution_response ?? "",
    due_date: v.due_date ?? "",
  };
}

function mapGroup(group) {
  return {
    id: group.id ?? group._id,
    groupId: group.id ?? group._id,
    name: group.group_number ?? group.name ?? `Бүлэг #${group.id ?? group._id}`,
    type: group.type ?? "",
    severity: group.rating ?? group.severity ?? "low",
    status: group.status ?? "new",
    date: parseDate(group.createdAt ?? group.created_at),
  };
}

function parseDate(val) {
  if (!val) return "";
  return typeof val === "string" ? val.split("T")[0] : "";
}
// ───────────────────────────────────────────────────────────

// ── Detail Modal ────────────────────────────────────────────
function ViewModal({ item, onClose }) {
  const fields = [
    { label: "Нэр", val: item.name },
    { label: "Хэлтэс", val: item.type || item.department },
    { label: "Тайлбар", val: item.description },
    { label: "Арга хэмжээ", val: item.action_plan },
    { label: "Хариуцагч", val: item.assignee_name },
    { label: "И-мэйл", val: item.assignee_email },
    { label: "Менежер", val: item.manager_name },
    { label: "Гүйцэтгэлийн хариу", val: item.execution_response },
    { label: "Дуусах огноо", val: item.due_date ? item.due_date.split("T")[0] : "" },
    { label: "Огноо", val: item.date },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: 560,
        maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
          background: "#f8f9fb", borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Зөрчлийн дэлгэрэнгүй
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3 }}>
              {item.name}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", color: "#aaa", lineHeight: 1, flexShrink: 0,
          }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <Badge map={SEV_MAP} val={item.severity} />
            <Badge map={STAT_MAP} val={item.status} />
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {fields.map(({ label, val }) =>
              val ? (
                <div key={label} style={{
                  display: "grid", gridTemplateColumns: "130px 1fr",
                  gap: 12, alignItems: "flex-start",
                  padding: "10px 14px", background: "#f8f9fb",
                  borderRadius: 8, border: "1px solid #f0f0f0",
                }}>
                  <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#222", wordBreak: "break-word" }}>{val}</span>
                </div>
              ) : null
            )}
          </div>
        </div>

        <div style={{
          padding: "14px 24px", borderTop: "1px solid #f0f0f0",
          display: "flex", justifyContent: "flex-end",
          background: "#fafafa", borderRadius: "0 0 16px 16px",
        }}>
          <button onClick={onClose} style={{
            padding: "9px 24px", borderRadius: 8, border: "1px solid #ddd",
            background: "#fff", cursor: "pointer", fontSize: 13, color: "#555",
          }}>
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────

export default function ViolationsPage({ onAdd, onEdit, onDelete, refreshKey }) {
  const [search, setSearch] = useState("");
  const [fSev, setFSev] = useState("");
  const [fStat, setFStat] = useState("");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", PAGE_SIZE);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (fSev) params.set("severity", fSev);
        if (fStat) params.set("status", fStat);

        const res = await api.get(`/violations?${params.toString()}`);
        if (cancelled) return;

        const { rows, total: t, totalPages: tp } = normalizeResponse(res.data);
        setData(rows);
        setTotal(t);
        setTotalPages(tp);
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status !== 401 && status !== 403) {
          toast.error(err?.response?.data?.message || "Сервертэй холбогдоход алдаа гарлаа.");
        }
        setData([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, fSev, fStat, refreshKey]);

  const handleDelete = async (id) => {
    if (window.confirm("Та энэ зөрчлийг устгахдаа итгэлтэй байна уу?")) {
      try {
        // onDelete нь Dashboard-аас ирж буй функц
        await onDelete(id);
        // Амжилтыг Dashboard доторх fetch trigger эсвэл энд toast-оор харуулж болно
      } catch (err) {
        console.error("Устгахад алдаа гарлаа:", err);
      }
    }
  };

  const handleFilter = (setter, val) => { setter(val); setPage(1); };

  const inp = {
    padding: "8px 14px", border: "1px solid #e0e0e0", borderRadius: 8,
    fontSize: 14, background: "#fafafa", color: "#555", outline: "none",
  };

  const pageBtn = (n, label, disabled, active) => (
    <button
      key={label ?? n}
      onClick={() => !disabled && setPage(n)}
      disabled={disabled}
      style={{
        minWidth: 34, height: 34, padding: "0 10px",
        border: active ? "none" : "1px solid #e0e0e0",
        borderRadius: 8, fontSize: 13, cursor: disabled ? "default" : "pointer",
        background: active ? "#3498db" : disabled ? "#f5f5f5" : "#fff",
        color: active ? "#fff" : disabled ? "#ccc" : "#555",
        fontWeight: active ? 700 : 400,
      }}
    >
      {label ?? n}
    </button>
  );

  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          Зөрчлийн жагсаалт
        </h2>
        <button
          onClick={() =>
            onAdd({
              open: true,
              title: "Шинэ зөрчил нэмэх",
              initial: {
                name: "", type: "", severity: "low",
                date: new Date().toISOString().split("T")[0], status: "new",
              },
              editId: null,
            })
          }
          style={{
            background: "#3498db", color: "#fff", border: "none",
            padding: "9px 18px", borderRadius: 9, cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}
        >
          + Зөрчил нэмэх
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "14px 18px",
        border: "0.5px solid #eee", marginBottom: 16,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          type="text"
          placeholder="🔍  Хайх..."
          style={{ ...inp, flex: 1, minWidth: 180 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={fSev} onChange={e => handleFilter(setFSev, e.target.value)} style={inp}>
          <option value="">Бүх түвшин</option>
          {Object.entries(SEV_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fStat} onChange={e => handleFilter(setFStat, e.target.value)} style={inp}>
          <option value="">Бүх төлөв</option>
          {Object.entries(STAT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(search || fSev || fStat) && (
          <button
            onClick={() => { setSearch(""); handleFilter(setFSev, ""); handleFilter(setFStat, ""); }}
            style={{
              padding: "8px 14px", border: "1px solid #eee", borderRadius: 8,
              fontSize: 13, cursor: "pointer", background: "#fff", color: "#888",
            }}
          >
            Цэвэрлэх ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #eee", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fb" }}>
              {["Нэр", "Хэлтэс", "Түвшин", "Төлөв", "Огноо", "Үйлдэл"].map(h => (
                <th key={h} style={{
                  padding: "13px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 600, color: "#888",
                  borderBottom: "1px solid #f0f0f0",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>
                  {" "}Уншиж байна...
                </td>
              </tr>
            ) : data.length > 0 ? data.map((x, i) => (
              <tr
                key={x.id ?? x._id ?? i}
                style={{ borderBottom: "0.5px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
              >
                <td style={{ padding: "13px 16px", fontSize: 14, color: "#222", fontWeight: 500 }}>
                  {x.name}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ background: "#eef2f8", color: "#555", fontSize: 12, padding: "3px 9px", borderRadius: 6 }}>
                    {x.type || "—"}
                  </span>
                </td>
                <td style={{ padding: "13px 16px" }}><Badge map={SEV_MAP} val={x.severity} /></td>
                <td style={{ padding: "13px 16px" }}><Badge map={STAT_MAP} val={x.status} /></td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#888" }}>
                  {x.date || "—"}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setViewItem(x)}
                      style={{
                        padding: "5px 12px", border: "1px solid #d5e8d4", borderRadius: 7,
                        background: "#e8f5e9", color: "#1b5e20", fontSize: 12, cursor: "pointer",
                      }}
                    >
                      👁 Харах
                    </button>
                    <button
                      onClick={() => onEdit(x)}
                      style={{
                        padding: "5px 12px", border: "1px solid #d0e4f7", borderRadius: 7,
                        background: "#eaf4fd", color: "#1a5276", fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => handleDelete(x.groupId || x.id)} // x.groupId байгаа эсэхийг шалгах
                      style={{
                        padding: "5px 12px", border: "1px solid #f5c6c6", borderRadius: 7,
                        background: "#fdecea", color: "#a32d2d", fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Устгах
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                  Зөрчил олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          padding: "12px 16px", borderTop: "0.5px solid #f0f0f0",
          fontSize: 12, color: "#aaa",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10,
        }}>
          <span>
            Нийт: <b style={{ color: "#555" }}>{total}</b> зөрчил
            {total > 0 && (
              <span style={{ marginLeft: 6, color: "#bbb" }}>— {startIdx}–{endIdx} харагдаж байна</span>
            )}
          </span>
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {pageBtn(page - 1, "‹", page === 1, false)}
              {pageNumbers().map((n, idx) =>
                n === "..."
                  ? <span key={`e${idx}`} style={{ padding: "0 4px", color: "#bbb", fontSize: 13 }}>…</span>
                  : pageBtn(n, null, false, n === page)
              )}
              {pageBtn(page + 1, "›", page === totalPages, false)}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {viewItem && <ViewModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}