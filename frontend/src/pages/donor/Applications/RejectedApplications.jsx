import { useEffect, useState } from "react";
import "./RejectedApplications.css";
import API from "../../../api";

export default function RejectedApplications() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);

  /* ===============================
     FETCH REJECTED APPLICATIONS
  =============================== */
  useEffect(() => {
    async function fetchRejectedApplications() {
      try {
        const res = await fetch(
          `${API}/api/applications/donor?status=rejected`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        const data = await res.json();
        setApplications(data || []);
      } catch (err) {
        console.error("Failed to load rejected applications", err);
      }
    }

    fetchRejectedApplications();
  }, []);

  return (
    /* ✅ IMPORTANT: added `rejected-page` for CSS isolation */
    <div className="rejected-page pa-wrapper">
      <h2 className="pa-title">Rejected Applications</h2>
      <div className="pa-title-underline" />

      <div className="pa-card">
        <div className="pa-scroll-area">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student Name</th>
                <th>Scheme Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-msg">
                    No rejected applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app, i) => (
                  <tr
                    key={app._id}
                    className={i % 2 === 0 ? "pa-row-even" : "pa-row-odd"}
                  >
                    <td className="pa-blue">{app._id}</td>

                    <td>
                      {app.studentProfile?.personal?.name || "Student"}
                    </td>

                    <td>{app.schemeId?.schemeName || "-"}</td>

                    <td className="pa-status rejected">Rejected</td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          setSelected({
                            student:
                              app.studentProfile?.personal?.name || "Student",
                            scheme: app.schemeId?.schemeName || "-",
                            amount:
                              app.schemeId?.scholarshipAmount || 0,
                            reason:
                              app.rejectionReason ||
                              "Rejection reason not specified",
                          })
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

      {/* ===============================
         SMALL WHITE CARD (LIKE DONATE)
      =============================== */}
      {selected && (
        <div className="small-overlay">
          <div className="small-card">
            <h3>Rejected Application</h3>

            <p>
              <b>Student:</b> {selected.student}
            </p>

            <p>
              <b>Scheme:</b> {selected.scheme}
            </p>

            <p>
              <b>Requested Amount:</b> ₹{selected.amount}
            </p>

            <div className="reason-box">
              {selected.reason}
            </div>

            <button
              className="cancel-btn"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
