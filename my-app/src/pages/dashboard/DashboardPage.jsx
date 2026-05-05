import { Badge, StatCard } from "../Dashboard";
import { SEV_MAP } from "../Dashboard";

export default function DashboardPage({ data }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
        Ерөнхий тойм
      </h2>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard
          title="Нийт зөрчил"
          value={data.length}
          icon="⚠️"
          accent="#3498db"
          sub="Бүх бүртгэл"
        />
        <StatCard
          title="Шийдвэрлэсэн"
          value={data.filter(x => x.status === "resolved").length}
          icon="✅"
          accent="#2ecc71"
          sub="Амжилттай хаагдсан"
        />
        <StatCard
          title="Шинэ зөрчил"
          value={data.filter(x => x.status === "new").length}
          icon="🔔"
          accent="#e74c3c"
          sub="Анхаарал шаардлагатай"
        />
        <StatCard
          title="Шалгагдаж буй"
          value={data.filter(x => x.status === "pending").length}
          icon="🔍"
          accent="#9b59b6"
          sub="Хянагдаж байна"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Severity breakdown */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "0.5px solid #eee" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#555" }}>
            Зөрчлийн түвшин
          </h3>
          {Object.entries(SEV_MAP).map(([k, v]) => {
            const count = data.filter(x => x.severity === k).length;
            const pct = data.length ? Math.round((count / data.length) * 100) : 0;
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
          {data.slice(0, 5).map(x => (
            <div key={x.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 0", borderBottom: "0.5px solid #f5f5f5",
            }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                <div style={{
                  fontSize: 13, color: "#222", fontWeight: 500,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {x.name || x.title}
                </div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{x.type}</div>
              </div>
              <Badge map={SEV_MAP} val={x.severity} />
            </div>
          ))}
          {data.length === 0 && (
            <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", paddingTop: 20 }}>
              Зөрчил байхгүй
            </div>
          )}
        </div>
      </div>
    </div>
  );
}