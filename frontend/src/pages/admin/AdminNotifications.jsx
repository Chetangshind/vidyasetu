import { useState, useEffect, useCallback } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaBullhorn,
  FaFileUpload,
  FaShieldAlt,
  FaExclamationTriangle,
  FaLock,
  FaBan,
  FaUndo,
} from "react-icons/fa";

const API_BASE = "http://localhost:5050/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Student replied "I have corrected it" → shows to admin
function StudentCorrectedCard({ notif }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        background: !notif.read ? "#f0fff8" : "white",
        border: `1px solid ${!notif.read ? "#1FD1A5" : "#e8edf2"}`,
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#1FD1A5,#0B9E7A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 18,
        }}
      >
        <FaCheckCircle />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <strong style={{ fontSize: 15, color: "#0B4E63" }}>{notif.title}</strong>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{timeAgo(notif.createdAt)}</span>
        </div>
        <p style={{ margin: "6px 0 8px", fontSize: 14, color: "#374151" }}>{notif.body}</p>
        {notif.senderName && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#e8f5e9", borderRadius: 20, padding: "4px 12px",
            fontSize: 13, color: "#1b5e20",
          }}>
            👤 <strong>{notif.senderName}</strong> has corrected the issue
          </div>
        )}
      </div>
    </div>
  );
}

// Generic notification card
function GeneralCard({ notif }) {
  const iconMap = {
    approved:    { icon: <FaCheckCircle />,       bg: "#e8f5e9", color: "#2e7d32" },
    upload:      { icon: <FaFileUpload />,         bg: "#fff3e0", color: "#e65100" },
    new:         { icon: <FaBullhorn />,           bg: "#e3f2fd", color: "#1565c0" },
    admin_action:{ icon: <FaShieldAlt />,          bg: "#fce4ec", color: "#880e4f" },
    general:     { icon: <FaClock />,             bg: "#f3f4f6", color: "#6b7280" },
  };
  const cfg = iconMap[notif.type] || iconMap.general;

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        background: !notif.read ? "#f8faff" : "white",
        border: `1px solid ${!notif.read ? "#3BAFDA" : "#e8edf2"}`,
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: cfg.bg, color: cfg.color,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}
      >
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <strong style={{ fontSize: 15, color: "#0B4E63" }}>{notif.title}</strong>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{timeAgo(notif.createdAt)}</span>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#374151" }}>{notif.body}</p>
      </div>
    </div>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/student-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load");

      // Mark all as read after fetching
      await fetch(`${API_BASE}/student-notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(data.notifications);

      // Tell header badge to reset
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const correctedCount = notifications.filter((n) => n.type === "student_corrected").length;

  const tabs = [
    { key: "all",               label: "All",               color: "#0B4E63" },
    { key: "student_corrected", label: "Student Replies",   color: "#1FD1A5", count: correctedCount },
    { key: "admin_action",      label: "Actions Sent",      color: "#f97316" },
    { key: "general",           label: "General",           color: "#6b7280" },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: "#0B4E63", fontWeight: 800 }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span style={{
              display: "inline-block", marginTop: 4,
              background: "#FF4757", color: "white",
              fontSize: 12, fontWeight: 700, borderRadius: 20,
              padding: "2px 10px",
            }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={fetchNotifications}
          style={{
            background: "#0B4E63", color: "white", border: "none",
            borderRadius: 8, padding: "8px 18px", cursor: "pointer",
            fontSize: 14, fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "7px 16px", borderRadius: 20, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: filter === tab.key ? tab.color : "#f1f5f9",
              color: filter === tab.key ? "white" : "#475569",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: filter === tab.key ? "rgba(255,255,255,0.3)" : "#FF4757",
                color: "white", borderRadius: "50%",
                minWidth: 18, height: 18, fontSize: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div style={{
            width: 36, height: 36, border: "3px solid #e2e8f0",
            borderTopColor: "#0B4E63", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          <p>Loading notifications...</p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: "center", padding: 40, color: "#ef4444",
          background: "#fef2f2", borderRadius: 12,
        }}>
          ⚠ {error}{" "}
          <button onClick={fetchNotifications} style={{ marginLeft: 8, color: "#0B4E63", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 60, color: "#94a3b8",
          background: "white", borderRadius: 12, border: "1px dashed #e2e8f0",
        }}>
          <FaBullhorn style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No notifications here.</p>
        </div>
      ) : (
        <div>
          {filtered.map((notif) =>
            notif.type === "student_corrected" ? (
              <StudentCorrectedCard key={notif._id} notif={notif} />
            ) : (
              <GeneralCard key={notif._id} notif={notif} />
            )
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
