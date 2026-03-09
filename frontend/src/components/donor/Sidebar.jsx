import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBarChart2 } from "react-icons/fi";

import {
  FiUser,
  FiFolder,
  FiPlusCircle,
  FiFileText,
  FiUsers,
  FiHelpCircle,
  FiLogOut,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiBookOpen,
  FiChevronDown,
  FiBell,
  FiSettings   
} from "react-icons/fi";

import logo from "../../assets/donor/logo.png";
import "./Sidebar.css"; // ⭐ Moved CSS

const DARK_COLORS = {
  profile: "#d6ff20ff",
 dashboard: "#3725fcff" ,  // 👈 example
  create: "#08dbbbff",
  schemes: "#f3bc07ff",
  apps: "#e15f7eff",
  donations: "#9976ecff",
  help: "#16b9c8ff",
  logout: "#e92323ff",
  notifications: "#FF6B6B",
  reports: "#FF9F43",
  settings: "#4CAF50",
};

const SUBTAB_COLORS = {
  active: "#f59b47ff",
  draft: "#00C9A7",
  closed: "#5d55f7ff",
  pending: "#FFC107",
  approved: "#129f52ff",
  rejected: "#f53838ff",
  specialRequests: "#966cdaff",
  donHistory: "#3FA7D6",
  donPending: "#F2711C",
};

const Separator = () => (
  <div
    style={{
      width: "100%",
      height: "1px",
      background: "rgba(255,255,255,0.10)",
      margin: "8px 0",
    }}
  />
);

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("");
  const [openSchemes, setOpenSchemes] = useState(false);
  const [openApps, setOpenApps] = useState(false);
  const [logoPressed, setLogoPressed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

const menuItem = (icon, label, key, toggle, colorKey) => {
  const isActive = active === key;
  const hoverColor = DARK_COLORS[colorKey] || "#79B8FF";

  return (
    <>
      <div
        onClick={() => {
          setActive(key);
          if (toggle) toggle();
          if (!toggle && window.innerWidth <= 768) {
  setSidebarOpen(false);
}
        }}
        style={{
          position: "relative",
          width: "100%",
          padding: "11px 18px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
          fontWeight: 600,
          transition: "0.22s",
          background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
          boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.20)" : "none",
          color: isActive ? "#ffffff" : "#E8F1F7",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.transform = "translateX(6px)";
            const ic = e.currentTarget.querySelector(".icon");
            ic.style.color = hoverColor;
            ic.style.transform = "scale(1.12)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateX(0)";
            const ic = e.currentTarget.querySelector(".icon");
            ic.style.color = "#C8D4DF";
            ic.style.transform = "scale(1)";
          }
        }}
      >
        {isActive && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "4px",
              height: "70%",
              borderRadius: "4px",
              background: "#0A64BC",
            }}
          />
        )}

        <span
          className="icon"
          style={{
            fontSize: "20px",
            transition: "0.22s",
            color: isActive ? "#ffffff" : "#C8D4DF",
          }}
        >
          {icon}
        </span>

        <span style={{ flex: 1 }}>{label}</span>

        {toggle && (
          <FiChevronDown
            style={{
              fontSize: "17px",
              color: "#D1E4F2",
              transition: "0.22s",
              transform:
                (key === "schemes" && openSchemes) ||
                (key === "applications" && openApps) ||
                (key === "donations" && openDon)
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
            }}
          />
        )}
      </div>

      <Separator />
    </>
  );
};

