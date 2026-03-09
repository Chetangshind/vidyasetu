import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewScheme.css";

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

      const res = await axios.get(`http://localhost:5050/api/schemes/${id}`, {
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
        <div className="view-row">
          <span>Scheme Name</span>
          <span>{scheme.schemeName}</span>
        </div>

        <div className="view-row">
          <span>Description</span>
          <span>{scheme.description}</span>
        </div>

        <div className="view-row">
          <span>Scholarship Amount</span>
          <span>₹{scheme.scholarshipAmount}</span>
        </div>

        <div className="view-row">
          <span>Income Limit</span>
          <span>{scheme.incomeLimit}</span>
        </div>

        <div className="view-row">
          <span>Education Level</span>
          <span>{scheme.educationLevel}</span>
        </div>

        <div className="view-row">
          <span>Age Limit</span>
          <span>{scheme.ageLimit}</span>
        </div>

        <div className="view-row">
          <span>Category</span>
          <span>{scheme.category}</span>
        </div>

        <div className="view-row">
          <span>Gender Preference</span>
          <span>{scheme.gender || "No Preference"}</span>
        </div>

        <div className="view-row">
          <span>Deadline</span>
          <span>{scheme.deadline}</span>
        </div>

        <div className="view-row">
          <span>Documents Required</span>
          <span>
            {scheme.documents?.length ? scheme.documents.join(", ") : "None"}
          </span>
        </div>

        <div className="view-row">
          <span>Additional Conditions</span>
          <span>{scheme.extraConditions || "None"}</span>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}
