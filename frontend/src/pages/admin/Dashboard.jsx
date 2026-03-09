import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiAlertTriangle,
  FiClock,
  FiMessageCircle,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiActivity,
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiUserX,
  FiAlertOctagon,
  FiEye,
  FiSun,
  FiMoon,
  FiDownload,
  FiBell,
  FiMail,
  FiCalendar,
  FiLock,
  FiBarChart2,
} from "react-icons/fi";
import API from "../../api";

const API_BASE = API;

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ── Animated Counter ── */
function AnimCounter({ target, duration = 900 }) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <>{val.toLocaleString()}</>;
}

/* ── Trend Bar Chart ── */
function TrendBar({ data }) {
  if (!data?.length)
    return (
      <div
        style={{
          color: "#64748b",
          fontSize: 12,
          padding: "16px 0",
          textAlign: "center",
        }}
      >
        No data yet
      </div>
    );
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 72,
        paddingTop: 8,
      }}
    >
      {data.map((d, i) => {
        const h = Math.max((d.count / max) * 64, 4);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span
              style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}
            >
              {d.count}
            </span>
            <div
              title={`${d._id}: ${d.count}`}
              style={{
                width: "100%",
                height: h,
                background: "linear-gradient(180deg,#3b82f6 0%,#1d4ed8 100%)",
                borderRadius: "4px 4px 0 0",
                transition: "height .5s cubic-bezier(.34,1.56,.64,1)",
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: 9, color: "#94a3b8" }}>
              {d._id?.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Warning Progress Bar ── */
function WarnBar({ count, max = 3, color = "#f59e0b" }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 4,
            flex: 1,
            borderRadius: 4,
            background: i < count ? color : "#e2e8f0",
            transition: "background .3s",
          }}
        />
      ))}
    </div>
  );
}

/* ── Growth Badge ── */
function GrowthBadge({ pct }) {
  if (pct === undefined || pct === null) return null;
  const up = pct >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: up ? "#dcfce7" : "#fee2e2",
        color: up ? "#16a34a" : "#dc2626",
      }}
    >
      {up ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 200,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "3px solid #1e293b",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin .7s linear infinite",
        }}
      />
    </div>
  );
}

