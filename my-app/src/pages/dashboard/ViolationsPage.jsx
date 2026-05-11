import { useState, useEffect, useCallback, useRef } from "react";
import { Badge, SEV_MAP, STAT_MAP } from "../Dashboard";
import api from "../../api/axios";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

// ── Excel Export (CSV fallback, no external deps) ─────────────
function exportToCSV(rows, sevMap, statMap) {
  const headers = ["Нэр","Төрөл","Түвшин","Төлөв","Огноо","Хариуцагч","И-мэйл","Хэлтэс","Дуусах огноо"];
  const escape  = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines   = [
    headers.map(escape).join(","),
    ...rows.map(x => [
      x.name, x.type,
      sevMap[x.severity]?.label  ?? x.severity,
      statMap[x.status]?.label   ?? x.status,
      x.date, x.assignee_name, x.assignee_email,
      x.department, x.due_date,
    ].map(escape).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `violations_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV файл татагдлаа ✓");
}

// ── Detail Drawer ─────────────────────────────────────────────
function DetailDrawer({ item, onClose, onEdit }) {
  if (!item) return null;

  const Field = ({ label, value, accent }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: accent || "#222", fontWeight: accent ? 600 : 400, background: "#f8f9fb", borderRadius: 8, padding: "8px 12px", minHeight: 36 }}>
        {value || <span style={{ color: "#ccc" }}>—</span>}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 900, transition: "opacity 0.2s" }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: "#fff", zIndex: 901, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column", overflowY: "auto",
        animation: "slideIn 0.22s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", background: "#f8f9fb", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>Зөрчлийн дэлгэрэнгүй</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3 }}>{item.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", padding: 0 }}>✕</button>
        </div>

        {/* Badges row */}
        <div style={{ padding: "14px 24px", display: "flex", gap: 8, borderBottom: "1px solid #f5f5f5" }}>
          <Badge map={SEV_MAP} val={item.severity} />
          <Badge map={STAT_MAP} val={item.status} />
          {item.type && (
            <span style={{ background: "#eef2f8", color: "#555", fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>{item.type}</span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", flex: 1 }}>
          <Field label="Тайлбар" value={item.description} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Хэлтэс" value={item.department} />
            <Field label="Огноо" value={item.date} />
          </div>
          <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0 16px" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Хариуцагч</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Нэр" value={item.assignee_name} />
            <Field label="И-мэйл" value={item.assignee_email} accent="#1a5276" />
          </div>
          <Field label="Менежер" value={item.manager_name} />
          <Field label="Дуусах огноо" value={item.due_date} />
          <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0 16px" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Арга хэмжээ</div>
          <Field label="Арга хэмжээний төлөвлөгөө" value={item.action_plan} />
          <Field label="Гүйцэтгэлийн хариу" value={item.execution_response} />
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 10 }}>
          <button
            onClick={() => { onEdit(item); onClose(); }}
            style={{ flex: 1, padding: "10px", background: "#3498db", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ✏️ Засах
          </button>
          <button
            onClick={onClose}
            style={{ padding: "10px 18px", background: "#f0f2f8", color: "#555", border: "none", borderRadius: 9, fontSize: 13, cursor: "pointer" }}
          >
            Хаах
          </button>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  );
}

// ── Sortable Column Header ────────────────────────────────────
function SortTh({ col, label, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        padding: "13px 16px", textAlign: "left",
        fontSize: 12, fontWeight: 600, color: active ? "#3498db" : "#888",
        borderBottom: "1px solid #f0f0f0", cursor: "pointer",
        userSelect: "none", whiteSpace: "nowrap",
      }}
    >
      {label}
      <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: 10 }}>
        {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
      </span>
    </th>
  );
}

// ─────────────────────────────────────────────────────────────
export default function ViolationsPage({ onAdd, onEdit, onDelete }) {
  const [search, setSearch]   = useState("");
  const [fSev, setFSev]       = useState("");
  const [fStat, setFStat]     = useState("");
  const [page, setPage]       = useState(1);

  const [data, setData]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);

  // ── Sort state ──
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  // ── Bulk select state ──
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── Drawer state ──
  const [drawer, setDrawer] = useState(null);

  // Debounce
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page",  page);
      params.set("limit", PAGE_SIZE);
      if (debouncedSearch) params.set("search",   debouncedSearch);
      if (fSev)            params.set("severity",  fSev);
      if (fStat)           params.set("status",    fStat);

      const res  = await api.get(`/violations?${params.toString()}`);
      const body = res.data;

      const rows = (body.data ?? []).flatMap(group => {
        const viols = group.violations;
        if (Array.isArray(viols) && viols.length > 0) {
          return viols.map(v => ({
            id:                v.id,
            groupId:           group.id,
            name:              v.title ?? v.name,
            type:              v.type ?? v.description ?? group.type ?? group.description ?? "",
            severity:          v.severity ?? group.rating ?? "low",
            status:            v.status   ?? group.status ?? "new",
            date:              v.createdAt ? v.createdAt.split("T")[0] : group.createdAt ? group.createdAt.split("T")[0] : "",
            description:       v.description        ?? "",
            department:        v.department         ?? "",
            action_plan:       v.action_plan        ?? "",
            assignee_name:     v.assignee_name      ?? "",
            assignee_email:    v.assignee_email     ?? "",
            manager_name:      v.manager_name       ?? "",
            execution_response:v.execution_response ?? "",
            due_date:          v.due_date           ?? "",
          }));
        }
        return [{
          id: group.id, groupId: group.id,
          name:     group.group_number ?? `Бүлэг #${group.id}`,
          type:     group.type ?? group.description ?? "",
          severity: group.rating  ?? "low",
          status:   group.status  ?? "new",
          date:     group.createdAt ? group.createdAt.split("T")[0] : "",
        }];
      });

      setData(rows);
      setSelected(new Set());
      setTotal(body.totalItems ?? rows.length);
      setTotalPages(body.totalPages ?? Math.max(1, Math.ceil((body.totalItems ?? rows.length) / PAGE_SIZE)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Өгөгдөл татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, fSev, fStat]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // fetchData-г ref-д хадгалж stale closure-с зайлсхийх
  const fetchDataRef = useRef(fetchData);
  useEffect(() => { fetchDataRef.current = fetchData; }, [fetchData]);

  // ── Sort logic (client-side on current page) ──
  const sortedData = [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const va = (a[sortCol] ?? "").toString().toLowerCase();
    const vb = (b[sortCol] ?? "").toString().toLowerCase();
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  // ── Bulk selection ──
  const allIds    = data.map(x => x.id ?? x._id);
  const allChecked = allIds.length > 0 && allIds.every(id => selected.has(id));
  const toggleAll  = () => {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(allIds));
  };
  const toggleOne = (id) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── Bulk delete ──
  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`${selected.size} зөрчлийг устгахдаа итгэлтэй байна уу?`)) return;
    setBulkLoading(true);
    let failed = 0;
    for (const id of selected) {
      try { await api.delete(`/violations/${id}`); }
      catch (_e) { failed++; }
    }
    setBulkLoading(false);
    if (failed) toast.warning(`${failed} зөрчил устгагдсангүй.`);
    else toast.success(`${selected.size} зөрчил устгагдлаа ✓`);
    setSelected(new Set());
    fetchDataRef.current();
  };

  // ── Bulk status change ──
  const handleBulkStatus = async () => {
    if (!selected.size || !bulkStatus) return;
    setBulkLoading(true);
    let failed = 0;
    for (const id of selected) {
      try { await api.put(`/violations/${id}`, { status: bulkStatus }); }
      catch (_e) { failed++; }
    }
    setBulkLoading(false);
    if (failed) toast.warning(`${failed} зөрчил шинэчлэгдсэнгүй.`);
    else toast.success(`${selected.size} зөрчлийн төлөв өөрчлөгдлөө ✓`);
    setSelected(new Set()); setBulkStatus("");
    fetchDataRef.current();
  };

  const handleDelete = async (id) => {
    await onDelete(id);
    const newTotal = total - 1;
    const maxPage  = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    const nextPage = Math.min(page, maxPage);
    if (nextPage !== page) setPage(nextPage); else fetchDataRef.current();
  };

  const handleFilter = (setter, val) => { setter(val); setPage(1); };

  const inp = {
    padding: "8px 14px", border: "1px solid #e0e0e0", borderRadius: 8,
    fontSize: 14, background: "#fafafa", color: "#555", outline: "none",
  };

  const pageBtn = (n, label, disabled, active) => (
    <button key={label ?? n} onClick={() => !disabled && setPage(n)} disabled={disabled} style={{
      minWidth: 34, height: 34, padding: "0 10px",
      border: active ? "none" : "1px solid #e0e0e0",
      borderRadius: 8, fontSize: 13, cursor: disabled ? "default" : "pointer",
      background: active ? "#3498db" : disabled ? "#f5f5f5" : "#fff",
      color: active ? "#fff" : disabled ? "#ccc" : "#555",
      fontWeight: active ? 700 : 400,
    }}>{label ?? n}</button>
  );

  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx   = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          Зөрчлийн жагсаалт
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Excel / CSV Export */}
          <button
            onClick={() => exportToCSV(data, SEV_MAP, STAT_MAP)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 9, border: "1px solid #27ae60",
              background: "#eafaf1", color: "#1a7a45", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            ⬇ Excel / CSV
          </button>
          <button
            onClick={() => onAdd({
              open: true,
              title: "Шинэ зөрчил нэмэх",
              initial: { name: "", type: "", severity: "low", date: new Date().toISOString().split("T")[0], status: "new" },
              editId: null,
            })}
            style={{ background: "#3498db", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            + Зөрчил нэмэх
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "14px 18px",
        border: "0.5px solid #eee", marginBottom: 16,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          type="text" placeholder="🔍  Хайх..."
          style={{ ...inp, flex: 1, minWidth: 180 }}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select value={fSev} onChange={e => handleFilter(setFSev, e.target.value)} style={inp}>
          <option value="">Бүх түвшин</option>
          {Object.entries(SEV_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fStat} onChange={e => handleFilter(setFStat, e.target.value)} style={inp}>
          <option value="">Бүх төлөв</option>
          {Object.entries(STAT_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(search || fSev || fStat) && (
          <button
            onClick={() => { setSearch(""); handleFilter(setFSev, ""); handleFilter(setFStat, ""); }}
            style={{ padding: "8px 14px", border: "1px solid #eee", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#fff", color: "#888" }}
          >Цэвэрлэх ✕</button>
        )}
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.size > 0 && (
        <div style={{
          background: "#1a2035", borderRadius: 12, padding: "12px 18px",
          marginBottom: 12, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          boxShadow: "0 4px 16px rgba(26,32,53,0.18)",
        }}>
          <span style={{ color: "#74c0f7", fontWeight: 700, fontSize: 13 }}>
            ✓ {selected.size} зөрчил сонгогдсон
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 13, outline: "none" }}
            >
              <option value="">Төлөв сонгох...</option>
              {Object.entries(STAT_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button
              onClick={handleBulkStatus}
              disabled={!bulkStatus || bulkLoading}
              style={{ padding: "6px 14px", borderRadius: 8, background: bulkStatus ? "#3498db" : "rgba(255,255,255,0.1)", color: "#fff", border: "none", fontSize: 13, cursor: bulkStatus ? "pointer" : "default", fontWeight: 600 }}
            >
              {bulkLoading ? "..." : "Төлөв өөрчлөх"}
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            style={{ padding: "6px 14px", borderRadius: 8, background: "#e74c3c", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            🗑 Устгах ({selected.size})
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#a0aec0", border: "none", fontSize: 12, cursor: "pointer" }}
          >
            Болих
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #eee", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fb" }}>
              {/* Checkbox all */}
              <th style={{ padding: "13px 16px", width: 40, borderBottom: "1px solid #f0f0f0" }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  style={{ cursor: "pointer", width: 15, height: 15 }}
                />
              </th>
              <SortTh col="name"     label="Нэр"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="type"     label="Төрөл"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="severity" label="Түвшин" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="status"   label="Төлөв"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="date"     label="Огноо"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <th style={{ padding: "13px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", borderBottom: "1px solid #f0f0f0" }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>
                  {" "}Уншиж байна...
                </td>
              </tr>
            ) : sortedData.length > 0 ? sortedData.map((x, i) => {
              const id = x.id ?? x._id;
              const isChecked = selected.has(id);
              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: "0.5px solid #f5f5f5",
                    background: isChecked ? "#eaf4fd" : i % 2 === 0 ? "#fff" : "#fafbfc",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "13px 16px" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(id)}
                      style={{ cursor: "pointer", width: 15, height: 15 }}
                    />
                  </td>
                  {/* Нэр — дарахад drawer нээнэ */}
                  <td
                    style={{ padding: "13px 16px", fontSize: 14, color: "#1a5276", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#d0e4f7" }}
                    onClick={() => setDrawer(x)}
                  >
                    {x.name ?? x.title}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: "#eef2f8", color: "#555", fontSize: 12, padding: "3px 9px", borderRadius: 6 }}>{x.type}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}><Badge map={SEV_MAP} val={x.severity} /></td>
                  <td style={{ padding: "13px 16px" }}><Badge map={STAT_MAP} val={x.status} /></td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#888" }}>{x.date ?? (x.created_at ? x.created_at.split("T")[0] : "")}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setDrawer(x)}
                        style={{ padding: "5px 10px", border: "1px solid #d5d5f5", borderRadius: 7, background: "#f0f0ff", color: "#444", fontSize: 12, cursor: "pointer" }}
                      >👁 Харах</button>
                      <button
                        onClick={() => onEdit(x)}
                        style={{ padding: "5px 12px", border: "1px solid #d0e4f7", borderRadius: 7, background: "#eaf4fd", color: "#1a5276", fontSize: 12, cursor: "pointer" }}
                      >Засах</button>
                      <button
                        onClick={() => handleDelete(id)}
                        style={{ padding: "5px 12px", border: "1px solid #f5c6c6", borderRadius: 7, background: "#fdecea", color: "#a32d2d", fontSize: 12, cursor: "pointer" }}
                      >Устгах</button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#bbb", fontSize: 14 }}>Зөрчил олдсонгүй</td>
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
            {total > 0 && <span style={{ marginLeft: 6, color: "#bbb" }}>— {startIdx}–{endIdx} харагдаж байна</span>}
            {selected.size > 0 && <span style={{ marginLeft: 8, color: "#3498db", fontWeight: 600 }}>· {selected.size} сонгогдсон</span>}
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

      {/* ── Detail Drawer ── */}
      <DetailDrawer item={drawer} onClose={() => setDrawer(null)} onEdit={onEdit} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}