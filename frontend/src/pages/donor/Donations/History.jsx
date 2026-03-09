import React from "react";
import "./History.css";
import { Link } from "react-router-dom";

export default function DonationsHistory() {
  // sample data (replace with real fetch later)
  const donations = [
    { id: "D2025-001", date: "2025-09-12", scheme: "Girl Child Scholarship", amount: 5000, status: "complete" },
    { id: "D2025-002", date: "2025-08-30", scheme: "Merit Scholarship", amount: 2000, status: "complete" },
    { id: "D2025-003", date: "2025-08-01", scheme: "Education Fund", amount: 1500, status: "complete" },
  ];

  return (
    <div className="donations-page">
      <div className="scheme-title">Donations History</div>
      <p style={{ marginTop: 8, color: "#536878" }}>All past donations you have made through VidyaSetu.</p>

      {/* Desktop table */}
      <div className="desktop-only" style={{ marginTop: 18 }}>
        <table className="donations-table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Date</th>
              <th>Scheme</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.date}</td>
                <td>{d.scheme}</td>
                <td>₹{d.amount.toLocaleString()}</td>
                <td><span className={`status-badge status-complete`}>Completed</span></td>
                <td><Link to={`/donations/receipts?donation=${d.id}`} className="btn ghost">View</Link></td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#6b7280" }}>
                  No donations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mobile-only" style={{ marginTop: 12 }}>
        {donations.map((d) => (
          <div className="donation-card" key={d.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{d.scheme}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{d.date} • {d.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>₹{d.amount}</div>
                <div style={{ marginTop: 6 }}><span className="status-badge status-complete">Completed</span></div>
              </div>
            </div>
            <div style={{ marginTop: 10 }} className="actions-row">
              <Link to={`/donations/receipts?donation=${d.id}`} className="btn ghost">Receipt</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
