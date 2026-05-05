import { useState } from "react";
import { Badge } from "../Dashboard";
import { SEV_MAP, STAT_MAP } from "../Dashboard";

const today = () => new Date().toISOString().split("T")[0];
const PAGE_SIZE = 10;

export default function ViolationsPage({ data, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [fSev, setFSev] = useState("");
  const [fStat, setFStat] = useState("");
  const [page, setPage] = useState(1);

  const filtered = data.filter(x => {
    const s = search.toLowerCase();
    return (
      (x.name.toLowerCase().includes(s) || (x.type || "").toLowerCase().includes(s)) &&
      (fSev ? x.severity === fSev : true) &&
      (fStat ? x.status === fStat : true)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilter = (setter, val) => {
    setter(val);
    setPage(1);
  };

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
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          Зөрчлийн жагсаалт
        </h2>
        <button
          onClick={() => onAdd({
            open: true,
            title: "Шинэ зөрчил нэмэх",
            initial: { name: "", type: "", severity: "low", date: today(), status: "new" },
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
          onChange={e => handleFilter(setSearch, e.target.value)}
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
            onClick={() => { handleFilter(setSearch, ""); handleFilter(setFSev, ""); handleFilter(setFStat, ""); }}
            style={{ padding: "8px 14px", border: "1px solid #eee", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#fff", color: "#888" }}
          >
            Цэвэрлэх ✕
          </button>
        )}
      </div>

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
            {paginated.length > 0 ? paginated.map((x, i) => (
              <tr
                key={x.id}
                style={{ borderBottom: "0.5px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
              >
                <td style={{ padding: "13px 16px", fontSize: 14, color: "#222", fontWeight: 500 }}>{x.name}</td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ background: "#eef2f8", color: "#555", fontSize: 12, padding: "3px 9px", borderRadius: 6 }}>
                    {x.type}
                  </span>
                </td>
                <td style={{ padding: "13px 16px" }}><Badge map={SEV_MAP} val={x.severity} /></td>
                <td style={{ padding: "13px 16px" }}><Badge map={STAT_MAP} val={x.status} /></td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#888" }}>{x.date}</td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => onEdit(x)}
                      style={{ padding: "5px 12px", border: "1px solid #d0e4f7", borderRadius: 7, background: "#eaf4fd", color: "#1a5276", fontSize: 12, cursor: "pointer" }}
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => onDelete(x.id)}
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

        <div style={{
          padding: "12px 16px", borderTop: "0.5px solid #f0f0f0",
          fontSize: 12, color: "#aaa",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10,
        }}>
          <span>
            Нийт: <b style={{ color: "#555" }}>{filtered.length}</b> зөрчил
            {filtered.length !== data.length && ` (${data.length}-с шүүгдсэн)`}
            {filtered.length > 0 && (
              <span style={{ marginLeft: 6, color: "#bbb" }}>
                — {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} харагдаж байна
              </span>
            )}
          </span>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {pageBtn(safePage - 1, "‹", safePage === 1, false)}
              {pageNumbers().map((n, idx) =>
                n === "..."
                  ? <span key={`e${idx}`} style={{ padding: "0 4px", color: "#bbb", fontSize: 13 }}>…</span>
                  : pageBtn(n, null, false, n === safePage)
              )}
              {pageBtn(safePage + 1, "›", safePage === totalPages, false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}