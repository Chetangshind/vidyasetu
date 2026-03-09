import { useEffect, useState } from "react";
import "./MyAppliedSchemes.css";

export default function MyAppliedSchemes() {
  const [activeTab, setActiveTab] = useState("scrutiny");

  const [scrutinyData, setScrutinyData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);
  const [meetingsData, setMeetingsData] = useState([]);
  

  /* ===============================
     FETCH APPLICATIONS BY STATUS
  =============================== */
  useEffect(() => {
    async function fetchApplications(status, setter) {
      try {
        const res = await fetch(
          `http://${API}/api/applications/my?status=${status}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        setter(data.applications || []);
      } catch (err) {
        console.error(`Failed to fetch ${status} applications`, err);
        setter([]);
      }
    }

    fetchApplications("applied", setScrutinyData);
    fetchApplications("approved", setApprovedData);
    fetchApplications("rejected", setRejectedData);
    fetchMeetings();

    
    
  }, []);

  async function fetchMeetings() {
  try {
    const res = await fetch(
      "http://${API}/api/meetings/student",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();
    setMeetingsData(data.meetings || []);
  } catch (err) {
    console.error("Failed to fetch meetings", err);
    setMeetingsData([]);
  }
}



  /* ===============================
     CANCEL (UI ONLY FOR NOW)
  =============================== */
  const cancelApplication = (id) => {
    setScrutinyData((prev) => prev.filter((app) => app._id !== id));
  };

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <h2>My Applied Schemes</h2>
        <div className="page-header-underline"></div>
      </div>

      {/* TABS */}
      <div className="tabs-row">
        <div
          className={`tab-item ${activeTab === "scrutiny" ? "active" : ""}`}
          onClick={() => setActiveTab("scrutiny")}
        >
          Under Scrutiny
        </div>

        <div
          className={`tab-item ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </div>

        <div
          className={`tab-item ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </div>
        
        <div
  className={`tab-item ${activeTab === "meetings" ? "active" : ""}`}
  onClick={() => setActiveTab("meetings")}
>
  Meetings
</div>

        
      </div>

      <div className="content-box">
        {/* ================= UNDER SCRUTINY ================= */}
        {activeTab === "scrutiny" && (
          <BasicTable
            data={scrutinyData}
            emptyText="No applications under scrutiny."
            showCancel
            onCancel={cancelApplication}
          />
        )}

        {/* ================= APPROVED ================= */}
        {activeTab === "approved" && (
          <BasicTable
            data={approvedData}
            emptyText="No approved applications."
          />
        )}

        {/* ================= REJECTED ================= */}
        {activeTab === "rejected" && (
          <RejectedTable
            data={rejectedData}
            emptyText="No rejected applications."
          />
        )}

        {activeTab === "meetings" && (
  <MeetingsTable
    data={meetingsData}
    emptyText="No meetings scheduled."
  />
)}

        {/* ================= FUND DISBURSED ================= */}
        
      </div>
    </>
  );
}

/* =====================================================
   BASIC TABLE (SCRUTINY / APPROVED / FUND)
===================================================== */
function BasicTable({ data, emptyText, showCancel = false, onCancel }) {
  return (
    <div className="table-wrapper">
      <table className="scheme-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Department</th>
            <th>Scheme</th>
            {showCancel && <th>Cancel</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={showCancel ? 4 : 3} className="empty-msg">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((app) => (
              <tr key={app._id}>
                <td className="link">{app._id}</td>
                <td>{app.schemeId?.department || "NA"}</td>
                <td>{app.schemeId?.schemeName || "NA"}</td>

                {showCancel && (
                  <td>
                    <button
                      className="cancel-btn"
                      onClick={() => onCancel(app._id)}
                    >
                      Cancel
                    </button>
                  </td>
                  
                )}
                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   REJECTED TABLE (WITH REASON)
===================================================== */
function RejectedTable({ data, emptyText }) {
  return (
    <div className="table-wrapper">
      <table className="scheme-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Department</th>
            <th>Scheme</th>
            <th>Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty-msg">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((app) => (
              <tr key={app._id}>
                <td className="link">{app._id}</td>
                <td>{app.schemeId?.department || "NA"}</td>
                <td>{app.schemeId?.schemeName || "NA"}</td>
                <td style={{ color: "#c62828", fontWeight: 600 }}>
                  {app.rejectionReason || "Not specified"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MeetingsTable({ data, emptyText }) {
  return (
    <div className="table-wrapper">
      <table className="scheme-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Type</th>
            <th>Address</th>
            <th>Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-msg">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((meeting) => {
              const formattedDateTime = new Date(
                meeting.date + "T" + meeting.time
              ).toLocaleString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={meeting._id}>
                  <td>{meeting.applicationId?._id}</td>

                  <td style={{ fontWeight: 600 }}>
                    {meeting.meetingType === "physical"
                      ? "Physical"
                      : "Digital"}
                  </td>

                  {/* ✅ DYNAMIC DETAILS */}
<td>
  {meeting.meetingType === "physical" && (
    <span>{meeting.address || "Address not available"}</span>
  )}

  {meeting.meetingType === "digital" && (
    <>
      {meeting.phone && (
        <span style={{ fontWeight: 600 }}>
          Voice Call: {meeting.phone}
        </span>
      )}

      {meeting.meetingLink && (
        <a
          href={meeting.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1565c0", fontWeight: 600, marginLeft: "10px" }}
        >
          Join Meeting
        </a>
      )}

      {!meeting.phone && !meeting.meetingLink && (
        <span>Details not available</span>
      )}
    </>
  )}
</td>

                  <td>{formattedDateTime}</td>

                  <td
                    style={{
                      color:
                        meeting.status === "scheduled"
                          ? "#2e7d32"
                          : meeting.status === "cancelled"
                          ? "#c62828"
                          : "#1565c0",
                      fontWeight: 600,
                    }}
                  >
                    {meeting.status}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}