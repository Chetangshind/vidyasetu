import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ClosedSchemes.css";

export default function ClosedSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClosedSchemes();
  }, []);

  // Fetch CLOSED schemes from backend
  const fetchClosedSchemes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5050/api/schemes/my?status=closed",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSchemes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching closed schemes:", error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="closed-root">
      <h2 className="closed-title">Closed Schemes</h2>
      <div className="closed-line"></div>

      <div className="closed-list">
        {!loading && schemes.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 40, opacity: 0.6 }}>
            No closed schemes yet.
          </div>
        )}

        {schemes.map((s) => (
          <div key={s._id} className="closed-card">
            <div className="closed-icon">
              {s.schemeName?.charAt(0)}
            </div>

            <div className="closed-details">
              <h3>{s.schemeName}</h3>
              <p className="closed-desc">{s.description}</p>

              <p className="closed-meta">
                <strong>{s.students ?? 0} Students</strong> &nbsp; ₹
                {Number(s.scholarshipAmount ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="closed-badge">CLOSED</div>
          </div>
        ))}
      </div>
    </div>
  );
}
