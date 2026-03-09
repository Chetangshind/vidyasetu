import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminSupportDesk.css";

export default function AdminSupportDesk() {
  const [activeTab, setActiveTab] = useState("student");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

 const [tickets, setTickets] = useState([]);

useEffect(() => {
  fetchTickets();
}, []);

const fetchTickets = async () => {
  try {
    const res = await axios.get("http://localhost:5050/api/help/all");
    setTickets(res.data);
  } catch (err) {
    console.error("Error fetching tickets:", err);
  }
};
  const filteredTickets = tickets.filter(
    (t) => t.role === activeTab
  );
const studentUnread = tickets.filter(
  (t) => t.role === "student" && !t.reply
).length;

const donorUnread = tickets.filter(
  (t) => t.role === "donor" && !t.reply
).length;

  function handleSelect(ticket) {
  setSelectedTicket(ticket);
  setReplyText(ticket.reply || "");
}

 const handleReplySubmit = async () => {
  try {
    await axios.put(
  `http://localhost:5050/api/help/reply/${selectedTicket._id}`,
      {
        reply: replyText,
        status: "Resolved"
      }
    );

    alert("Reply Sent Successfully ✅");

    setTickets((prev) =>
  prev.map((t) =>
    t._id === selectedTicket._id
      ? { ...t, reply: replyText, status: "Resolved" }
      : t
  )
);

setSelectedTicket(null);

  } catch (error) {
    console.error("Error sending reply:", error);
    alert("Failed to send reply ❌");
  }
};

  return (
    <div className="admin-support-wrapper">

      {/* Tabs */}
  <div className="support-tabs">
  <button
    className={activeTab === "student" ? "active" : ""}
    onClick={() => {
      setActiveTab("student");
      setSelectedTicket(null);
    }}
  >
    Student Queries
    {studentUnread > 0 && (
      <span className="badge">{studentUnread}</span>
    )}
  </button>

  <button
    className={activeTab === "donor" ? "active" : ""}
    onClick={() => {
      setActiveTab("donor");
      setSelectedTicket(null);
    }}
  >
    Donor Queries
    {donorUnread > 0 && (
      <span className="badge">{donorUnread}</span>
    )}
  </button>
</div>
      <div className="support-grid">

        {/* LEFT LIST */}
        <div className="ticket-list">
          {filteredTickets.length === 0 && (
            <div className="empty">No queries found.</div>
          )}

          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className={`ticket-item ${ticket.status?.toLowerCase()}`}
              onClick={() => handleSelect(ticket)}
            >
              <div className="ticket-subject">{ticket.subject}</div>
              <div className="ticket-meta">
                {ticket.name} |{" "}
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
              <div
                className={`status ${ticket.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {ticket.status}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT DETAILS */}
        <div className="ticket-details">
          {!selectedTicket && (
            <div className="empty-details">
              Select a query to view details
            </div>
          )}

          {selectedTicket && (
            <>
              <h3>{selectedTicket.subject}</h3>

              <p><b>Name:</b> {selectedTicket.name}</p>
              <p><b>Email:</b> {selectedTicket.email}</p>
              <p><b>Reference ID:</b> {selectedTicket.referenceId || "N/A"}</p>

              <div className="message-box">
                {selectedTicket.message}
              </div>

              {/* Reply Section */}
              <div className="admin-reply-section">
                <h4>Admin Reply</h4>

                <textarea
                      value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                        disabled={selectedTicket?.reply}
                      />

                <button
                    className="reply-btn"
                      onClick={handleReplySubmit}
                          disabled={selectedTicket?.reply}
                      >
                    {selectedTicket?.reply ? "Reply Sent" : "Send Reply"}
            </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}