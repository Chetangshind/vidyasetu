import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AdminView.css";

export default function AdminViewDonorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donor, setDonor] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchDonor();
  }, []);

  const fetchDonor = async () => {
    const res = await axios.get(
      `http://localhost:5050/api/admin/donors/${id}`
    );
    setDonor(res.data);
  };

  const confirmAction = async () => {
    if (!selectedAction) return;

    if (!reason.trim()) {
      alert("Enter valid reason");
      return;
    }

    try {
      // REVIEW
      if (selectedAction === "review") {
        if (!window.confirm("Move donor to Under Review?")) return;

        await axios.patch(
          `http://localhost:5050/api/admin/donors/${id}/review`,
          { reason }
        );
      }

      // WARNING
      if (selectedAction === "warn") {
        if (donor.warningCount >= 3) {
          alert("Donor already has 3 warnings.");
          return;
        }

        if (donor.warningCount === 2) {
          if (
            !window.confirm(
              "This is the 3rd warning. Account will be suspended. Continue?"
            )
          )
            return;
        } else {
          if (!window.confirm("Issue warning to this donor?")) return;
        }

        await axios.patch(
          `http://localhost:5050/api/admin/donors/${id}/warn`,
          { reason }
        );
      }

      // DIRECT SUSPEND
      if (selectedAction === "suspend") {
        if (!window.confirm("Suspend this donor account?")) return;

        await axios.patch(
          `http://localhost:5050/api/admin/donors/${id}/suspend`,
          { reason }
        );
      }

      // RESTORE
      if (selectedAction === "restore") {
        if (!window.confirm("Restore donor to Active?")) return;

        await axios.patch(
          `http://localhost:5050/api/admin/donors/${id}/active`,
          { reason }
        );
      }

      setReason("");
      setSelectedAction(null);
      fetchDonor();
    } catch (err) {
      console.log("Action failed", err);
    }
  };

  if (!donor) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="profile-container">
        <div className="profile-top">
          <span className={`status-badge ${donor.status?.toLowerCase().replace(" ", "-")}`}>
            {donor.status}
          </span>

          <span className="warning-count">
            Warnings: {donor.warningCount || 0}/3
          </span>
        </div>

        <div className="profile-header-card">
          <div className="profile-avatar">
            {donor.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h3>{donor.fullName}</h3>
            <p>{donor.email}</p>
          </div>
        </div>

        <div className="profile-row"><span>Phone</span><span>{donor.phone}</span></div>
        <div className="profile-row"><span>Gender</span><span>{donor.gender}</span></div>
        <div className="profile-row"><span>DOB</span><span>{donor.dob?.split("T")[0]}</span></div>
        <div className="profile-row"><span>City</span><span>{donor.city}</span></div>
        <div className="profile-row"><span>State</span><span>{donor.state}</span></div>
        <div className="profile-row"><span>Country</span><span>{donor.country}</span></div>
        <div className="profile-row"><span>Organization</span><span>{donor.organization}</span></div>
        <div className="profile-row"><span>Aadhaar</span><span>{donor.aadhaar}</span></div>
        <div className="profile-row"><span>PAN</span><span>{donor.pan}</span></div>
      </div>

      <h3 className="section-title">Choose Action</h3>

      <div className="action-grid">
        {[
          { key: "review", title: "Set Under Review", desc: "Investigate donor" },
          { key: "warn", title: "Issue Warning", desc: "Max 3 warnings" },
          { key: "suspend", title: "Suspend Account", desc: "Direct suspension" },
          { key: "restore", title: "Restore to Active", desc: "Clear flags" }
        ].map(item => (
          <div
            key={item.key}
            className={`action-card ${selectedAction === item.key ? "active" : ""}`}
            data-type={item.key}
            onClick={() => setSelectedAction(item.key)}
          >
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      {selectedAction && (
        <>
          <div className="reason-container">
            <textarea
              placeholder="Enter valid reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

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
              onClick={confirmAction}
              disabled={!reason.trim()}
            >
              Confirm & Log Action
            </button>
          </div>
        </>
      )}

      <button className="admin-back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}