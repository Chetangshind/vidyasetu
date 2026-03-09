import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiHelpCircle, FiLogOut } from "react-icons/fi";
import "./Header.css";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (!parts[0]) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function Header({ openSidebar }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const initials = getInitials(user.name);

useEffect(() => {
  if (!user?.id) return;

  fetchUnreadCount();

  const interval = setInterval(fetchUnreadCount, 5000);

  // 👇 listen when notifications marked read
  window.addEventListener("notificationsUpdated", fetchUnreadCount);

  return () => {
    clearInterval(interval);
    window.removeEventListener("notificationsUpdated", fetchUnreadCount);
  };
}, [user]);

const fetchUnreadCount = async () => {
  try {
    const donorId = user.id;   // ✅ use id not _id

    if (!donorId) return;

    const res = await fetch(
      `${API}/api/donor-notifications/unread/count/${donorId}`
    );

    const data = await res.json();
    setUnreadCount(data.count || 0);
  } catch (err) {
    console.error("Error fetching notification count", err);
  }
};

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
         {/* HAMBURGER */}
    <div className="mobile-hamburger" onClick={openSidebar}>
      <div className="line"></div>
      <div className="line short"></div>
    </div>
        <div className="title">Donor Portal</div>
        <div className="subtitle">Scholarship Dashboard · Donor View</div>
      </div>

      <div className="header-right">
        {/* 🔔 Notification Bell */}
        <div
  className="icon-btn notification-wrapper"
  onClick={() => navigate("/donor/notifications")}
>
  <FiBell size={18} />

  {unreadCount > 0 && (
    <span className="notification-badge">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</div>

        <div className="icon-btn">
          <FiHelpCircle />
        </div>

        <div className="divider" />

        <div className="user-area" onClick={() => setOpenMenu(!openMenu)}>
          <div className="avatar">{initials}</div>

          <div className="user-info">
            <span className="name">{user.name || "User"}</span>
            <span className="email">{user.email}</span>
          </div>

          <span className={`caret ${openMenu ? "open" : ""}`}>▼</span>

          <div className={`user-dropdown ${openMenu ? "open" : ""}`}>
            <div
              className="dropdown-item"
              onClick={() => navigate("/donor/profile")}
            >
              Profile
            </div>

            <div className="dropdown-item logout" onClick={logout}>
              <FiLogOut /> Logout
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}