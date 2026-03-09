import React, { useState, useEffect, useCallback } from "react";
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
import "./notifications.css";

const API_BASE = "http://${API}/api";

// ── Icon + color per type ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  approved: { icon: <FaCheckCircle />, color: "approved", label: "Approved" },
  upload: { icon: <FaFileUpload />, color: "upload", label: "Upload" },
  new: { icon: <FaBullhorn />, color: "new", label: "New Scheme" },
  admin_action: {
    icon: <FaShieldAlt />,
    color: "action",
    label: "Admin Action",
  },
  student_corrected: {
    icon: <FaCheckCircle />,
    color: "corrected",
    label: "Student Reply",
  },
  general: { icon: <FaClock />, color: "general", label: "General" },
};

const ACTION_ICON = {
  under_review: <FaClock />,
  warning: <FaExclamationTriangle />,
  suspended: <FaLock />,
  blacklisted: <FaBan />,
  active: <FaUndo />,
};

const ACTION_COLOR = {
  under_review: "action-review",
  warning: "action-warning",
  suspended: "action-suspend",
  blacklisted: "action-blacklist",
  active: "action-restore",
};

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

// ── Admin Action Card ─────────────────────────────────────────────────────────
function AdminActionCard({ notif, token, onResponded }) {
  const [responding, setResponding] = useState(false);
  const [done, setDone] = useState(notif.adminAction?.responded || false);
  const [error, setError] = useState("");

  const action = notif.adminAction?.action || "";
  const reason = notif.adminAction?.reason || "";
  const canRespond = notif.adminAction?.canRespond && !done;
  const colorClass = ACTION_COLOR[action] || "action-review";

  const handleRespond = async () => {
    setResponding(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/student-notifications/${notif._id}/respond`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setDone(true);
      onResponded && onResponded(notif._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div
      className={`notif-card admin-action-card ${colorClass} ${!notif.read ? "unread" : ""}`}
    >
      <div className={`notif-icon action-icon ${colorClass}`}>
        {ACTION_ICON[action] || <FaShieldAlt />}
      </div>

      <div className="notif-content">
        <div className="notif-top">
          <strong>{notif.title}</strong>
          <span>{timeAgo(notif.createdAt)}</span>
        </div>

        {/* Body lines (split on \n) */}
        <div className="notif-body-lines">
          {notif.body
            .split("\n")
            .map((line, i) => (line.trim() ? <p key={i}>{line}</p> : null))}
        </div>

        {/* Reason box */}
        {reason && (
          <div className="notif-reason-box">
            <span className="reason-label">📋 Admin Reason:</span>
            <span className="reason-text">{reason}</span>
          </div>
        )}

        {/* Respond section */}
        {notif.adminAction?.canRespond && (
          <div className="notif-respond-section">
            {done ? (
              <div className="notif-responded-badge">
                <FaCheckCircle /> Response sent — Admin has been notified
              </div>
            ) : (
              <>
                <p className="notif-respond-prompt">
                  Have you corrected the issue mentioned above?
                </p>
                <button
                  className="notif-corrected-btn"
                  onClick={handleRespond}
                  disabled={responding}
                >
                  {responding ? "Sending..." : "✓ Yes, I have corrected it"}
                </button>
                {error && <p className="notif-respond-error">⚠ {error}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Student Corrected Card (shown to admin) ───────────────────────────────────
function StudentCorrectedCard({ notif }) {
  return (
    <div className={`notif-card corrected-card ${!notif.read ? "unread" : ""}`}>
      <div className="notif-icon corrected-icon">
        <FaCheckCircle />
      </div>
      <div className="notif-content">
        <div className="notif-top">
          <strong>{notif.title}</strong>
          <span>{timeAgo(notif.createdAt)}</span>
        </div>
        <p>{notif.body}</p>
        <div className="notif-student-badge">
          Sent by: <strong>{notif.senderName}</strong>
        </div>
      </div>
    </div>
  );
}

// ── Regular Notification Card ─────────────────────────────────────────────────
function RegularCard({ notif }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
  return (
    <div className={`notif-card ${notif.type} ${!notif.read ? "unread" : ""}`}>
      <div className={`notif-icon ${notif.type}`}>{cfg.icon}</div>
      <div className="notif-content">
        <div className="notif-top">
          <strong>{notif.title}</strong>
          <span>{timeAgo(notif.createdAt)}</span>
        </div>
        <p>{notif.body}</p>
      </div>
    </div>
  );
}

// ── Main Notifications Page ───────────────────────────────────────────────────
export default function Notifications() {
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
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

 const handleResponded = (id) => {
   setNotifications((prev) =>
     prev.map((n) =>
       n._id === id
         ? {
             ...n,
             adminAction: { ...n.adminAction, responded: true },
             read: true, // ✅ Marks as read
           }
         : n,
     ),
   );

   // ✅ CRITICAL: Notify Header to refresh badge
   window.dispatchEvent(new Event("notificationsUpdated"));
 };


  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const actionCount = notifications.filter(
    (n) => n.type === "admin_action",
  ).length;

  return (
    <div className="notif-page-bg">
      <div className="notif-panel">
        {/* Header */}
        <div className="notif-header">
          <div>
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className="notif-unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <button className="notif-refresh-btn" onClick={fetchNotifications}>
            ↻ Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="notif-tabs">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            All
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`green ${filter === "approved" ? "active" : ""}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("upload")}
            className={`red   ${filter === "upload" ? "active" : ""}`}
          >
            Upload Required
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`blue  ${filter === "new" ? "active" : ""}`}
          >
            New Schemes
          </button>
          <button
            onClick={() => setFilter("admin_action")}
            className={`orange ${filter === "admin_action" ? "active" : ""}`}
          >
            Admin Actions{" "}
            {actionCount > 0 && (
              <span className="tab-badge">{actionCount}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="notif-loading">
            <div className="notif-spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="notif-error">
            ⚠ {error} <button onClick={fetchNotifications}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <FaBullhorn />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map((notif) => {
              if (notif.type === "admin_action") {
                return (
                  <AdminActionCard
                    key={notif._id}
                    notif={notif}
                    token={token}
                    onResponded={handleResponded}
                  />
                );
              }
              if (notif.type === "student_corrected") {
                return <StudentCorrectedCard key={notif._id} notif={notif} />;
              }
              return <RegularCard key={notif._id} notif={notif} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
