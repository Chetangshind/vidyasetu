import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DraftSchemes.css";

export default function DraftSchemes() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraftSchemes();
  }, []);

  // Fetch DRAFT schemes from backend
  const fetchDraftSchemes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5050/api/schemes/my?status=draft",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching draft schemes:", error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  // Edit draft
  const editDraft = (draft) => {
    navigate("/donor/create-scheme", {
      state: { scheme: draft, mode: "edit" },
    });
  };

  // Delete draft (backend)
  const deleteDraft = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5050/api/schemes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchDraftSchemes(); // refresh
    } catch (error) {
      alert("Failed to delete draft");
    }
  };

  // Publish draft → Active
  const publishDraft = async (draft) => {
    if (!window.confirm("Publish this draft and move to Active schemes?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5050/api/schemes/${draft._id}`,
        { status: "active" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Published — moved to Active Schemes.");
      fetchDraftSchemes();
    } catch (error) {
      alert("Failed to publish draft");
    }
  };

  return (
    <div className="draft-page">
      <h2 className="draft-title">Draft Schemes</h2>

      <p className="draft-subtext">
        Your drafts — click Edit to change, Publish when ready, or Delete to remove.
      </p>

      <div className="draft-list">
        {!loading && drafts.length === 0 && (
          <div className="draft-empty">No drafts yet.</div>
        )}

        {drafts.map((d, index) => (
          <div key={d._id} className="draft-card">
            <div className="draft-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="draft-info">
              <h3>{d.schemeName}</h3>
              <p>{d.description}</p>

              <div style={{ marginTop: 6 }}>
                <span className="target">
                  Target: ₹
                  {Number(d.scholarshipAmount ?? 0).toLocaleString()}
                </span>

                <span className="draft-id">
                  Draft ID: {d._id}
                </span>
              </div>
            </div>

            <div className="draft-actions">
              <button className="btn-edit" onClick={() => editDraft(d)}>
                Edit
              </button>

              <button
                className="btn-delete"
                onClick={() => deleteDraft(d._id)}
              >
                Delete
              </button>

              <button
                className="btn-publish"
                onClick={() => publishDraft(d)}
              >
                Publish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
