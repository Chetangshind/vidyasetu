import { useState } from "react";
import "./specialRequests.css";

export default function SpecialRequests() {
  const [selected, setSelected] = useState(null);
  const [rejectReasonBox, setRejectReasonBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [donateBox, setDonateBox] = useState(false);
  const [donateTarget, setDonateTarget] = useState(null);

  const requests = [
    {
      id: 1,
      name: "Riwuk Rash",
      funded: 40,
      total: 100,
      img: "https://i.pravatar.cc/100?img=32",
      course: "B.Tech Computer Science",
      familyIncome: "₹1,60,000/year",
      marksheet: "85% (HSC)",
      documents: ["Income Certificate", "Aadhaar", "Marksheet"],
      needReason: "Needs support for college semester fees & books.",
    },
    {
      id: 2,
      name: "Domri Sanan",
      funded: 50,
      total: 100,
      img: "https://i.pravatar.cc/100?img=12",
      course: "B.Sc Physics",
      familyIncome: "₹1,20,000/year",
      marksheet: "90% (HSC)",
      documents: ["Aadhaar Card", "Bonafide Certificate"],
      needReason: "Financial support required due to family issues.",
    },
  ];

  const donateComplete = (amount) => {
    alert(`🎉 Successfully donated ₹${amount}!`);
    setDonateBox(false);
    setDonateTarget(null);
  };

  return (
    <div className="page-wrapper">
      <h2 className="page-title">Special Requests</h2>

      <div className="requests-container">
        {requests.map((std) => {
          const percent = (std.funded / std.total) * 100;
          return (
            <div key={std.id} className="request-card">
              <img src={std.img} className="student-img" />

              <div className="request-info">
                <h3>{std.name}</h3>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="btn-line">
                <button className="view-btn" onClick={() => setSelected(std)}>
                  View
                </button>

                <button
                  className="reject-btn"
                  onClick={() => {
                    setSelected(null); // CLOSE VIEW POPUP
                    setRejectReasonBox(true); // OPEN REJECT MODAL FRONT
                  }}
                >
                  Reject
                </button>

                <button
                  className="donate-btn"
                  onClick={() => {
                    setDonateTarget(std);
                    setDonateBox(true);
                  }}
                >
                  Donate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= VIEW MODAL ================= */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <img src={selected.img} className="modal-img" />

            <h2>{selected.name}</h2>
            <p className="muted">{selected.course}</p>

            <h3>Request Reason</h3>
            <p>{selected.needReason}</p>

            <h3>Family Income</h3>
            <p>{selected.familyIncome}</p>

            <h3>Academic Performance</h3>
            <p>{selected.marksheet}</p>

            <h3>Documents Provided</h3>
            <ul>
              {selected.documents.map((d, i) => (
                <li key={i}>
                  📄 <button className="doc-link-btn">{d}</button>
                </li>
              ))}
            </ul>

            <div className="modal-actions">
              {/* FIX - CLOSE MAIN & OPEN REJECT */}
              <button
                className="reject-btn"
                onClick={() => {
                  setSelected(null);
                  setRejectReasonBox(true);
                }}
              >
                Reject
              </button>

              <button
                className="donate-big"
                onClick={() => {
                  setDonateTarget(selected);
                  setDonateBox(true);
                }}
              >
                Donate
              </button>
            </div>

            <button className="close-btn" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {rejectReasonBox && (
        <div className="reject-overlay">
          <div className="reject-modal">
            <h3>Rejection Reason</h3>

            <textarea
              placeholder="Write reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>

            <div className="reject-action-row">
              <button
                className="cancel-btn"
                onClick={() => setRejectReasonBox(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-reject-btn"
                onClick={() => {
                  if (!rejectReason.trim())
                    return alert("Enter a reason first!");
                  alert(`❌ Rejected\nReason: ${rejectReason}`);
                  setRejectReasonBox(false);
                  setRejectReason("");
                  setSelected(null);
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DONATE  MODAL ================= */}
      {donateBox && donateTarget && (
        <div className="donate-overlay">
          <div className="donate-modal">
            <h3>Donate to {donateTarget.name}</h3>
            <p className="donate-text">Choose donation amount</p>

            <div className="donate-options">
              <button
                className="donate-option"
                onClick={() => donateComplete(donateTarget.total * 0.5)}
              >
                Donate 50% — ₹{donateTarget.total * 0.5}
              </button>

              <button
                className="donate-option"
                onClick={() => donateComplete(donateTarget.total)}
              >
                Donate 100% — ₹{donateTarget.total}
              </button>
            </div>

            <button
              className="donate-cancel"
              onClick={() => setDonateBox(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
