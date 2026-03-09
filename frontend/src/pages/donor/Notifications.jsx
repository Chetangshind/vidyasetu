import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaUndo,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import "./Notifications.css";

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";
  return Math.floor(seconds / 86400) + " day ago";
}

export default function DonorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchNotifications();
  markAllAsRead();   // ✅ CALL IT HERE
}, []);

  const markAllAsRead = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const donorId = user._id || user.id;

    await axios.patch(
      `http://localhost:5050/api/donor-notifications/read-all/${donorId}`
    );

    // 🔥 Tell header to refresh unread count
    window.dispatchEvent(new Event("notificationsUpdated"));
  } catch (err) {
    console.log(err);
  }
};

  const fetchNotifications = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const donorId = user._id || user.id;

      const res = await axios.get(
        `http://localhost:5050/api/donor-notifications/${donorId}`
      );

      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications =
    selectedCategory === "all"
      ? notifications
      : notifications.filter((n) => n.entity === selectedCategory);

const getIcon = (type) => {
  switch (type) {
    case "warning":
      return <FaExclamationTriangle />;
    case "approved":
      return <FaCheckCircle />;
    case "closed":
    case "suspended":
      return <FaBan />;
    case "restored":
      return <FaUndo />;
    case "review":
      return <FaSearch />;

    // 🔵 Query Raised
    case "query_raised":
      return <FaSearch />;

    // 🟢 Query Resolved
    case "query_resolved":
      return <FaCheckCircle />;

    default:
      return <FaBell />;
  }
};

const getClass = (type) => {
  switch (type) {
    case "warning":
      return "notif-warning";

    case "approved":
    case "restored":
      return "notif-success";

    case "closed":
    case "suspended":
      return "notif-danger";

    case "review":
      return "notif-review";

    // 🔵 Query Raised
    case "query_raised":
      return "notif-query";

    // 🟢 Query Resolved
    case "query_resolved":
      return "notif-success";

    default:
      return "notif-default";
  }
};

  return (
    <div className="notifications-root">
      <h1 className="page-title">Your Notifications</h1>
      <p className="page-sub">
        All important updates regarding your account and schemes.
      </p>

      <div className="category-tabs">
        <button
          className={`category-btn ${
            selectedCategory === "all" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>

        <button
          className={`category-btn ${
            selectedCategory === "account" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("account")}
        >
          Account
        </button>

        <button
          className={`category-btn ${
            selectedCategory === "scheme" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("scheme")}
        >
          Scheme
        </button>

        <button
  className={`category-btn ${
    selectedCategory === "query" ? "active" : ""
  }`}
  onClick={() => setSelectedCategory("query")}
>
  Query
</button>

      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : filteredNotifications.length === 0 ? (
        <div className="notes-box">
          <p>No notifications available.</p>
        </div>
      ) : (
        <div className="notification-list">
          {filteredNotifications.map((note) => (
            <div
              key={note._id}
              className={`notification-card ${getClass(note.type)}`}
            >
              <div className="notification-icon">
                {getIcon(note.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h4>{note.title}</h4>
                  <span>{timeAgo(note.createdAt)}</span>
                </div>

                <p className="notification-description">
                  {note.message}
                </p>

                {/* Query Raised Status Box */}
{/* 🔵 Query Raised → Show Pending Status */}
{note.type === "query_raised" && (
  <div className="notification-status-box pending">
    <strong>Status:</strong> Pending
  </div>
)}

{/* 🟢 Query Resolved → Show Admin Reason */}
{note.type === "query_resolved" && note.reason && (
  <div className="notification-reason">
    <strong>Admin Reason:</strong> {note.reason}
  </div>
)}

{/* 🟠 Other Notifications (except Scheme Expired) */}
{note.type !== "query_raised" &&
 note.type !== "query_resolved" &&
 note.title !== "Scheme Expired" &&
 note.reason && (
  <div className="notification-reason">
    <strong>Admin Reason:</strong> {note.reason}
  </div>
)}

{/* 🔴 Scheme Expired → Show Deadline */}
{note.title === "Scheme Expired" && note.reason && (
  <div className="notification-deadline-box">
    <strong>Deadline was: </strong> {note.reason.replace("Deadline was ", "")}
  </div>
)}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}