import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ActiveSchemes.css";
import API from "../../../api";

export default function ActiveSchemes() {
  const navigate = useNavigate();
  const [activeSchemes, setActiveSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);

  useEffect(() => {
    fetchActiveSchemes();
  }, []);

  const fetchActiveSchemes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/api/schemes/my?status=active`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setActiveSchemes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching active schemes:", error);
      setActiveSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const goToCreate = (scheme) => {
    navigate("/donor/create-scheme", {
      state: { scheme, mode: "edit" },
    });
  };

  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/api/schemes/${selectedSchemeId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setShowCancelModal(false);
      setSelectedSchemeId(null);
      fetchActiveSchemes();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Cancel failed");
    }
  };

  return (
    <div className="active-page">
      <h2 className="active-title">Active Schemes</h2>
      <div className="active-underline"></div>

      <div className="schemes-list">
        {!loading && activeSchemes.length === 0 && (
          <div className="empty-text">No active schemes yet.</div>
        )}

        {activeSchemes.map((s) => (
          <div key={s._id} className="scheme-card">
            <div className="scheme-icon">{s.schemeName?.charAt(0)}</div>

            <div className="scheme-info">
              <h3>{s.schemeName}</h3>
              <p>{s.description}</p>

              <div className="scheme-stats">
                <span className="students">{s.students ?? 0} Students</span>

                <span className="amount">
                  ₹{Number(s.scholarshipAmount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="action-btn view-btn"
                onClick={() => navigate(`/donor/view-scheme/${s._id}`)}
              >
                View
              </button>

              <button
                className="action-btn edit-btn"
                onClick={() => goToCreate(s)}
              >
                Edit
              </button>

              <button
                className="action-btn active-cancel-btn"
                onClick={() => {
                  setSelectedSchemeId(s._id);
                  setShowCancelModal(true);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PREMIUM MODAL */}
      {showCancelModal && (
        <div
          className="cancel-modal-overlay fade-in"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="cancel-modal-box scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">⚠️</div>

            <h3>Cancel Scheme?</h3>
            <p>
              This scheme will be moved to Closed Schemes.
              <br />
              This action cannot be undone.
            </p>

            <div className="cancel-actions">
              <button className="cancel-confirm" onClick={confirmCancel}>
                Yes, Cancel
              </button>

              <button
                className="cancel-close"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Active
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
