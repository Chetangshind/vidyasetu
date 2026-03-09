import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AdminView.css";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "#16a34a",
    bg: "#dcfce7",
    icon: "●",
  },
  under_review: {
    label: "Under Review",
    color: "#eab308",
    bg: "#fef9c3",
    icon: "◑",
  },
  warning_issued: {
    label: "Warning Issued",
    color: "#f97316",
    bg: "#ffedd5",
    icon: "⚠",
  },
  suspended: {
    label: "Suspended",
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "🔒",
  },
  blacklisted: {
    label: "Blacklisted",
    color: "#71717a",
    bg: "#f4f4f5",
    icon: "⊘",
  },
};

const ACTION_STATUS_MAP = {
  review: "under_review",
  warn: "warning_issued",
  close: "suspended",
  active: "active",
};

export default function AdminViewDonorScheme() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [scheme, setScheme] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchScheme();
  }, []);

  const fetchScheme = async () => {
    const res = await axios.get(
      `http://localhost:5050/api/admin/schemes/${id}`
    );
    setScheme(res.data);
  };

  const executeAction = async () => {
    if (!selectedAction) return;

    try {
      // ================= ACTIVE =================
      if (selectedAction === "active") {
        if (!reason) {
          alert("Enter reason for activating scheme");
          return;
        }

        if (!window.confirm("Make this scheme Active?")) return;

        await axios.patch(
          `http://localhost:5050/api/admin/schemes/${id}/active`,
          { reason }
        );
      }

      // ================= UNDER REVIEW =================
      if (selectedAction === "review") {
        if (!reason) {
          alert("Enter reason for Under Review");
          return;
        }

        if (!window.confirm("Move scheme to Under Review?")) return;

        await axios.patch(
          `http://localhost:5050/api/admin/schemes/${id}/review`,
          { reason }
        );
      }

      // ================= WARNING =================
      if (selectedAction === "warn") {
        if (!reason) {
          alert("Enter reason for warning");
          return;
        }

        // 🚫 Already closed due to 3 warnings
        if (scheme.warningCount >= 3) {
          alert("This scheme is already closed due to 3 warnings.");
          return;
        }

        // ⚠ 3rd warning confirmation
        if (scheme.warningCount === 2) {
          if (
            !window.confirm(
              "This is the 3rd warning. Scheme will be closed. Continue?"
            )
          )
            return;
        } else {
          if (!window.confirm("Issue warning to this scheme?")) return;
        }

        await axios.patch(
          `http://localhost:5050/api/admin/schemes/${id}/warn`,
          { reason }
        );
      }

      // ================= CLOSE =================
      if (selectedAction === "close") {
        if (!reason) {
          alert("Enter reason for closing scheme");
          return;
        }

        if (
          !window.confirm(
            "Are you sure you want to close this scheme permanently?"
          )
        )
          return;

        await axios.patch(
          `http://localhost:5050/api/admin/schemes/${id}/close`,
          { reason }
        );
      }

      setReason("");
      setSelectedAction(null);
      fetchScheme();
    } catch (err) {
      console.log("Action failed", err);
    }
  };

  if (!scheme) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="profile-container">
  <div className="profile-top">
    <span className={`status-badge ${scheme.status?.toLowerCase()}`}>
      {scheme.status}
    </span>

    <span className="warning-count">
      Warnings: {scheme.warningCount || 0}/3
    </span>
  </div>

  <div className="profile-header-card">
    <div className="profile-avatar">
      {scheme.schemeName?.charAt(0).toUpperCase()}
    </div>

    <div className="profile-header-info">
      <h3>{scheme.schemeName}</h3>
      <p>₹ {scheme.scholarshipAmount}</p>
    </div>
  </div>

  {/* 🔥 FULL DETAILS SEQUENTIAL */}

  <div className="profile-row">
    <span>Description</span>
    <span>{scheme.description}</span>
  </div>

  <div className="profile-row">
    <span>Scholarship Amount</span>
    <span>₹ {scheme.scholarshipAmount}</span>
  </div>

  <div className="profile-row">
    <span>Income Limit</span>
    <span>{scheme.incomeLimit}</span>
  </div>

  <div className="profile-row">
    <span>Education Level</span>
    <span>{scheme.educationLevel}</span>
  </div>

  <div className="profile-row">
    <span>Age Limit</span>
    <span>{scheme.ageLimit}</span>
  </div>

  <div className="profile-row">
    <span>Category</span>
    <span>{scheme.category}</span>
  </div>

  <div className="profile-row">
    <span>Gender Preference</span>
    <span>{scheme.gender || "No Preference"}</span>
  </div>

  <div className="profile-row">
    <span>Deadline</span>
    <span>{scheme.deadline}</span>
  </div>

  <div className="profile-row">
    <span>Documents Required</span>
    <span>
      {scheme.documents?.length
        ? scheme.documents.join(", ")
        : "None"}
    </span>
  </div>

  <div className="profile-row">
    <span>Additional Conditions</span>
    <span>{scheme.extraConditions || "None"}</span>
  </div>
</div>

      <h3 className="section-title">Choose Action</h3>

<div className="action-grid">

  <div
    className={`action-card ${selectedAction === "review" ? "active" : ""}`}
    data-type="review"
    onClick={() => setSelectedAction("review")}
  >
    <h4>Set Under Review</h4>
    <p>Investigate scheme</p>
  </div>

  <div
    className={`action-card ${selectedAction === "warn" ? "active" : ""}`}
    data-type="warn"
    onClick={() => setSelectedAction("warn")}
  >
    <h4>Issue Warning</h4>
    <p>Max 3 warnings</p>
  </div>

  <div
    className={`action-card ${selectedAction === "close" ? "active" : ""}`}
    data-type="close"
    onClick={() => setSelectedAction("close")}
  >
    <h4>Suspend Scheme</h4>
    <p>Direct suspension</p>
  </div>

  <div
    className={`action-card ${selectedAction === "active" ? "active" : ""}`}
    data-type="active"
    onClick={() => setSelectedAction("active")}
  >
    <h4>Restore to Active</h4>
    <p>Clear flags</p>
  </div>

</div>

{selectedAction && (
  <div className="reason-container">
    <textarea
      placeholder="Enter valid reason..."
      value={reason}
      onChange={(e) => setReason(e.target.value)}
    />

    <div className="modal-buttons">
      <button
        className="admin-cancel-btn"
        onClick={() => {
          setSelectedAction(null);
          setReason("");
        }}
      >
        Cancel
      </button>

      <button
        className="admin-confirm-btn"
        onClick={executeAction}
        disabled={!reason}
      >
        Confirm & Log Action
      </button>
    </div>
  </div>
)}
      <button className="admin-back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}