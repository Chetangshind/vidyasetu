import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrackExpenses.css";
import axios from "axios";

export default function TrackExpenses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scrutiny");
  const [year, setYear] = useState("");
  const [showData, setShowData] = useState(false);
  const [applications, setApplications] = useState([]);

const handleSearch = async (tabValue = activeTab) => {
  console.log("Search clicked", year); 
  if (!year) {
    alert("Please select academic year");
    return;
  }

  try {
    const token = localStorage.getItem("token");

const res = await axios.get(
  `http://localhost:5050/api/applications/my?academicYear=${year}&status=${tabValue === "scrutiny" ? "applied" : tabValue}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    setApplications(res?.data?.applications || []);
    setShowData(true);

  } catch (error) {
    console.error("Error fetching applications:", error);
    setApplications([]);
    setShowData(true);
  }
};

  return (
    <div className="section">

      {/* PAGE HEADER */}
      <div className="page-header">
        <h2>Applied Scheme History</h2>
      </div>

      {/* YEAR SELECTION */}
      <div className="action-bar">
        <div className="year-group">
          <label>Select Academic Year *</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="2022-23">2022-23</option>
            <option value="2023-24">2023-24</option>
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </select>
        </div>

        <button
  type="button"
  className="btn primary"
  onClick={handleSearch}
>
  Search
</button>
      </div>

      {/* SHOW TABS + TABLE AFTER SEARCH */}
      {showData && (
        <>
          {/* TABS */}
          <div className="tabs-row">
            <div
              className={`tab-item ${activeTab === "scrutiny" ? "active" : ""}`}
onClick={() => {
  setActiveTab("scrutiny");
  if (year) handleSearch("scrutiny");
}}
            >
              Under Scrutiny
            </div>

            <div
              className={`tab-item ${activeTab === "approved" ? "active" : ""}`}
onClick={() => {
  setActiveTab("approved");
  if (year) handleSearch("approved");
}}
            >
              Approved
            </div>

            <div
              className={`tab-item ${activeTab === "rejected" ? "active" : ""}`}
onClick={() => {
  setActiveTab("rejected");
  if (year) handleSearch("rejected");
}}
            >
              Rejected
            </div>
          </div>

          {/* CONTENT BOX */}
          <div className="content-box">
            <div className="table-wrapper">
              <table className="scheme-table">
                <thead>
<tr>
  <th>Application ID</th>
  <th>Scheme</th>

  {activeTab === "approved" && (
    <>
      <th>Meeting Info</th>
      <th>Status</th>
    </>
  )}

  {activeTab === "rejected" && <th>Rejection Reason</th>}

  <th>View Form</th>
</tr>
                </thead>

                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td
  colSpan={
    activeTab === "approved"
      ? 5
      : activeTab === "rejected"
      ? 4
      : 3
  }
  className="empty-msg"
>
                        No applications under {activeTab}.
                      </td>
                    </tr>
                  ) : (
                    applications.map((item, index) => (
<tr key={index}>
  <td className="table-link">{item._id}</td>

  <td>{item.schemeId?.schemeName || "-"}</td>

{activeTab === "approved" && (
  <>
    <td>
      {item.meeting ? (
        <>
          {/* ✅ Formatted Date */}
          <div>
            {new Date(item.meeting.date + "T" + item.meeting.time)
  .toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}
          </div>

          {/* ✅ Type */}
          <div style={{ fontWeight: "500" }}>
            {item.meeting.meetingType === "physical"
              ? "Physical"
              : "Digital"}
          </div>

          {/* ✅ Address if physical */}
          {item.meeting.meetingType === "physical" && (
            <div style={{ fontSize: "13px", color: "#555" }}>
              {item.meeting.address}
            </div>
          )}
        </>
      ) : (
        "Not Scheduled"
      )}
    </td>

    <td style={{ fontWeight: "500", color: "#2e7d32" }}>
      {item.meeting ? item.meeting.status : item.status}
    </td>
  </>
)}

  {activeTab === "rejected" && (
    <td style={{ color: "red", fontWeight: "500" }}>
      {item.rejectionReason || "Not specified"}
    </td>
  )}

  <td>
    <button
      className="btn primary"
      onClick={() =>
        navigate(`/student/application-form/${item._id}`)
      }
    >
      View
    </button>
  </td>
</tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}