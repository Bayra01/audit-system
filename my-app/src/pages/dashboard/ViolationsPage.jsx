import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "../Dashboard";
import { SEV_MAP, STAT_MAP } from "../Dashboard";
import api from "../../api/axios";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function ViolationsPage({ onAdd, onEdit, onDelete }) {
  const [search, setSearch]     = useState("");
  const [fSev, setFSev]         = useState("");
  const [fStat, setFStat]       = useState("");
  const [page, setPage]         = useState(1);

  const [data, setData]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);

  // Debounce search so we don't hammer the API on every keystroke
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

  // Fetch from backend whenever query params change
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page",  page);
      params.set("limit", PAGE_SIZE);
      if (debouncedSearch) params.set("search",   debouncedSearch);
      if (fSev)            params.set("severity",  fSev);
      if (fStat)           params.set("status",    fStat);

      // Backend returns:
      // { success, totalItems, totalPages, currentPage, data: [ViolationGroup...] }
      const res = await api.get(`/violations?${params.toString()}`);
      const body = res.data;

      // Flatten ViolationGroup rows → дотоод violations массивыг задлах
      // Хэрэв group бүр дотроо violations[] байвал тэднийг жагсаанд харуулна.
      // Хэрэв violations байхгүй бол group-г шууд ашиглана.
      const rows = (body.data ?? []).flatMap(group => {
        const viols = group.violations;
        if (Array.isArray(viols) && viols.length > 0) {
          return viols.map(v => ({
            id:       v.id,
            groupId:  group.id,
            name:     v.title ?? v.name,
            type:     v.type ?? v.description ?? group.type ?? group.description ?? "",
            severity: v.severity ?? group.rating ?? "low",
            status:   v.status  ?? group.status  ?? "new",
            date:     v.createdAt ? v.createdAt.split("T")[0]
                    : group.createdAt ? group.createdAt.split("T")[0] : "",
            // дэлгэрэнгүй засах үед хэрэгтэй нэмэлт талбарууд
            description:       v.description       ?? "",
            department:        v.department        ?? "",
            action_plan:       v.action_plan       ?? "",
            assignee_name:     v.assignee_name     ?? "",
            assignee_email:    v.assignee_email    ?? "",
            manager_name:      v.manager_name      ?? "",
            execution_response:v.execution_response?? "",
            due_date:          v.due_date          ?? "",
          }));
        }
        // violations хоосон үед group-г шууд ашиглах
        return [{
          id:       group.id,
          groupId:  group.id,
          name:     group.group_number ?? `Бүлэг #${group.id}`,
          type:     group.type ?? group.description ?? "",
          severity: group.rating   ?? "low",
          status:   group.status   ?? "new",
          date:     group.createdAt ? group.createdAt.split("T")[0] : "",
        }];
      });

      setData(rows);
      setTotal(body.totalItems ?? rows.length);
      setTotalPages(body.totalPages ?? Math.max(1, Math.ceil((body.totalItems ?? rows.length) / PAGE_SIZE)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Өгөгдөл татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, fSev, fStat]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Устгасны дараа хуудас тохируулж дахин татах
  const handleDelete = async (id) => {
    await onDelete(id);
    const newTotal = total - 1;
    const maxPage  = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    const nextPage = Math.min(page, maxPage);
    if (nextPage !== page) setPage(nextPage);
    else fetchData();
  };

  // ─── derived ────────────────────────────────────────────
  // totalPages нь backend-с шууд ирнэ → дээр зарлагдсан state ашиглана

  const handleFilter = (setter, val) => {
    setter(val);
    setPage(1);
  };

  // ─── styles ─────────────────────────────────────────────
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
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx   = Math.min(page * PAGE_SIZE, total);

  // ─── render ─────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          Зөрчлийн жагсаалт
        </h2>
        <button
          onClick={() => onAdd({
            open: true,
            title: "Шинэ зөрчил нэмэх",
            initial: { name: "", type: "", severity: "low", date: new Date().toISOString().split("T")[0], status: "new" },
            editId: null,
          })}
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
          {Object.entries(SEV_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={fStat} onChange={e => handleFilter(setFStat, e.target.value)} style={inp}>
          <option value="">Бүх төлөв</option>
          {Object.entries(STAT_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        {(search || fSev || fStat) && (
          <button
            onClick={() => { setSearch(""); handleFilter(setFSev, ""); handleFilter(setFStat, ""); }}
            style={{ padding: "8px 14px", border: "1px solid #eee", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#fff", color: "#888" }}
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
              {["Нэр", "Төрөл", "Түвшин", "Төлөв", "Огноо", "Үйлдэл"].map(h => (
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
                key={x.id ?? x._id}
                style={{ borderBottom: "0.5px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
              >
                <td style={{ padding: "13px 16px", fontSize: 14, color: "#222", fontWeight: 500 }}>
                  {x.name ?? x.title}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ background: "#eef2f8", color: "#555", fontSize: 12, padding: "3px 9px", borderRadius: 6 }}>
                    {x.type}
                  </span>
                </td>
                <td style={{ padding: "13px 16px" }}><Badge map={SEV_MAP} val={x.severity} /></td>
                <td style={{ padding: "13px 16px" }}><Badge map={STAT_MAP} val={x.status} /></td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#888" }}>{x.date ?? (x.created_at ? x.created_at.split("T")[0] : "")}</td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => onEdit(x)}
                      style={{ padding: "5px 12px", border: "1px solid #d0e4f7", borderRadius: 7, background: "#eaf4fd", color: "#1a5276", fontSize: 12, cursor: "pointer" }}
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => handleDelete(x.id ?? x._id)}
                      style={{ padding: "5px 12px", border: "1px solid #f5c6c6", borderRadius: 7, background: "#fdecea", color: "#a32d2d", fontSize: 12, cursor: "pointer" }}
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

        {/* Footer / Pagination */}
        <div style={{
          padding: "12px 16px", borderTop: "0.5px solid #f0f0f0",
          fontSize: 12, color: "#aaa",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10,
        }}>
          <span>
            Нийт: <b style={{ color: "#555" }}>{total}</b> зөрчил
            {total > 0 && (
              <span style={{ marginLeft: 6, color: "#bbb" }}>
                — {startIdx}–{endIdx} харагдаж байна
              </span>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}