import { useState, useEffect } from "react";
import { Badge, StatCard, SEV_MAP } from "../Dashboard";
import api from "../../api/axios";
import { toast } from "react-toastify";

// ── SheetJS CDN-ээс динамикаар ачааллах ──────────────
let _XLSX = null;
async function loadXLSX() {
  if (_XLSX) return _XLSX;
  return new Promise((resolve, reject) => {
    if (window.XLSX) { _XLSX = window.XLSX; return resolve(_XLSX); }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => { _XLSX = window.XLSX; resolve(_XLSX); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── CSV татах ─────────────────────────────────────────
function exportCSV(rows) {
  const SEV_L = { low: "Бага", medium: "Дунд", high: "Өндөр", critical: "Ноцтой" };
  const STA_L = { new: "Шинэ", pending: "Шалгагдаж буй", resolved: "Шийдвэрлэсэн" };
  const headers = ["#", "Нэр", "Хэлтэс", "Түвшин", "Төлөв", "Огноо"];
  const csv = [
    headers.join(","),
    ...rows.map((r, i) => [
      i + 1,
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.type || "").replace(/"/g, '""')}"`,
      SEV_L[r.severity] || r.severity,
      STA_L[r.status] || r.status,
      r.date || "",
    ].join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zorchil_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── XLS татах ─────────────────────────────────────────
async function exportXLS(rows, stats, sevCounts) {
  const XLSX = await loadXLSX();
  const SEV_L = { low: "Бага", medium: "Дунд", high: "Өндөр", critical: "Ноцтой" };
  const STA_L = { new: "Шинэ", pending: "Шалгагдаж буй", resolved: "Шийдвэрлэсэн" };

  // Sheet 1 — Хураангуй
  const summary = [
    ["Зөрчлийн тайлан"],
    ["Гаргасан огноо", new Date().toLocaleDateString("mn-MN")],
    [],
    ["Нийт зөрчил", stats.total],
    ["Шинэ", stats.newCount],
    ["Шалгагдаж буй", stats.pending],
    ["Шийдвэрлэсэн", stats.resolved],
    [],
    ["Түвшингийн задаргаа"],
    ["Бага", sevCounts.low],
    ["Дунд", sevCounts.medium],
    ["Өндөр", sevCounts.high],
    ["Ноцтой", sevCounts.critical],
  ];

  // Sheet 2 — Жагсаалт
  const list = [
    ["#", "Нэр", "Хэлтэс", "Түвшин", "Төлөв", "Огноо"],
    ...rows.map((r, i) => [
      i + 1,
      r.name || "",
      r.type || "",
      SEV_L[r.severity] || r.severity,
      STA_L[r.status] || r.status,
      r.date || "",
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(summary);
  const ws2 = XLSX.utils.aoa_to_sheet(list);
  ws1["!cols"] = [{ wch: 24 }, { wch: 16 }];
  ws2["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Хураангуй");
  XLSX.utils.book_append_sheet(wb, ws2, "Зөрчлийн жагсаалт");
  XLSX.writeFile(wb, `zorchil_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export default function DashboardPage({ refreshKey }) {
  const [stats, setStats] = useState({ total: 0, resolved: 0, newCount: 0, pending: 0 });
  const [severityCounts, setSeverityCounts] = useState({ low: 0, medium: 0, high: 0, critical: 0 });
  const [recent, setRecent] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null); // "csv" | "xlsx" | null

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get("/violations?page=1&limit=100");
        if (cancelled) return;

        const body = res.data;

        const rows = (body.data ?? []).flatMap(group => {
          const viols = group.violations;
          if (Array.isArray(viols) && viols.length > 0) {
            return viols.map(v => ({
              id: v.id,
              name: v.title ?? v.name ?? "",
              type: v.type ?? group.type ?? "",
              severity: v.severity ?? group.rating ?? "low",
              status: v.status ?? group.status ?? "new",
              date: v.createdAt
                ? v.createdAt.split("T")[0]
                : group.createdAt
                  ? group.createdAt.split("T")[0]
                  : "",
            }));
          }
          return [{
            id: group.id,
            name: group.group_number ?? `Бүлэг #${group.id}`,
            type: group.type ?? "",
            severity: group.rating ?? "low",
            status: group.status ?? "new",
            date: group.createdAt ? group.createdAt.split("T")[0] : "",
          }];
        });

        const total = body.totalItems ?? rows.length;
        const resolved = rows.filter(x => x.status === "resolved").length;
        const newCount = rows.filter(x => x.status === "new").length;
        const pending = rows.filter(x => x.status === "pending").length;

        const sev = { low: 0, medium: 0, high: 0, critical: 0 };
        rows.forEach(x => { if (sev[x.severity] !== undefined) sev[x.severity]++; });

        setStats({ total, resolved, newCount, pending });
        setSeverityCounts(sev);
        setRecent(rows.slice(0, 5));
        setAllRows(rows);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleCSV = () => {
    if (!allRows.length) return;
    setExporting("csv");
    try {
      exportCSV(allRows);
      toast.success(`CSV татагдлаа — ${allRows.length} зөрчил ✓`);
    } catch {
      toast.error("CSV татахад алдаа гарлаа.");
    } finally {
      setExporting(null);
    }
  };

  const handleXLS = async () => {
    if (!allRows.length) return;
    setExporting("xlsx");
    try {
      await exportXLS(allRows, stats, severityCounts);
      toast.success(`Excel татагдлаа — ${allRows.length} зөрчил ✓`);
    } catch {
      toast.error("Excel татахад алдаа гарлаа.");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#aaa", fontSize: 14 }}>
        ⏳ Уншиж байна...
      </div>
    );
  }

  const noData = allRows.length === 0;

  return (
    <div>
      {/* ── Header + Export товчнууд ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          Ерөнхий тойм
        </h2>

        <div style={{ display: "flex", gap: 8 }}>
          {/* CSV */}
          <button
            onClick={handleCSV}
            disabled={!!exporting || noData}
            title={noData ? "Татах өгөгдөл байхгүй" : "CSV татах"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, border: "none",
              cursor: noData ? "not-allowed" : "pointer",
              background: noData ? "#f0f0f0" : "linear-gradient(135deg, #27ae60, #1e8449)",
              color: noData ? "#bbb" : "#fff",
              fontWeight: 600, fontSize: 12,
              boxShadow: noData ? "none" : "0 2px 8px rgba(39,174,96,0.28)",
              transition: "opacity 0.15s",
              opacity: exporting === "csv" ? 0.7 : 1,
            }}
          >
            {exporting === "csv" ? "⏳" : "⬇️"} CSV
          </button>

          {/* Excel */}
          <button
            onClick={handleXLS}
            disabled={!!exporting || noData}
            title={noData ? "Татах өгөгдөл байхгүй" : "Excel татах"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, border: "none",
              cursor: noData ? "not-allowed" : "pointer",
              background: noData ? "#f0f0f0" : "linear-gradient(135deg, #2471a3, #1a5276)",
              color: noData ? "#bbb" : "#fff",
              fontWeight: 600, fontSize: 12,
              boxShadow: noData ? "none" : "0 2px 8px rgba(36,113,163,0.28)",
              transition: "opacity 0.15s",
              opacity: exporting === "xlsx" ? 0.7 : 1,
            }}
          >
            {exporting === "xlsx" ? "⏳" : "📊"} Excel
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard title="Нийт зөрчил"    value={stats.total}    icon="⚠️" accent="#3498db" sub="Бүх бүртгэл" />
        <StatCard title="Шийдвэрлэсэн"   value={stats.resolved} icon="✅" accent="#2ecc71" sub="Амжилттай хаагдсан" />
        <StatCard title="Шинэ зөрчил"    value={stats.newCount} icon="🔔" accent="#e74c3c" sub="Анхаарал шаардлагатай" />
        <StatCard title="Шалгагдаж буй"  value={stats.pending}  icon="🔍" accent="#9b59b6" sub="Хянагдаж байна" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Severity breakdown */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "0.5px solid #eee" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#555" }}>
            Зөрчлийн түвшин
          </h3>
          {Object.entries(SEV_MAP).map(([k, v]) => {
            const count = severityCounts[k] ?? 0;
            const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: "#333" }}>{v.label}</span>
                  <span style={{ color: "#888" }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: v.dot, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent violations */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "0.5px solid #eee" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#555" }}>
            Сүүлийн зөрчлүүд
          </h3>
          {recent.length > 0 ? (
            recent.map(x => (
              <div key={x.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", borderBottom: "0.5px solid #f5f5f5",
              }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                  <div style={{ fontSize: 13, color: "#222", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {x.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{x.type || "—"}</div>
                </div>
                <Badge map={SEV_MAP} val={x.severity} />
              </div>
            ))
          ) : (
            <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", paddingTop: 20 }}>
              Зөрчил байхгүй
            </div>
          )}
        </div>
      </div>
    </div>
  );
}