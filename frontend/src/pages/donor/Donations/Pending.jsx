import React from "react";
import "./pending.css";

export default function DonationsPending() {
  const pending = [
    { id: "APP2025-101", name: "Priya Patel", scheme: "Girl Child Scholarship", amount: 5000, date: "2025-11-10" },
    { id: "APP2025-102", name: "Akash Kumar", scheme: "Merit Scholarship", amount: 2500, date: "2025-11-05" },
  ];

  return (
    <div className="donations-page">
      <div className="scheme-title">Pending Donations</div>
      <p style={{ marginTop: 8, color: "#536878" }}>Donations currently awaiting approval or processing.</p>

      <div style={{ marginTop: 18 }}>
        <div className="desktop-only">
          <table className="donations-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student Name</th>
                <th>Scheme</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.scheme}</td>
                  <td>₹{p.amount}</td>
                  <td>{p.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn primary">Approve</button>
                      <button className="btn">View</button>
                    </div>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 30 }}>No pending donations.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-only">
          {pending.map((p) => (
            <div className="donation-card" key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{p.scheme}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>₹{p.amount}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{p.date}</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }} className="actions-row">
                <button className="btn primary">Approve</button>
                <button className="btn">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
