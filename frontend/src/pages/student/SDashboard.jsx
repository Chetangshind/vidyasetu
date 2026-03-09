import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementBar from "../../components/student/AnnouncementBar.jsx";
import {
  FiCheckCircle,
  FiClock,
  FiBell,
  FiFileText,
  FiUser,
} from "react-icons/fi";
import API from "../../api";

export default function SDashboard() {
  const navigate = useNavigate();

  const headingStyle = {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0A2D57",
    marginBottom: "18px",
  };

  const [sections, setSections] = useState([
    { key: "personal", label: "Personal Info", percent: 0, color: "#1A73E8" },
    { key: "address", label: "Address Info", percent: 0, color: "#D84343" },
    { key: "other", label: "Other Info", percent: 0, color: "#8E24AA" },
    { key: "courseList", label: "Current Course", percent: 0, color: "#43A047" },
    { key: "qualificationRecords", label: "Past Qualification", percent: 0, color: "#FB8C00" },
    { key: "collegeBank", label: "College Bank", percent: 0, color: "#009688" },
    { key: "hostelRecords", label: "Hostel Details", percent: 0, color: "#6D4C41" },
  ]);

  const [studentName, setStudentName] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  const [stats, setStats] = useState({
    totalApplied: 0,
    approved: 0,
    pending: 0,
    unreadNotifications: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  /* ================= PROFILE FETCH ================= */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API}/api/student/profile`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.profile) {
        const updated = sections.map((s) => ({
          ...s,
          percent:
            data.profile[s.key] &&
            Object.keys(data.profile[s.key]).length > 0
              ? 100
              : 0,
        }));
        setSections(updated);
      }
    });
}, []);

/* ================= SUMMARY FETCH ================= */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const fetchSummary = async () => {
    try {
      const res = await fetch(
        `${API}/api/student/dashboard-summary`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setStudentName(data.studentName || "");
        setVerificationStatus(data.verificationStatus || "");
        setStats({
          totalApplied: data.stats?.totalApplied || 0,
          approved: data.stats?.approved || 0,
          pending: data.stats?.pending || 0,
          unreadNotifications: data.stats?.unreadNotifications || 0,
        });
        setRecentActivity(data.recentActivity || []);
      }
    } catch (err) {
      console.error("Dashboard summary error:", err);
    }
  };

  fetchSummary();
}, [sections]);

  const totalCompletion = Math.round(
    sections.reduce((a, b) => a + b.percent, 0) / sections.length
  );

  return (
    <div
      style={{
        padding: "36px",
        minHeight: "100vh",
        background: "#ffffff",
      }}
    >
      <AnnouncementBar />

      {/* ================= WELCOME ================= */}
      <div
        style={{
          marginTop: 20,
          padding: 36,
          borderRadius: 30,
          background:
            "linear-gradient(135deg,#1A73E8,#4F8CFF,#6C63FF)",
          color: "white",
          boxShadow: "0 30px 80px rgba(26,115,232,0.35)",
        }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 800 }}>
          👋 Welcome back, {studentName}
        </h2>
        <p style={{ marginTop: 8 }}>
          Stay updated with your scholarship progress.
        </p>
      </div>

      {/* ================= PROFILE COMPLETION ================= */}
      <div
        style={{
          marginTop: 40,
          background: "white",
          padding: 32,
          borderRadius: 28,
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={headingStyle}>Profile Completion</h2>

        {/* MAHADBT STYLE BAR */}
        <div
          style={{
            height: 24,
            background: "#e5eaf5",
            borderRadius: 999,
            overflow: "hidden",
            position: "relative",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: `${totalCompletion}%`,
              height: "100%",
              background:
                "linear-gradient(90deg,#1A73E8,#4F8CFF,#6C63FF)",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              transition: "1s ease",
            }}
          >
            {totalCompletion}%
          </div>
        </div>

        {sections.map((s) => {
          const done = s.percent === 100;
          return (
            <div
              key={s.key}
              style={{
                marginBottom: 14,
                padding: 18,
                borderRadius: 18,
                background: done
                  ? "linear-gradient(135deg,#e8f5e9,#f1f8e9)"
                  : "#f9fbff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: `6px solid ${s.color}`,
                transition: "0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateX(6px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateX(0px)")
              }
            >
              <span style={{ fontWeight: 700 }}>{s.label}</span>
              <button
                onClick={() =>
                  navigate("/student/profile", {
                    state: { stepKey: s.key },
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: s.color,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {done ? "View" : "Fill"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= QUICK STATS ================= */}
      <div
        style={{
          marginTop: 50,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 30,
        }}
      >
        {[
  {
    label: "Total Applications",
    value: stats.totalApplied,
    icon: <FiFileText />,
    color: "#1A73E8",
    path: "/student/my-applied-schemes",
  },
  {
    label: "Approved",
    value: stats.approved,
    icon: <FiCheckCircle />,
    color: "#16A34A",
    path: "/student/scheme-history",
  },
  {
    label: "Pending",
    value: stats.pending,
    icon: <FiClock />,
    color: "#F59E0B",
    path: "/student/my-applied-schemes",
  },
  {
    label: "Notifications",
    value: stats.unreadNotifications,
    icon: <FiBell />,
    color: "#EC4899",
    path: "/student/notifications",
  },
].map((item, i) => (
          <div
            key={i}
            style={{
              padding: 30,
              borderRadius: 24,
              background: "white",
              boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
              transition: "0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-10px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0px)")
            }
          >
            <div style={{ fontSize: 26, color: item.color }}>
              {item.icon}
            </div>
            <h3 style={{ fontSize: 32, marginTop: 12 }}>
              {item.value}
            </h3>
            <p style={{ marginTop: 6, color: "#64748B", fontWeight: 600 }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
        
      {/* ================= RECENT ACTIVITY ================= */}
      <div
        style={{
          marginTop: 50,
          background: "white",
          padding: 32,
          borderRadius: 28,
          boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={headingStyle}>Recent Activity</h2>

        {recentActivity.length === 0 ? (
          <p style={{ color: "#94A3B8" }}>No recent activity</p>
        ) : (
          recentActivity.slice(0, 3).map((act, i) => (
            <div
              key={i}
              style={{
                padding: 16,
                borderLeft: "5px solid #1A73E8",
                background: "#f9fbff",
                marginBottom: 14,
                borderRadius: 10,
              }}
            >
              {act}
            </div>
          ))
        )}
      </div>

    </div>
  );
}