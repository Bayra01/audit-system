import { useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

// ── Тогтмолууд ────────────────────────────────────────────────
const SEV_MAP = {
  low:      { label: "Бага",    dot: "#2ecc71", bg: "#e8f8f0", color: "#1a7a45" },
  medium:   { label: "Дунд",   dot: "#f1c40f", bg: "#fef9e7", color: "#7d6608" },
  high:     { label: "Өндөр",  dot: "#e67e22", bg: "#fef0e7", color: "#784212" },
  critical: { label: "Ноцтой", dot: "#e74c3c", bg: "#fdecea", color: "#78281f" },
};

const STAT_MAP = {
  new:      { label: "Шинэ",          dot: "#3498db", bg: "#eaf4fd", color: "#1a5276" },
  pending:  { label: "Шалгагдаж буй", dot: "#9b59b6", bg: "#f4ecf7", color: "#6c3483" },
  resolved: { label: "Шийдвэрлэсэн", dot: "#2ecc71", bg: "#e8f8f0", color: "#1a7a45" },
};

const QUARTERS = ["I улирал", "II улирал", "III улирал", "IV улирал"];
const QUARTER_MONTHS = { "I улирал": [0,1,2], "II улирал": [3,4,5], "III улирал": [6,7,8], "IV улирал": [9,10,11] };

const BAR_COLORS = ["#3498db","#2ecc71","#e67e22","#9b59b6","#e74c3c","#1abc9c","#f1c40f"];

// ── KPI Карт ──────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon, accent, highlight }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${accent}18, ${accent}08)` : "#fff",
      borderRadius: 14, padding: "20px 22px",
      boxShadow: highlight ? `0 4px 20px ${accent}22` : "0 2px 8px rgba(0,0,0,0.06)",
      border: highlight ? `1.5px solid ${accent}44` : "1px solid #eef1f6",
      display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 155,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: accent + "22", color: accent,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 4, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: highlight ? accent : "#1a1a2e", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "#b0bec5", marginTop: 5 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Heat Map ──────────────────────────────────────────────────
function HeatMapChart({ data }) {
  const months = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];
  const severities = ["critical","high","medium","low"];

  const matrix = useMemo(() => {
    const m = {};
    severities.forEach(s => { m[s] = new Array(12).fill(0); });
    data.forEach(item => {
      const d = new Date(item.date);
      if (!isNaN(d) && m[item.severity]) m[item.severity][d.getMonth()]++;
    });
    return m;
  }, [data]);

  const maxVal = Math.max(...severities.flatMap(s => matrix[s]), 1);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 3, width: "100%", minWidth: 500 }}>
        <thead>
          <tr>
            <th style={{ width: 70, fontSize: 10, color: "#aaa", textAlign: "left", paddingBottom: 6, fontWeight: 500 }}>Түвшин</th>
            {months.map(m => (
              <th key={m} style={{ fontSize: 10, color: "#aaa", fontWeight: 500, textAlign: "center", paddingBottom: 6 }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {severities.map(sev => (
            <tr key={sev}>
              <td style={{ fontSize: 11, color: SEV_MAP[sev].color, fontWeight: 600, paddingRight: 8, whiteSpace: "nowrap" }}>
                {SEV_MAP[sev].label}
              </td>
              {matrix[sev].map((count, i) => {
                const alpha = count > 0 ? Math.round(55 + (count / maxVal) * 200).toString(16).padStart(2,"0") : "";
                return (
                  <td key={i} title={`${months[i]} сар: ${count} зөрчил`} style={{
                    width: 28, height: 26, textAlign: "center", borderRadius: 5,
                    background: count > 0 ? SEV_MAP[sev].dot + alpha : "#f0f2f8",
                    fontSize: 10, fontWeight: 600,
                    color: count > 0 ? "#fff" : "#ddd",
                  }}>
                    {count > 0 ? count : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: "#b0bec5", marginTop: 8 }}>* Өнгийн эрч ихэвчлэн = зөрчлийн тоо их</div>
    </div>
  );
}

// ── Эскалацийн анхааруулга ────────────────────────────────────
function EscalationAlerts({ data }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = data.filter(x => {
    if (x.status === "resolved") return false;
    const due = x.due_date || x.dueDate;
    return due && new Date(due) < today;
  });
  if (!overdue.length) return null;

  return (
    <div style={{
      background: "#fff8f0", border: "1px solid #f5c68a",
      borderLeft: "4px solid #e67e22", borderRadius: 12,
      padding: "16px 20px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ fontWeight: 700, color: "#784212", fontSize: 14 }}>
          Хугацаа хэтэрсэн зөрчлүүд ({overdue.length}) — эскалаци шаардлагатай
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {overdue.slice(0, 5).map(x => (
          <div key={x.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#fff", borderRadius: 8, padding: "8px 14px",
            border: "1px solid #fde8cc", fontSize: 13,
          }}>
            <span style={{ color: "#333", fontWeight: 500 }}>{x.name}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "#e74c3c", fontSize: 11, fontWeight: 500 }}>📅 {x.due_date || x.dueDate}</span>
              <span style={{ background: SEV_MAP[x.severity]?.bg, color: SEV_MAP[x.severity]?.color, fontSize: 11, padding: "2px 9px", borderRadius: 20, fontWeight: 600 }}>
                {SEV_MAP[x.severity]?.label}
              </span>
            </div>
          </div>
        ))}
        {overdue.length > 5 && (
          <div style={{ fontSize: 12, color: "#e67e22", textAlign: "center", paddingTop: 4 }}>
            + {overdue.length - 5} нэмэлт зөрчил хугацаа хэтэрсэн
          </div>
        )}
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", gap: 8, marginBottom: 2 }}>
          <span>{p.name}:</span><span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Top Violations Widget ─────────────────────────────────────
function TopViolationsWidget({ data }) {
  const top = useMemo(() => {
    // assignee-аар бүлэглэж хамгийн олон зөрчилтэй ажилтнуудыг харуулах
    const map = {};
    data.forEach(x => {
      const name = x.assignee_name || x.assignee || "Хариуцагчгүй";
      if (!map[name]) map[name] = { name, total: 0, critical: 0, unresolved: 0 };
      map[name].total++;
      if (x.severity === "critical") map[name].critical++;
      if (x.status !== "resolved")   map[name].unresolved++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [data]);

  if (!top.length) return <div style={{ textAlign: "center", color: "#bbb", paddingTop: 40, fontSize: 13 }}>Өгөгдөл алга</div>;

  const maxTotal = Math.max(...top.map(t => t.total), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {top.map((t, i) => (
        <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
            background: i === 0 ? "#f39c12" : i === 1 ? "#7f8c8d" : i === 2 ? "#cd7f32" : "#e0e6ee",
            color: i < 3 ? "#fff" : "#888",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700,
          }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                {t.critical > 0 && (
                  <span style={{ fontSize: 10, background: "#fdecea", color: "#c0392b", padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>🚨 {t.critical}</span>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{t.total}</span>
              </div>
            </div>
            <div style={{ height: 5, background: "#f0f2f8", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(t.total / maxTotal) * 100}%`, background: i === 0 ? "#e67e22" : "#3498db", borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
              {t.unresolved} шийдэгдээгүй · нийт {t.total}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Resolution Time KPI ───────────────────────────────────────
function calcAvgResolutionDays(data) {
  const resolved = data.filter(x => x.status === "resolved" && x.date && (x.due_date || x.dueDate));
  if (!resolved.length) return null;
  const totalDays = resolved.reduce((sum, x) => {
    const start = new Date(x.date);
    const end   = new Date(x.due_date || x.dueDate);
    const diff  = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
    return sum + diff;
  }, 0);
  return Math.round(totalDays / resolved.length);
}

// ── PDF Экспорт ───────────────────────────────────────────────
function ExportPDFButton({ data, kpi }) {
  const handle = () => {
    const rows = data.map((x, i) => `
      <tr>
        <td>${i+1}</td><td>${x.name||"-"}</td><td>${x.type||"-"}</td>
        <td>${SEV_MAP[x.severity]?.label||x.severity||"-"}</td>
        <td>${STAT_MAP[x.status]?.label||x.status||"-"}</td>
        <td>${x.date||"-"}</td>
        <td>${x.assignee_name||x.assignee||"-"}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Зөрчлийн тайлан</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1a1a2e}
        h1{font-size:20px;margin-bottom:4px}
        .sub{color:#888;font-size:12px;margin-bottom:24px}
        .kpi-row{display:flex;gap:14px;margin-bottom:24px;flex-wrap:wrap}
        .kpi{background:#f8f9fb;border-radius:10px;padding:14px 20px;min-width:110px;border:1px solid #eee}
        .kpi-val{font-size:26px;font-weight:800}.kpi-lbl{font-size:11px;color:#888;margin-top:2px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#f0f2f8;padding:9px 12px;text-align:left;font-size:11px;color:#555;border-bottom:2px solid #e0e0e0}
        td{padding:9px 12px;border-bottom:1px solid #f0f0f0}
        tr:nth-child(even) td{background:#fafbfc}
        .footer{margin-top:32px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:12px}
        @media print{body{padding:16px}}
      </style></head><body>
      <h1>📋 Зөрчлийн аудитын тайлан</h1>
      <div class="sub">Үүсгэсэн: ${new Date().toLocaleDateString("mn-MN",{year:"numeric",month:"long",day:"numeric"})}</div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-val">${kpi.total}</div><div class="kpi-lbl">Нийт зөрчил</div></div>
        <div class="kpi"><div class="kpi-val">${kpi.resolutionRate}%</div><div class="kpi-lbl">Шийдвэрлэлтийн %</div></div>
        <div class="kpi"><div class="kpi-val">${kpi.newV}</div><div class="kpi-lbl">Шинэ зөрчил</div></div>
        <div class="kpi"><div class="kpi-val">${kpi.overdue}</div><div class="kpi-lbl">Хугацаа хэтэрсэн</div></div>
        <div class="kpi"><div class="kpi-val">${kpi.critical}</div><div class="kpi-lbl">Ноцтой зөрчил</div></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Нэр</th><th>Төрөл</th><th>Түвшин</th><th>Төлөв</th><th>Огноо</th><th>Хариуцагч</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">Нийт: ${data.length} зөрчил &nbsp;|&nbsp; Хяналтын систем &nbsp;|&nbsp; ${new Date().toLocaleString("mn-MN")}</div>
      </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <button onClick={handle} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "9px 18px", borderRadius: 10,
      background: "linear-gradient(135deg, #2c3e50, #3498db)",
      color: "#fff", border: "none", cursor: "pointer",
      fontSize: 13, fontWeight: 600, boxShadow: "0 3px 10px rgba(52,152,219,0.3)",
    }}>
      🖨️ PDF тайлан
    </button>
  );
}

// ── ҮНДСЭН КОМПОНЕНТ ─────────────────────────────────────────
export default function DashboardPage({ data = [] }) {
  const [trendRange, setTrendRange] = useState("month");

  // ── Шинэ шүүлтүүрүүд ──
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterQuarter,  setFilterQuarter]  = useState("");

  // Assignee жагсаалт
  const assigneeList = useMemo(() => {
    const names = new Set(data.map(x => x.assignee_name || x.assignee).filter(Boolean));
    return [...names].sort();
  }, [data]);

  // Шүүгдсэн өгөгдөл
  const filteredData = useMemo(() => {
    return data.filter(x => {
      if (filterAssignee) {
        const name = x.assignee_name || x.assignee || "";
        if (name !== filterAssignee) return false;
      }
      if (filterQuarter) {
        const months = QUARTER_MONTHS[filterQuarter];
        const d = new Date(x.date);
        if (isNaN(d) || !months.includes(d.getMonth())) return false;
      }
      return true;
    });
  }, [data, filterAssignee, filterQuarter]);

  const kpi = useMemo(() => {
    const total    = filteredData.length;
    const resolved = filteredData.filter(x => x.status === "resolved").length;
    const newV     = filteredData.filter(x => x.status === "new").length;
    const critical = filteredData.filter(x => x.severity === "critical").length;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const overdue = filteredData.filter(x => {
      if (x.status === "resolved") return false;
      const due = x.due_date || x.dueDate;
      return due && new Date(due) < today;
    }).length;
    const avgDays = calcAvgResolutionDays(filteredData);
    return { total, resolved, newV, critical, resolutionRate, overdue, avgDays };
  }, [filteredData]);

  const trendData = useMemo(() => {
    const labels = ["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];
    const b = labels.map(name => ({ name, Нийт:0, Шийдвэрлэсэн:0, Шинэ:0 }));
    filteredData.forEach(x => {
      const d = new Date(x.date);
      if (isNaN(d)) return;
      const i = d.getMonth();
      b[i].Нийт++;
      if (x.status === "resolved") b[i].Шийдвэрлэсэн++;
      if (x.status === "new")      b[i].Шинэ++;
    });
    return b.slice(0, new Date().getMonth() + 1);
  }, [filteredData]);

  const pieData = useMemo(() =>
    Object.entries(SEV_MAP)
      .map(([k,v]) => ({ name:v.label, value:filteredData.filter(x=>x.severity===k).length, color:v.dot }))
      .filter(x => x.value > 0),
  [filteredData]);

  const byType = useMemo(() => {
    const map = {};
    filteredData.forEach(x => { const t = x.type||"Бусад"; map[t]=(map[t]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([name,count])=>({name,count}));
  }, [filteredData]);

  const isFiltered = filterAssignee || filterQuarter;

  const Card = ({ children, style={} }) => (
    <div style={{ background:"#fff", borderRadius:14, padding:22, border:"1px solid #eef1f6", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );

  const SectionTitle = ({ t }) => (
    <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:"#2c3e50" }}>{t}</h3>
  );

  const inp = {
    padding: "7px 12px", border: "1px solid #e0e0e0", borderRadius: 8,
    fontSize: 13, background: "#fafafa", color: "#555", outline: "none",
  };

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* ── Гарчиг ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:"#1a1a2e" }}>📊 Удирдлагын хяналтын дашбоард</h2>
          <div style={{ fontSize:12, color:"#9aa5b4", marginTop:3 }}>Бодит цагийн зөрчил, KPI болон трэнд шинжилгээ</div>
        </div>
        <ExportPDFButton data={filteredData} kpi={kpi} />
      </div>

      {/* ── Шүүлтүүр мөр ── */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "12px 18px",
        border: "1px solid #eef1f6", marginBottom: 20,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#8a9ab5", marginRight: 4 }}>🔽 Шүүлтүүр:</span>

        {/* Assignee шүүлтүүр */}
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={inp}>
          <option value="">👤 Бүх хариуцагч</option>
          {assigneeList.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Quarter шүүлтүүр */}
        <select value={filterQuarter} onChange={e => setFilterQuarter(e.target.value)} style={inp}>
          <option value="">📅 Бүх улирал</option>
          {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        {isFiltered && (
          <button
            onClick={() => { setFilterAssignee(""); setFilterQuarter(""); }}
            style={{ padding: "7px 14px", border: "1px solid #eee", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#fff", color: "#888" }}
          >
            Цэвэрлэх ✕
          </button>
        )}

        {isFiltered && (
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#3498db", fontWeight: 600 }}>
            {filteredData.length} / {data.length} зөрчил харагдаж байна
          </span>
        )}
      </div>

      {/* ── Эскалацийн анхааруулга ── */}
      <EscalationAlerts data={filteredData} />

      {/* ── KPI мөр ── */}
      <div style={{ display:"flex", gap:14, marginBottom:22, flexWrap:"wrap" }}>
        <KpiCard title="Нийт зөрчил"         value={kpi.total}                     icon="⚠️" accent="#3498db" sub="Нийт бүртгэл" />
        <KpiCard title="Шийдвэрлэлтийн %"    value={kpi.resolutionRate+"%"}         icon="✅" accent="#2ecc71" sub="Амжилтын хувь" highlight={kpi.resolutionRate >= 80} />
        <KpiCard title="Шинэ зөрчил"          value={kpi.newV}                       icon="🔔" accent="#e74c3c" sub="Анхаарал шаардлагатай" />
        <KpiCard title="Хугацаа хэтэрсэн"     value={kpi.overdue}                    icon="⏰" accent="#e67e22" sub="Эскалаци шаардлагатай" highlight={kpi.overdue > 0} />
        <KpiCard title="Ноцтой зөрчил"        value={kpi.critical}                   icon="🚨" accent="#c0392b" sub="Critical түвшин" />
        <KpiCard
          title="Дундаж шийдвэрлэх хугацаа"
          value={kpi.avgDays != null ? `${kpi.avgDays} өдөр` : "—"}
          icon="⏱️"
          accent="#9b59b6"
          sub="Шийдвэрлэсэн зөрчлүүдийн avg"
          highlight={kpi.avgDays != null && kpi.avgDays <= 7}
        />
      </div>

      {/* ── Трэнд + Pie ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <SectionTitle t="📈 Зөрчлийн трэнд шинжилгээ" />
            <div style={{ display:"flex", gap:6 }}>
              {[["month","Сараар"],["quarter","Улирлаар"]].map(([r,lbl]) => (
                <button key={r} onClick={() => setTrendRange(r)} style={{
                  padding:"4px 12px", borderRadius:20, fontSize:11, cursor:"pointer",
                  border:"1px solid "+(trendRange===r?"#3498db":"#e0e0e0"),
                  background: trendRange===r?"#3498db":"#fff",
                  color: trendRange===r?"#fff":"#888", fontWeight:500,
                }}>{lbl}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:"#aaa" }} />
              <YAxis tick={{ fontSize:11, fill:"#aaa" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11, paddingTop:10 }} />
              <Line type="monotone" dataKey="Нийт"         stroke="#3498db" strokeWidth={2.5} dot={{ r:3 }} />
              <Line type="monotone" dataKey="Шийдвэрлэсэн" stroke="#2ecc71" strokeWidth={2}   dot={{ r:3 }} />
              <Line type="monotone" dataKey="Шинэ"          stroke="#e74c3c" strokeWidth={2}   dot={{ r:3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle t="🎯 Зөрчлийн түвшин" />
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3}>
                    {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v,n) => [v+" зөрчил",n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:10 }}>
                {pieData.map((p,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ width:10, height:10, borderRadius:"50%", background:p.color, display:"inline-block" }} />
                      <span style={{ color:"#555" }}>{p.name}</span>
                    </div>
                    <span style={{ fontWeight:700, color:"#333" }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", color:"#bbb", paddingTop:40, fontSize:13 }}>Өгөгдөл алга</div>
          )}
        </Card>
      </div>

      {/* ── Heat Map + Bar ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <SectionTitle t="🗓️ Heat map — сараар × түвшин" />
          <HeatMapChart data={filteredData} />
        </Card>

        <Card>
          <SectionTitle t="📂 Зөрчлийн төрлөөр" />
          {byType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byType} layout="vertical" margin={{ top:0, right:20, left:30, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:"#aaa" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#555" }} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Зөрчил" radius={[0,6,6,0]}>
                  {byType.map((_,i) => <Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:"center", color:"#bbb", paddingTop:40, fontSize:13 }}>Өгөгдөл алга</div>
          )}
        </Card>
      </div>

      {/* ── Top Violations + Сүүлийн зөрчлүүд ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginBottom:16 }}>

        {/* Top Violations Widget */}
        <Card>
          <SectionTitle t="🏆 Хариуцагчаар — Top зөрчил" />
          <TopViolationsWidget data={filteredData} />
        </Card>

        {/* Сүүлийн зөрчлүүд */}
        <Card>
          <SectionTitle t="🕐 Сүүлийн зөрчлүүд" />
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f8f9fb" }}>
                {["Нэр","Төрөл","Түвшин","Төлөв","Огноо"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"#8a9ab5", borderBottom:"1px solid #f0f0f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0,6).map((x,i) => (
                <tr key={x.id} style={{ borderBottom:"0.5px solid #f5f5f5", background:i%2===0?"#fff":"#fafbfc" }}>
                  <td style={{ padding:"11px 14px", fontSize:13, color:"#222", fontWeight:500 }}>{x.name}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ background:"#eef2f8", color:"#555", fontSize:11, padding:"2px 9px", borderRadius:6 }}>{x.type}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:4,
                      background:SEV_MAP[x.severity]?.bg, color:SEV_MAP[x.severity]?.color,
                      padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:500,
                    }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:SEV_MAP[x.severity]?.dot }} />
                      {SEV_MAP[x.severity]?.label}
                    </span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:4,
                      background:STAT_MAP[x.status]?.bg, color:STAT_MAP[x.status]?.color,
                      padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:500,
                    }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:STAT_MAP[x.status]?.dot }} />
                      {STAT_MAP[x.status]?.label||x.status}
                    </span>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#9aa5b4" }}>{x.date}</td>
                </tr>
              ))}
              {!filteredData.length && (
                <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:"#bbb", fontSize:13 }}>Зөрчил байхгүй байна</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}