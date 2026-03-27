import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewScheme.css";
import API from "../../../api";

export default function ViewScheme() {
  const { id } = useParams(); // ✅ get id from URL
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);

  useEffect(() => {
    fetchScheme();
  }, []);

  const fetchScheme = async () => {
    try {
      setScheme(null); // 🔥 add this line

      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/schemes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setScheme(res.data);
    } catch (err) {
      console.error(err);
      setScheme(null);
    }
  };

  if (!scheme) {
    return <div>No scheme data found.</div>;
  }

  return (
    <div className="view-page">
      <h2 className="view-title">Scheme Preview</h2>
      <div className="view-underline"></div>

    <div className="view-card">

  <div className="view-grid">
    <div className="label">Scheme Name</div>
    <div className="value">{scheme.schemeName}</div>

    <div className="label">Description</div>
    <div className="value full">{scheme.description}</div>

    <div className="label">Scholarship Amount</div>
    <div className="value">₹{scheme.scholarshipAmount}</div>

    <div className="label">Income Limit</div>
    <div className="value">{scheme.incomeLimit}</div>

    <div className="label">Education Level</div>
    <div className="value highlight">{scheme.educationLevel}</div>

    <div className="label">Age Limit</div>
    <div className="value">{scheme.ageLimit}</div>

    <div className="label">Category</div>
    <div className="value">{scheme.category}</div>

    <div className="label">Gender Preference</div>
    <div className="value">{scheme.gender || "No Preference"}</div>

    <div className="label">Deadline</div>
    <div className="value">{scheme.deadline}</div>

    <div className="label">Documents Required</div>
    <div className="value full">
      {scheme.documents?.length ? scheme.documents.join(", ") : "None"}
    </div>

    <div className="label">Additional Conditions</div>
    <div className="value full">
      {scheme.extraConditions || "None"}
    </div>
  </div>

  <button className="back-btn" onClick={() => navigate(-1)}>
    ← Back
  </button>

</div>y
    </div>
  );
}
