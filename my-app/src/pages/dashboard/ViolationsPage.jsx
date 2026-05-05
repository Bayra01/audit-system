import { useState } from "react";
import { Badge } from "../Dashboard";
import { SEV_MAP, STAT_MAP } from "../Dashboard";

const today = () => new Date().toISOString().split("T")[0];

export default function ViolationsPage({ data, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [fSev, setFSev] = useState("");
  const [fStat, setFStat] = useState("");

  const filtered = data.filter(x => {
    const s = search.toLowerCase();
    return (
      (x.name.toLowerCase().includes(s) || (x.type || "").toLowerCase().includes(s)) &&
      (fSev ? x.severity === fSev : true) &&
      (fStat ? x.status === fStat : true)
    );
  });

  const inp = {
    padding: "8px 14px", border: "1px solid #e0e0e0", borderRadius: 8,
    fontSize: 14, background: "#fafafa", color: "#555", outline: "none",
  };

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
        <select value={fSev} onChange={e => setFSev(e.target.value)} style={inp}>
          <option value="">Бүх түвшин</option>
          {Object.entries(SEV_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={fStat} onChange={e => setFStat(e.target.value)} style={inp}>
          <option value="">Бүх төлөв</option>
          {Object.entries(STAT_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        {(search || fSev || fStat) && (
          <button
            onClick={() => { setSearch(""); setFSev(""); setFStat(""); }}
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
            {filtered.length > 0 ? filtered.map((x, i) => (
              <tr
                key={x.id}
                style={{ borderBottom: "0.5px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
              >
                <td style={{ padding: "13px 16px", fontSize: 14, color: "#222", fontWeight: 500 }}>
                  {x.name}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{
                    background: "#eef2f8", color: "#555",
                    fontSize: 12, padding: "3px 9px", borderRadius: 6,
                  }}>
                    {x.type}
                  </span>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <Badge map={SEV_MAP} val={x.severity} />
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <Badge map={STAT_MAP} val={x.status} />
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#888" }}>{x.date}</td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
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
                      onClick={() => onDelete(x.id)}
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

        <div style={{
          padding: "12px 16px", borderTop: "0.5px solid #f0f0f0",
          fontSize: 12, color: "#aaa", display: "flex", justifyContent: "space-between",
        }}>
          <span>Нийт: <b style={{ color: "#555" }}>{filtered.length}</b> зөрчил</span>
          <span>{filtered.length !== data.length && `(${data.length}-с шүүгдсэн)`}</span>
        </div>
      </div>
    </div>
  );
}