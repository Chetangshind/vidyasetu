import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiHelpCircle, FiLogOut } from "react-icons/fi";

const API_BASE = `${API}/api`;

export default function AdminHeader({ openSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const initials = (user.name || "A")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join("");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ── Fetch unread count ──────────────────────────────────────────────────────
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/student-notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.count);
    } catch (_) {}
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds
    intervalRef.current = setInterval(fetchUnreadCount, 30000);

    // Also re-fetch when student sends a correction (same-browser dev scenario)
    window.addEventListener("notificationsUpdated", fetchUnreadCount);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("notificationsUpdated", fetchUnreadCount);
    };
  }, [token]);

  const headerMap = {
    "/admin/dashboard": { title: "Administrative Panel", subtitle: "Dashboard Overview" },
    "/admin/students":  { title: "Administrative Panel", subtitle: "Student Management" },
    "/admin/donors":    { title: "Administrative Panel", subtitle: "Donor Management" },
    "/admin/schemes":   { title: "Administrative Panel", subtitle: "Government Scheme Management" },
    "/admin/reports":   { title: "Administrative Panel", subtitle: "Reports & Analytics" },
    "/admin/support":   { title: "Administrative Panel", subtitle: "Support Desk" },
    "/admin/settings":  { title: "Administrative Panel", subtitle: "System Settings" },
  };

  const currentHeader =
    headerMap[location.pathname] || { title: "Administrative Panel", subtitle: "Dashboard Overview" };

  return (
    <div
      className="admin-header"
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #0E5A6F 0%, #0B4E63 55%, #093F52 100%)",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          className="mobile-hamburger"
          onClick={openSidebar}
          style={{ display: "none", cursor: "pointer", padding: "4px 6px" }}
        >
          <div style={{ width: "26px", height: "3px", background: "white", borderRadius: "4px", marginBottom: "6px" }} />
          <div style={{ width: "20px", height: "3px", background: "white", borderRadius: "4px" }} />
        </div>

        <div className="header-left" style={{ display: "flex", flexDirection: "column", color: "white" }}>
          <span style={{ fontSize: "21px", fontWeight: 800, letterSpacing: "0.3px" }}>
            {currentHeader.title}
          </span>
          <span
            key={currentHeader.subtitle}
            style={{ fontSize: "13px", color: "rgba(230,245,248,0.9)", marginTop: 2, animation: "fadeSlide 0.35s ease" }}
          >
            {currentHeader.subtitle}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div
        className="header-right"
        style={{ display: "flex", alignItems: "center", gap: "18px", color: "white", whiteSpace: "nowrap" }}
      >
        {/* 🔔 Bell with badge */}
        <div
          onClick={() => navigate("/admin/notifications")}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.25s ease", position: "relative",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(31,209,165,0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <FiBell style={{ fontSize: "18px" }} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: "-4px", right: "-4px",
              background: "#FF4757", color: "white",
              fontSize: "10px", fontWeight: 700,
              borderRadius: "50%", minWidth: "17px", height: "17px",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #0B4E63", lineHeight: 1,
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        <div
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(31,209,165,0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <FiHelpCircle style={{ fontSize: "18px" }} />
        </div>

        <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.35)" }} />

        {/* USER AREA */}
        <div
          className="user-area"
          onClick={() => setOpenMenu((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            cursor: "pointer", color: "white", fontWeight: 600, position: "relative",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #1FD1A5, #3BAFDA)",
            color: "#00323F", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.35)", fontSize: "14px",
          }}>
            {initials}
          </div>

          <div style={{ display: "flex", flexDirection: "column", fontSize: "13px", lineHeight: 1.1 }}>
            <span>{user.name || "Admin User"}</span>
            <span style={{ fontSize: "11px", opacity: 0.85 }}>{user.email || "Admin Account"}</span>
          </div>

          <span style={{ fontSize: "14px" }}>▼</span>

          {openMenu && (
            <div style={{
              position: "absolute", top: "48px", right: 0,
              background: "white", color: "#222", borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)", minWidth: "160px", overflow: "hidden",
            }}>
              <div style={{ padding: "10px 14px", cursor: "pointer" }} onClick={() => navigate("/admin/settings")}>
                Settings
              </div>
              <div style={{ padding: "10px 14px", cursor: "pointer", color: "red" }} onClick={logout}>
                <FiLogOut /> Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 0.85; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </div>
  );
}
