import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiShield,
  FiBarChart2,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/admin/logo.png"; // ✅ use your admin logo
import "./Sidebar.css";
import API from "../../api";

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

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const [active, setActive] = useState("");
  const [logoPressed, setLogoPressed] = useState(false);
  const navigate = useNavigate();

  const menuItem = (icon, label, key, path) => {
    const isActive = active === key;

    return (
      <>
        <Link to={path} style={{ textDecoration: "none" }}>
          <div
            onClick={() => {
              setActive(key);
              if (window.innerWidth <= 768) setSidebarOpen(false);
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
              background: isActive
                ? "rgba(255,255,255,0.10)"
                : "transparent",
              boxShadow: isActive
                ? "0 4px 10px rgba(0,0,0,0.20)"
                : "none",
              color: isActive ? "#ffffff" : "#E8F1F7",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform =
                  "translateX(6px)";
                const ic =
                  e.currentTarget.querySelector(".icon");
                ic.style.color = "#79B8FF";
                ic.style.transform = "scale(1.12)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background =
                  "transparent";
                e.currentTarget.style.transform =
                  "translateX(0)";
                const ic =
                  e.currentTarget.querySelector(".icon");
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
                color: isActive
                  ? "#ffffff"
                  : "#C8D4DF",
              }}
            >
              {icon}
            </span>

            <span style={{ flex: 1 }}>{label}</span>
          </div>
        </Link>

        <Separator />
      </>
    );
  };

  return (
    <div
      id="admin-sidebar"
      className={`admin-sidebar ${
        sidebarOpen ? "open" : ""
      }`}
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

      {/* LOGO + CLICK ANIMATION (SAME AS STUDENT) */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={logo}
          alt=""
          onClick={() => {
            setLogoPressed(true);
            setTimeout(() => {
              setLogoPressed(false);
              navigate("/admin/dashboard");
            }, 140);
          }}
          style={{
            width: "160px",
            marginBottom: "14px",
            cursor: "pointer",
            transform: logoPressed
              ? "scale(0.92)"
              : "scale(1)",
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

      {menuItem(<FiHome />, "Dashboard", "dashboard", "/admin/dashboard")}
      {menuItem(<FiUsers />, "Students", "students", "/admin/students")}
      {menuItem(<FiFolder />, "Donors", "donors", "/admin/donors")}
      {menuItem(<FiShield />, "Gov Scheme Management", "schemes", "/admin/schemes")}
      {menuItem(
  <FiBarChart2 />,
  "Reports & Analytics",
  "reports",
  "/admin/reports"
)}
      {menuItem(<FiMessageCircle />, "Support Desk", "support", "/admin/support")}
      {menuItem(<FiSettings />, "Settings", "settings", "/admin/settings")}

      <div
        onClick={() => {
          localStorage.clear();
          navigate("/login");
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
          color: "#E8F1F7",
        }}
      >
        <span
          className="icon"
          style={{
            fontSize: "20px",
            transition: "0.22s",
            color: "#C8D4DF",
          }}
        >
          <FiLogOut />
        </span>

        <span style={{ flex: 1 }}>Logout</span>
      </div>

      <Separator />
    </div>
  );
}