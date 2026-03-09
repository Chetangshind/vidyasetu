import { useNavigate } from "react-router-dom";
import "./PendingApplications.css";
import { useEffect, useState } from "react";

export default function PendingApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
const [filterPincode, setFilterPincode] = useState("");
  // Reject modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  /* ===============================
     FETCH PENDING APPLICATIONS
  =============================== */
  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
    const res = await fetch("http://localhost:5050/api/donor/applications/pending", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token"),
  },
});

        const data = await res.json();
        setApplications(data.applications || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPendingApplications();
  }, []);

  /* ===============================
     APPROVE APPLICATION
  =============================== */
  const approveApplication = async (id) => {
    try {
      await fetch(
        `http://localhost:5050/api/applications/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ status: "approved" }),
        }
      );

      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ===============================
     REJECT APPLICATION
  =============================== */
  const openRejectModal = (id) => {
    setSelectedAppId(id);
    setRejectReason("");
    setOtherReason("");
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    try {
      const finalReason =
        rejectReason === "Other" ? otherReason : rejectReason;

      await fetch(
        `http://localhost:5050/api/applications/${selectedAppId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason: finalReason,
          }),
        }
      );

      setApplications((prev) =>
        prev.filter((app) => app._id !== selectedAppId)
      );

      setShowRejectModal(false);
    } catch (err) {
      console.error(err);
    }
  };

const filteredApplications = applications.filter((app) => {

  // If backend not sending address → show all
  if (!app.studentProfile?.address) return true;

  const address = app.studentProfile.address;
  const selected = address.same ? address.perm : address.corr;

  // If no pincode entered → show all
  if (!filterPincode) return true;

  return String(selected?.pincode || "").includes(filterPincode);
});
  return (
    <div className="pa-wrapper">
     <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  }}
>
  <div>
    <h2 className="pa-title" style={{ margin: 0 }}>
      Pending Applications
    </h2>
    <div className="pa-title-underline" />
  </div>

  <div style={{ textAlign: "right" }}>
    <label
      style={{
        display: "block",
        marginBottom: "5px",
        color: "#1e3a5f",
        fontWeight: "600"
      }}
    >
      Enter Pincode to select student
    </label>

    <input
      type="text"
      value={filterPincode}
      onChange={(e) => setFilterPincode(e.target.value)}
      style={{
        padding: "6px 10px",
        width: "180px",
        borderRadius: "6px",
        border: "1px solid #ccc"
      }}
    />
  </div>
</div>

      <div className="pa-card">
        <div className="pa-scroll-area">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student Name</th>
                <th>Scheme Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-msg">
                    No pending applications
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app, index) => (
                  <tr
                    key={app._id}
                    className={index % 2 === 0 ? "pa-row-even" : "pa-row-odd"}
                  >
                    <td>
                      <span className="pa-blue">{app._id}</span>
                    </td>

                    <td>{app.studentName || "-"}</td>

                    <td>{app.schemeId?.schemeName}</td>

                    <td className="pa-status">Pending</td>

                    <td>
                      <span
                        className="view-link"
                        onClick={() =>
                          navigate(`/donor/applications/view/${app._id}`)
                        }
                      >
                        View
                      </span>

                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===============================
          REJECT MODAL
      =============================== */}
      {showRejectModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Reject Application</h3>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="">Select reason</option>
              <option value="Eligibility criteria not met">
                Eligibility criteria not met
              </option>
              <option value="Incomplete documents">
                Incomplete documents
              </option>
              <option value="Incorrect information provided">
                Incorrect information provided
              </option>
              <option value="Other">Other</option>
            </select>

            {rejectReason === "Other" && (
              <textarea
                placeholder="Enter rejection reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button onClick={submitReject} className="confirm-btn">
                Submit
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