const subItem = (icon, label, key, path, colorKey) => {
  const isActive = active === key;
  const color = SUBTAB_COLORS[colorKey] || "#4D9FFF";

  return (
    <Link to={path} style={{ textDecoration: "none" }}>
      <div
onClick={() => {
  setActive(key);

  // Only close dropdowns on mobile
  if (window.innerWidth <= 768) {
    setOpenSchemes(false);
    setOpenApps(false);
    setSidebarOpen(false);
  }
}}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.transform = "translateX(6px)";
            const ic = e.currentTarget.querySelector(".subIcon");
            ic.style.color = color;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateX(0)";
            const ic = e.currentTarget.querySelector(".subIcon");
            ic.style.color = "#C9D6E1";
          }
        }}
        style={{
          width: "calc(100% - 40px)",
          marginLeft: "40px",
          padding: "9px 16px",
          borderRadius: "8px",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
          transition: "0.22s ease-out",
          background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
          borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
          color: isActive ? "#fff" : "#C9D6E1",
        }}
      >
        <span
          className="subIcon"
          style={{
            fontSize: "17px",
            transition: "0.22s ease-out",
            color: isActive ? color : "#C9D6E1",
          }}
        >
          {icon}
        </span>
        {label}
      </div>
    </Link>
  );
};

  return (
    <div
      id="donor-sidebar"
      className={`donor-sidebar ${sidebarOpen ? "open" : ""}`}
      style={{
        width: "270px",
        background: "#0a2940ff",
        height: "100vh",
        padding: "28px 20px",
        overflowY: "auto",
        color: "white",
      }}
    >
      {/* MOBILE CLOSE BUTTON */}
      <div
        className="mobile-close-btn"
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed",
          top: "15px",
          left: "235px",
          fontSize: "18px",
          fontWeight: "1200",
          cursor: "pointer",
          zIndex: 5000,
          display: "none",
          color: "white",
        }}
      >
        ✕
      </div>

      {/* LOGO + CLICK ANIMATION */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={logo}
          alt="VidyaSetu Logo"
          onClick={() => {
            setLogoPressed(true);
            setTimeout(() => {
              setLogoPressed(false);
              navigate("/donor/dashboard");
            }, 140);
          }}
          style={{
            width: "160px",
            marginBottom: "14px",
            cursor: "pointer",
            transform: logoPressed ? "scale(0.92)" : "scale(1)",
            transition: "transform 0.14s ease",
            filter:
              "drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,215,0,0.9))",
          }}
        />
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
          VidyaSetu
        </h2>
        <p style={{ margin: 0, opacity: 0.7, fontSize: "16px" }}>
          𝘉𝘳𝘪𝘥𝘨𝘪𝘯𝘨 𝘋𝘳𝘦𝘢𝘮𝘴 𝘵𝘰 𝘙𝘦𝘢𝘭𝘪𝘵𝘺
        </p>
      </div>

      <Link to="/donor/dashboard" style={{ textDecoration: "none" }}>
        {menuItem(<FiUser />, "Dashboard", "dashboard", null, "dashboard")}
      </Link>

      <Link to="/donor/profile" style={{ textDecoration: "none" }}>
        {menuItem(<FiUser />, "Profile", "profile", null, "profile")}
      </Link>

      <Link to="/donor/create-scheme" style={{ textDecoration: "none" }}>
        {menuItem(<FiPlusCircle />, "Create Scheme", "create", null, "create")}
      </Link>

      {menuItem(
        <FiFolder />,
        "My Schemes",
        "schemes",
        () => setOpenSchemes(!openSchemes),
        "schemes"
      )}

      {openSchemes && (
        <>
          {subItem(
            <FiLayers />,
            "Active Schemes",
            "active",
            "/donor/my-schemes/active",
            "active"
          )}
          {subItem(
            <FiClock />,
            "Draft Schemes",
            "draft",
            "/donor/my-schemes/draft",
            "draft"
          )}
          {subItem(
            <FiBookOpen />,
            "Closed Schemes",
            "closed",
            "/donor/my-schemes/closed",
            "closed"
          )}
        </>
      )}

      {menuItem(
        <FiFileText />,
        "Applications",
        "applications",
        () => setOpenApps(!openApps),
        "apps"
      )}

      {openApps && (
        <>
          {subItem(
            <FiClock />,
            "Pending",
            "pending",
            "/donor/applications/pending",
            "pending"
          )}
          {subItem(
            <FiCheckCircle />,
            "Approved",
            "approved",
            "/donor/applications/approved",
            "approved"
          )}
          {subItem(
            <FiXCircle />,
            "Rejected",
            "rejected",
            "/donor/applications/rejected",
            "rejected"
          )}
        </>
      )}
   <Link to="/donor/reports" style={{ textDecoration: "none" }}>
  {menuItem(
    <FiBarChart2 />,
    "Reports",
    "reports",
    null,
    "reports"
  )}
</Link>

<Link to="/donor/notifications" style={{ textDecoration: "none" }}>
  {menuItem(<FiBell />, "Notifications", "notifications", null, "notifications")}
</Link>

<Link to="/donor/settings" style={{ textDecoration: "none" }}>
  {menuItem(
    <FiSettings />,
    "Settings",
    "settings",
    null,
    "settings"
  )}
</Link>

      <Link to="/donor/help-support" style={{ textDecoration: "none" }}>
        {menuItem(<FiHelpCircle />, "Help & Support", "help", null, "help")}
      </Link>
      <div onClick={handleLogout}>
        {menuItem(<FiLogOut />, "Logout", "logout", null, "logout")}
      </div>
    </div>
  );
}
