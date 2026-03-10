import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiHelpCircle, FiLogOut } from "react-icons/fi";
import API from "../../api";

const API_BASE = `${API}/api`;

export default function Header({ openSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const initials = (user.name || "S")
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

    // Poll every 30 seconds for new notifications from admin
    intervalRef.current = setInterval(fetchUnreadCount, 30000);

    // Re-fetch when notification is marked as responded (local event)
    window.addEventListener("notificationsUpdated", fetchUnreadCount);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("notificationsUpdated", fetchUnreadCount);
    };
  }, [token]);

  const headerMap = {
  "/student/dashboard": "Student Dashboard",
  "/student/profile": "Profile",
  "/student/schemes": "Available Schemes",
  "/student/applied": "Applied Schemes",
  "/student/expenses": "Expenses Tracking",
  "/student/guidelines": "Guidelines",
  "/student/notifications": "Notifications",
  "/student/help": "Help & Support",
};

const currentTitle =
  headerMap[location.pathname] || "Student Dashboard";

  const pageMap = {
  "/student/dashboard": "Dashboard Overview",
  "/student/profile": "Profile",
  "/student/schemes": "Available Schemes",
  "/student/applied": "Applied Schemes",
  "/student/expenses": "Expenses Tracking",
  "/student/guidelines": "Guidelines",
  "/student/notifications": "Notifications",
  "/student/help": "Help & Support",
};

const currentPage = pageMap[location.pathname] || "Dashboard Overview";

  return (
    <div
      className="student-header"
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
      {/* LEFT SECTION */}
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
<div className="header-title">
<span className="desktop-title">Student Dashboard</span>
<span className="mobile-title">Student Dashboard</span>
  <div
    style={{
      fontSize: "13px",
      color: "rgba(230,245,248,0.9)",
      marginTop: "2px"
    }}
  >
    {currentPage}
  </div>
</div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="header-right"
        style={{ display: "flex", alignItems: "center", gap: "18px", color: "white", whiteSpace: "nowrap" }}
      >
        {/* 🔔 Bell with badge */}
        <div
          onClick={() => navigate("/student/notifications")}
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
          <div
            className="avatar"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #1FD1A5, #3BAFDA)",
              color: "#00323F", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.35)", fontSize: "14px",
            }}
          >
            {initials}
          </div>

          <div
            className="user-info"
            style={{ display: "flex", flexDirection: "column", fontSize: "13px", lineHeight: 1.1 }}
          >
            <span className="name">{user.name || "Student User"}</span>
            <span className="email" style={{ fontSize: "11px", opacity: 0.85 }}>
              {user.email || "Student Account"}
            </span>
          </div>

          <span className={`caret ${openMenu ? "open" : ""}`} style={{ fontSize: "14px" }}>▼</span>

          <div className={`user-dropdown ${openMenu ? "open" : ""}`}>
            <div className="dropdown-item" onClick={() => navigate("/student/profile")}>
              Profile
            </div>
            <div className="dropdown-item logout" onClick={logout}>
              <FiLogOut /> Logout
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 0.85; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .student-header { padding: 8px 12px !important; height: 58px !important; position: relative !important; }
          .mobile-hamburger { display: block !important; }
.header-left{
  text-align:left !important;
  width:auto !important;
}
          .header-right { margin-left: auto !important; display: flex !important; align-items: center !important; gap: 10px !important; }
          .header-user { display: none !important; }
        }

.desktop-title{
  display:inline;
  color:#ffffff;
}

.mobile-title{
  display:none;
}
@media (max-width:1024px){

  .desktop-title{
    font-size:16px;
  }

  .header-title div{
    font-size:12px;
  }

}
@media (max-width:768px){

  .desktop-title{
    display:none;
  }

  .mobile-title{
    display:inline;
    font-size:16px;
    font-weight:800;
  }

  .header-title{
  color:white;
}
  
.header-title{
  display:flex;
  flex-direction:column;
  line-height:1.2;
}

.desktop-title{
  font-size:18px;
  font-weight:700;
  white-space:nowrap;
}

.header-title div{
  font-size:13px;
  opacity:0.9;
  white-space:nowrap;
}

.header-left{
  max-width:60%;
  overflow:hidden;
}

.desktop-title,
.header-title div{
  text-overflow:ellipsis;
  overflow:hidden;
}
}
      `}</style>
    </div>
  );
}