const RANGES = ["today", "week", "month"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ts, setTs] = useState(null);
  const [dark, setDark] = useState(false);
  const [range, setRange] = useState("today");
  const [notifOpen, setNotifOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetch_ = async (r = range) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/dashboard/stats?range=${r}`,
      );
      const json = await res.json();
      if (!json.success) throw new Error();
      setData(json.data);
      setTasks(
        (json.data.adminTasks || []).map((t) => ({ ...t, done: false })),
      );
      setTs(new Date().toLocaleTimeString());
      setError(null);
    } catch {
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_(range);
    const t = setInterval(() => fetch_(range), 60_000);
    return () => clearInterval(t);
  }, [range]);

  // ── Theme tokens ──
  const T = {
    bg: dark ? "#0f172a" : "#ffffff",
    card: dark ? "#1e293b" : "#ffffff",
    border: dark ? "#334155" : "#f1f5f9",
    text: dark ? "#f1f5f9" : "#0f172a",
    sub: dark ? "#94a3b8" : "#64748b",
    input: dark ? "#334155" : "#f8fafc",
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.6)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
    .dash{font-family:'DM Sans',sans-serif;background:${T.bg};min-height:100vh;transition:background .3s;}
    .dash::-webkit-scrollbar{display:none}
    .card{background:${T.card};border-radius:16px;padding:22px;
      box-shadow:${dark ? "0 1px 8px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)"};
      transition:box-shadow .2s,transform .2s,background .3s;animation:fadeUp .4s ease both;}
    .card:hover{box-shadow:${dark ? "0 8px 32px rgba(0,0,0,.6)" : "0 8px 32px rgba(0,0,0,.1)"};transform:translateY(-2px);}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;
      border:none;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
      cursor:pointer;transition:all .18s;}
    .btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15);}
    .range-btn{padding:6px 16px;border-radius:8px;border:1px solid ${T.border};
      background:${T.input};color:${T.sub};font-size:12px;font-weight:600;cursor:pointer;
      font-family:'DM Sans',sans-serif;transition:all .18s;text-transform:capitalize;}
    .range-btn.active{background:#2563eb;color:#fff;border-color:#2563eb;}
    .range-btn:hover:not(.active){background:${dark ? "#334155" : "#e2e8f0"};}
    .live-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;
      animation:pulse 1.5s ease infinite;display:inline-block;}
    .task-row{display:flex;align-items:center;gap:10px;padding:10px 12px;
      border-radius:10px;cursor:pointer;transition:background .15s;margin-bottom:6px;}
    .task-row:hover{background:${dark ? "#334155" : "#f8fafc"};}
    .timeline-item{display:flex;gap:10px;padding:9px 0;
      border-bottom:1px solid ${T.border};animation:slideIn .3s ease both;}
    .timeline-item:last-child{border-bottom:none;}
    .notif-dropdown{position:absolute;top:calc(100% + 8px);right:0;width:300px;
      background:${T.card};border-radius:14px;z-index:999;
      box-shadow:0 8px 32px rgba(0,0,0,.18);padding:16px;animation:fadeUp .2s ease both;}
    .stat-row{display:flex;align-items:center;justify-content:space-between;
      padding:11px 0;border-bottom:1px solid ${T.border};}
    .stat-row:last-child{border-bottom:none;}
    .security-row{display:flex;align-items:center;gap:10px;padding:10px 14px;
      border-radius:10px;margin-bottom:8px;}
  `;

  if (loading)
    return (
      <>
        <style>{CSS}</style>
        <div className="dash">
          <div
            style={{
              background: "linear-gradient(135deg,#1e3a5f,#2563eb)",
              padding: "36px 40px",
              color: "#fff",
            }}
          >
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>
              Admin Control Panel
            </h1>
            <p style={{ opacity: 0.6, marginTop: 4 }}>Loading…</p>
          </div>
          <Spinner />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <style>{CSS}</style>
        <div
          className="dash"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <div style={{ textAlign: "center", padding: 40 }}>
            <FiAlertOctagon size={40} color="#ef4444" />
            <p style={{ color: T.sub, marginTop: 12 }}>{error}</p>
            <button
              className="btn"
              onClick={() => fetch_(range)}
              style={{ background: "#2563eb", color: "#fff", marginTop: 16 }}
            >
              ↻ Retry
            </button>
          </div>
        </div>
      </>
    );

  const d = data;
  const al = d.alerts || {};
  const sm = d.smartMonitoring || {};
  const pe = d.pending || {};
  const co = d.communication || {};
  const gr = d.growth || {};

  const ACTIVITY_ICONS = {
    student_signup: "👤",
    donor_signup: "💼",
    application: "📄",
    support: "🎫",
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    w.document
      .write(`<html><head><title>VidyaSetu Dashboard Report</title></head><body>
      <h1>VidyaSetu Admin Dashboard — ${new Date().toLocaleDateString()}</h1>
      <h3>Overview</h3>
      <p>Total Students: ${d.totalStudents} | Total Donors: ${d.totalDonors} | Students Helped: ${d.studentsHelped}</p>
      <p>Total Donations: ${d.totalDonations} | Scholarships: ${d.scholarshipsDistributed}</p>
      <h3>Alerts</h3>
      <p>Donors with Warnings: ${al.donorsWithWarnings} | Suspended: ${al.donorsSuspended} | Under Review: ${al.donorsUnderReview}</p>
      <p>Schemes Under Review: ${al.schemesUnderReview} | Suspended Schemes: ${al.schemesSuspended}</p>
      <h3>Pending</h3>
      <p>Pending Applications: ${pe.pendingApplications} | Unresolved Tickets: ${pe.unresolvedTickets}</p>
    </body></html>`);
    w.print();
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dash" style={{ overflowY: "auto" }}>
        {/* ══ HEADER ══ */}
        <div
          style={{
            background: dark
              ? "linear-gradient(135deg,#0f172a,#1e3a5f)"
              : "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
            padding: "28px 40px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span className="live-dot" />
              <span
                style={{
                  color: "rgba(255,255,255,.55)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                Live Dashboard
              </span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              Admin Control Panel
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,.55)",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              VidyaSetu · Updated {ts}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {/* Range filters */}
            <div
              style={{
                display: "flex",
                gap: 6,
                background: "rgba(0,0,0,.2)",
                padding: 4,
                borderRadius: 10,
              }}
            >
              {RANGES.map((r) => (
                <button
                  key={r}
                  className={`range-btn${range === r ? " active" : ""}`}
                  onClick={() => {
                    setRange(r);
                    fetch_(r);
                  }}
                  style={{
                    background: range === r ? "#fff" : "transparent",
                    color: range === r ? "#2563eb" : "rgba(255,255,255,.7)",
                    borderColor: "transparent",
                  }}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                className="btn"
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  background: "rgba(255,255,255,.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,.2)",
                  position: "relative",
                }}
              >
                <FiBell size={14} />
                {(co.newTicketsToday || 0) > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {co.newTicketsToday}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="notif-dropdown" style={{ color: T.text }}>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}
                  >
                    🔔 Notifications
                  </div>
                  {[
                    {
                      icon: "🎫",
                      text: `${co.newTicketsToday || 0} new support tickets today`,
                    },
                    {
                      icon: "⚠️",
                      text: `${al.donorsWithWarnings || 0} donors with 2+ warnings`,
                    },
                    {
                      icon: "📌",
                      text: `${al.schemesUnderReview || 0} schemes under review`,
                    },
                    {
                      icon: "⏳",
                      text: `${pe.stuckApplications || 0} applications stuck >10 days`,
                    },
                  ].map((n, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: "8px 0",
                        borderBottom: `1px solid ${T.border}`,
                        fontSize: 12,
                        color: T.sub,
                      }}
                    >
                      <span>{n.icon}</span> {n.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              className="btn"
              onClick={() => setDark(!dark)}
              style={{
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.2)",
              }}
            >
              {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>

            {/* Export PDF */}
            <button
              className="btn"
              onClick={exportPDF}
              style={{
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.2)",
              }}
            >
              <FiDownload size={14} /> Export
            </button>

            {/* Alerts badge */}
            {(d.totalAlerts || 0) > 0 && (
              <div
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FiAlertTriangle size={13} /> {d.totalAlerts} Alerts
              </div>
            )}
          </div>
        </div>

        {/* ══ STAT STRIP ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 14,
            padding: "20px 40px 0",
          }}
        >
          {[
            {
              label: "Total Students",
              value: d.totalStudents,
              icon: <FiUsers size={16} />,
              color: "#2563eb",
            },
            {
              label: "Total Donors",
              value: d.totalDonors,
              icon: <FiShield size={16} />,
              color: "#7c3aed",
            },
            {
              label: "Students Helped",
              value: d.studentsHelped,
              icon: <FiCheckCircle size={16} />,
              color: "#16a34a",
            },
            {
              label: "Scholarships",
              value: d.scholarshipsDistributed,
              icon: <FiActivity size={16} />,
              color: "#d97706",
            },
            {
              label: "Open Tickets",
              value: pe.unresolvedTickets,
              icon: <FiMessageCircle size={16} />,
              color: "#dc2626",
            },
            {
              label: "Pending Apps",
              value: pe.pendingApplications,
              icon: <FiClock size={16} />,
              color: "#0891b2",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: "16px 18px", animationDelay: `${i * 0.06}s` }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.color,
                  marginBottom: 10,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: T.text,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                <AnimCounter target={s.value ?? 0} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.sub,
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ══ GROWTH COMPARISON ══ */}
        <div style={{ padding: "16px 40px 0" }}>
          <div className="card" style={{ animationDelay: "0.3s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <FiBarChart2 size={16} color="#2563eb" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                📊 Growth Comparison
              </h2>
              <span style={{ fontSize: 11, color: T.sub, marginLeft: 4 }}>
                vs previous period
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                {
                  label: `Students (${range})`,
                  value: gr.students?.current ?? 0,
                  pct: gr.students?.pct,
                  color: "#2563eb",
                },
                {
                  label: `Applications (${range})`,
                  value: gr.applications?.current ?? 0,
                  pct: gr.applications?.pct,
                  color: "#7c3aed",
                },
                {
                  label: `Schemes Created (${range})`,
                  value: gr.schemes?.current ?? 0,
                  pct: null,
                  color: "#16a34a",
                },
                {
                  label: "Donations Today",
                  value: d.donationsToday,
                  pct: null,
                  color: "#d97706",
                  isStr: true,
                },
              ].map((g, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    minWidth: 150,
                    padding: "14px 16px",
                    background: dark ? "#0f172a" : "#f8fafc",
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: T.sub,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {g.label}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: g.color,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {g.isStr ? g.value : <AnimCounter target={g.value} />}
                    </span>
                    {g.pct !== null && <GrowthBadge pct={g.pct} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ MAIN 3-COL GRID ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            padding: "16px 40px 0",
          }}
        >
          {/* ── ALERT PANEL ── */}
          <div className="card" style={{ animationDelay: "0.36s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#fef2f2",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiAlertOctagon size={15} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                🚨 Alert Panel
              </h2>
              {(d.totalAlerts || 0) > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "2px 9px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {d.totalAlerts}
                </span>
              )}
            </div>

            {[
          {
  icon: <FiAlertTriangle size={14} />,
  label: "Donors — 2+ Warnings",
  value: al.donorsWithWarnings,
  color: "#f59e0b",
  bg: "#fffbeb",
  path: "/admin/donors?filter=warnings",
},
             {
  icon: <FiUserX size={14} />,
  label: "Suspended Donors",
  value: al.donorsSuspended,
  color: "#ef4444",
  bg: "#fef2f2",
  path: "/admin/donors?filter=suspended",
},
{
  icon: <FiEye size={14} />,
  label: "Donors Under Review",
  value: al.donorsUnderReview,
  color: "#8b5cf6",
  bg: "#f5f3ff",
  path: "/admin/donors?filter=underreview",
},
 {
  icon: <FiFileText size={14} />,
  label: "Schemes Under Review",
  value: al.schemesUnderReview,
  color: "#0ea5e9",
  bg: "#f0f9ff",
  path: "/admin/donors?filter=scheme-underreview",
},
{
  icon: <FiXCircle size={14} />,
  label: "Suspended Schemes",
  value: al.schemesSuspended,
  color: "#ef4444",
  bg: "#fef2f2",
  path: "/admin/donors?filter=scheme-suspended",
},
            ].map((item, i) => (
              <div
                key={i}
                className="stat-row"
                onClick={() => navigate(item.path)}
                style={{ cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: T.text,
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>
                <span
  style={{
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 18,
    fontWeight: 700,
    color: (item.value || 0) > 0 ? item.color : T.sub,
  }}
>
  <AnimCounter target={item.value || 0} />
</span>
              </div>
            ))}

            {(d.totalAlerts || 0) === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 0",
                  color: "#22c55e",
                }}
              >
                <FiCheckCircle size={24} />
                <p style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                  All clear!
                </p>
              </div>
            )}
          </div>

          {/* ── SMART MONITORING ── */}
          <div className="card" style={{ animationDelay: "0.42s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#f0fdf4",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiActivity size={15} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                🧠 Smart Monitoring
              </h2>
            </div>

            {[
              {
                label: "Donors Near Suspension",
                value: sm.donorsNearSuspension,
                max: 3,
                color: "#f59e0b",
                sub: "2/3 warnings reached",
              },
              {
                label: "Schemes Near Closure",
                value: sm.schemesNearClosure,
                max: 3,
                color: "#ef4444",
                sub: "2/3 warnings reached",
              },
              {
                label: "Apps Pending > 7 Days",
                value: sm.stuckSevenDays,
                max: 10,
                color: "#8b5cf6",
                sub: "Need follow-up",
              },
              {
                label: "Suspicious Students",
                value: sm.suspiciousStudents,
                max: 5,
                color: "#dc2626",
                sub: "Flagged accounts",
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 12, fontWeight: 600, color: T.text }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 10, color: T.sub }}>{item.sub}</div>
                  </div>
                 <span
  style={{
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 18,
    fontWeight: 700,
    color: (item.value || 0) > 0 ? item.color : T.sub,
  }}
>
  <AnimCounter target={item.value || 0} />
</span>
                </div>
                <WarnBar
                  count={Math.min(item.value || 0, item.max)}
                  max={item.max}
                  color={item.color}
                />
              </div>
            ))}

            {/* Security Panel */}
            <div
              style={{
                marginTop: 8,
                paddingTop: 14,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.sub,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 10,
                }}
              >
                🔐 Security
              </div>
              {[
                {
                  label: "Flagged Student Accounts",
                  value: sm.suspiciousStudents,
                  icon: <FiLock size={13} />,
                  color: "#dc2626",
                },
                {
                  label: "Open Help Tickets",
                  value: co.openTickets,
                  icon: <FiMessageCircle size={13} />,
                  color: "#f59e0b",
                },
                {
                  label: "New Tickets Today",
                  value: co.newTicketsToday,
                  icon: <FiBell size={13} />,
                  color: "#3b82f6",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="security-row"
                  style={{
                    background:
                      (s.value || 0) > 0
                        ? `${s.color}10`
                        : dark
                          ? "#1e293b"
                          : "#f8fafc",
                  }}
                >
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: T.text, flex: 1 }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: (s.value || 0) > 0 ? s.color : T.sub,
                    }}
                  >
                    {s.value ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── ADMIN TASK MANAGER ── */}
          <div className="card" style={{ animationDelay: "0.48s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#eff6ff",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiCheckCircle size={15} color="#2563eb" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                📌 My Admin Tasks
              </h2>
              <span style={{ marginLeft: "auto", fontSize: 11, color: T.sub }}>
                {tasks.filter((t) => !t.done).length} remaining
              </span>
            </div>

            {tasks.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  color: "#22c55e",
                }}
              >
                <FiCheckCircle size={24} />
                <p style={{ fontSize: 12, marginTop: 6 }}>All tasks done! 🎉</p>
              </div>
            ) : (
              tasks.map((task, i) => {
                const priorityColor =
                  task.priority === "high"
                    ? "#ef4444"
                    : task.priority === "medium"
                      ? "#f59e0b"
                      : "#94a3b8";
                return (
                  <div
                    key={i}
                    className="task-row"
                    onClick={() => {
                      const updated = [...tasks];
                      updated[i] = { ...task, done: !task.done };
                      setTasks(updated);
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: `2px solid ${task.done ? "#22c55e" : T.border}`,
                        background: task.done ? "#22c55e" : "transparent",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .18s",
                      }}
                    >
                      {task.done && <FiCheckCircle size={11} color="#fff" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: task.done ? T.sub : T.text,
                          textDecoration: task.done ? "line-through" : "none",
                          fontWeight: 500,
                        }}
                      >
                        {task.label}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: task.done ? "#94a3b8" : priorityColor,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })
            )}

            {/* Communication panel */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 14,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.sub,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 10,
                }}
              >
                💬 Communication
              </div>
              {[
                {
                  icon: <FiMail size={13} />,
                  label: "Open Tickets",
                  value: co.openTickets,
                  color: "#ef4444",
                },
                {
                  icon: <FiMessageCircle size={13} />,
                  label: "New Today",
                  value: co.newTicketsToday,
                  color: "#f59e0b",
                },
                {
                  icon: <FiCalendar size={13} />,
                  label: "Stuck Apps",
                  value: pe.stuckApplications,
                  color: "#8b5cf6",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ color: c.color }}>{c.icon}</span>
                  <span style={{ fontSize: 12, color: T.text, flex: 1 }}>
                    {c.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 15,
                      fontWeight: 700,
                      color: (c.value || 0) > 0 ? c.color : T.sub,
                    }}
                  >
                    {c.value ?? 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.sub,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 10,
                }}
              >
                ⚡ Quick Actions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                }}
              >
                {[
                  {
                    label: "Add Gov Scheme",
                    emoji: "🏛️",
                    color: "#7c3aed",
                    bg: dark ? "#2d1b69" : "#f5f3ff",
                    path: "/admin/schemes",
                  },
                  {
                    label: "Review Donors",
                    emoji: "👁️",
                    color: "#2563eb",
                    bg: dark ? "#1e3a5f" : "#eff6ff",
                    path: "/admin/donors",
                  },
                  {
                    label: "View Reports",
                    emoji: "📊",
                    color: "#16a34a",
                    bg: dark ? "#14532d" : "#f0fdf4",
                    path: "/admin/reports",
                  },
                  {
                    label: "Open Tickets",
                    emoji: "🎫",
                    color: "#d97706",
                    bg: dark ? "#78350f" : "#fffbeb",
                    path: "/admin/support",
                  },
                ].map((btn, i) => (
                  <button
                    key={i}
                    className="btn"
                    onClick={() => navigate(btn.path)}
                    style={{
                      background: btn.bg,
                      color: btn.color,
                      fontSize: 11,
                      padding: "8px 10px",
                      justifyContent: "flex-start",
                    }}
                  >
                    {btn.emoji} {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM ROW: Activity + Trend ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: 16,
            padding: "16px 40px 40px",
          }}
        >
          {/* Activity Feed */}
          <div className="card" style={{ animationDelay: "0.54s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#fdf4ff",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiZap size={15} color="#a855f7" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                ⚡ Live Activity Feed
              </h2>
              <span className="live-dot" style={{ marginLeft: 4 }} />
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {!d.recentActivity?.length ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 0",
                    color: T.sub,
                    fontSize: 12,
                  }}
                >
                  No activity yet
                </div>
              ) : (
                d.recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="timeline-item"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div style={{ fontSize: 18, flexShrink: 0 }}>
                      {ACTIVITY_ICONS[item.type] || "•"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: T.text,
                          fontWeight: 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: T.sub,
                          marginTop: 2,
                          fontFamily: "monospace",
                        }}
                      >
                        {timeAgo(item.time)}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: item.color,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="card" style={{ animationDelay: "0.6s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#eff6ff",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiTrendingUp size={15} color="#2563eb" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                📈 Applications — 7 Days
              </h2>
            </div>
            <TrendBar data={d.weekTrend} />
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.sub,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 8,
                }}
              >
                Today's Snapshot
              </div>
              {[
                {
                  label: "Applications Today",
                  value: gr.applications?.current ?? 0,
                  color: "#2563eb",
                },
                {
                  label: "Students Today",
                  value: gr.students?.current ?? 0,
                  color: "#16a34a",
                },
                {
                  label: "Donations Today",
                  value: d.donationsToday,
                  color: "#d97706",
                  isStr: true,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontSize: 12, color: T.sub }}>{s.label}</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: s.color,
                      fontSize: 14,
                    }}
                  >
                    {s.isStr ? s.value : s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
