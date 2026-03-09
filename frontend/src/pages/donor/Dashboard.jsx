import { useEffect, useState } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiLayers,
  FiFileText,
  FiAlertTriangle,
  FiActivity,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://${API}/api";

export default function DDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donorName, setDonorName] = useState("Donor");

  // ── Fetch dashboard stats ──────────────────────────────────
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/donor/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch donor name from profile ──────────────────────────
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/donor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.fullName) setDonorName(data.fullName);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  // ── Format currency ────────────────────────────────────────
  const formatINR = (amount) => {
    if (!amount && amount !== 0) return "₹ 0";
    return `₹ ${Number(amount).toLocaleString("en-IN")}`;
  };

  // ── Card builder ───────────────────────────────────────────
  const card = (title, value, icon, bgGradient, onClick) => (
    <div
      className="impact-card"
      onClick={onClick}
      style={{
        background: bgGradient,
        padding: "26px",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        cursor: onClick ? "pointer" : "default",
        transition: "0.25s",
        position: "relative",
        overflow: "hidden",
        color: "#0A2A43",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          right: "-5px",
          bottom: "-5px",
          fontSize: "72px",
          opacity: 0.12,
        }}
      >
        {icon}
      </div>

      {/* Icon box */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "26px", color: "#0A2A43" }}>{icon}</span>
      </div>

      <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>{title}</h3>
      <p style={{ fontSize: "15px", opacity: 0.8, margin: "4px 0 0" }}>
        {value}
      </p>
    </div>
  );

  // ── Skeleton loader ────────────────────────────────────────
  const skeleton = (bgGradient) => (
    <div
      style={{
        background: bgGradient,
        padding: "26px",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        minHeight: "130px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.5)",
          marginBottom: "14px",
        }}
      />
      <div
        style={{
          height: "18px",
          width: "60%",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.5)",
          marginBottom: "10px",
        }}
      />
      <div
        style={{
          height: "14px",
          width: "80%",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.35)",
        }}
      />
    </div>
  );

  const gradients = [
    "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
    "linear-gradient(135deg, #E1F5FE, #B3E5FC)",
    "linear-gradient(135deg, #E8EAF6, #C5CAE9)",
    "linear-gradient(135deg, #E0F7FA, #B2EBF2)",
    "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
    "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
  ];

  return (
    <div className="dashboard-wrapper" style={{ width: "100%" }}>
      {/* WELCOME CARD */}
      <div
        className="welcome-card"
        style={{
          background: "white",
          padding: "28px",
          borderRadius: "14px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
          marginBottom: "35px",
          borderLeft: "6px solid rgb(0, 95, 153)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "28px", color: "rgb(0,95,153)" }}>
            👋 Welcome Back, {donorName}
          </h2>
          <p
            style={{
              marginTop: "10px",
              fontSize: "16px",
              color: "#555",
              margin: "10px 0 0",
            }}
          >
            Thank you for your incredible contribution through VidyaSetu.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchStats}
          title="Refresh stats"
          style={{
            background: "rgb(0,95,153)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          <FiRefreshCw
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#FFF3F3",
            border: "1px solid #FFCDD2",
            borderRadius: "10px",
            padding: "14px 20px",
            color: "#C62828",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          ⚠️ {error} —{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={fetchStats}
          >
            Try again
          </span>
        </div>
      )}

      <h2
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "rgb(0,95,153)",
          marginBottom: "25px",
        }}
      >
        Your Impact Overview
      </h2>

      {/* GRID */}
      <div
        className="impact-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {loading ? (
          gradients.map((g, i) => <div key={i}>{skeleton(g)}</div>)
        ) : (
          <>
            {card(
              "Students Sponsored",
              `${stats?.studentsSponsored ?? 0} Students Supported`,
              <FiUsers />,
              gradients[0],
            )}
            {card(
              "Total Amount Donated",
              `${formatINR(stats?.totalDonated)} Donated`,
              <FiDollarSign />,
              gradients[1],
            )}
            {card(
              "Active Schemes",
              `${stats?.activeSchemes ?? 0} Schemes Running`,
              <FiLayers />,
              gradients[2],
            )}
            {card(
              "Special Requests",
              `${stats?.specialRequests ?? 0} Pending Applications`,
              <FiAlertTriangle />,
              gradients[3],
            )}
            {card(
              "Pending Applications",
              `${stats?.pendingApplications ?? 0} New Requests`,
              <FiClock />,
              gradients[4],
            )}
            {card(
              "Recent Activity",
              stats?.recentActivity || "No recent activity.",
              <FiActivity />,
              gradients[5],
            )}
          </>
        )}
      </div>
       
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dashboard-wrapper { padding: 10px !important; }
          .welcome-card h2 { font-size: 20px !important; }
          .welcome-card p { font-size: 14px !important; }
          .impact-card { padding: 16px !important; }
          .impact-card h3 { font-size: 16px !important; }
          .impact-card p { font-size: 13px !important; }
          .impact-card span { font-size: 20px !important; }
          h2 { font-size: 20px !important; }
          .impact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
