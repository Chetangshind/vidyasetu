import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import "./DHelpSupport.css";

const DONOR_FAQS = [
  {
    id: 1,
    q: "How can I create a scholarship program?",
    a: "After logging into your donor dashboard, you can create a scholarship program by defining eligibility criteria and scholarship details."
  },
  {
    id: 2,
    q: "How can I view student applications for my scholarship?",
    a: "Go to the Applications section on your dashboard to see all student applications submitted for your scholarship program."
  },
  {
    id: 3,
    q: "How do I check the documents uploaded by students?",
    a: "When reviewing a student application, you can open the document section to view the uploaded certificates and supporting documents."
  },
  {
    id: 4,
    q: "How do I approve or reject a student application?",
    a: "After reviewing the application and documents, you can approve or reject the application directly from the donor dashboard."
  },
  {
    id: 5,
    q: "What happens after I approve a student application?",
    a: "After approval, you can schedule an optional meeting with the student to discuss further details."
  },
  {
    id: 6,
    q: "Does VidyaSetu handle the fund transfer process?",
    a: "No, VidyaSetu does not process financial transactions. Donors transfer funds directly to students outside the platform."
  },
  {
    id: 7,
    q: "Can I schedule a meeting with the selected student?",
    a: "Yes, donors can arrange an online or offline meeting with approved students before confirming support."
  },
];

export default function DHelpSupport() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    donationId: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  let loggedInEmail = "";

  if (token) {
    const decoded = jwtDecode(token);
    loggedInEmail = decoded.email;
  }

  async function fetchMyQueries(email) {
    try {
      const res = await axios.get(
        `http://${API}/api/help/my-queries/${email}`
      );
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching donor queries:", error);
    }
  }

  useEffect(() => {
    if (loggedInEmail) {
      fetchMyQueries(loggedInEmail);
    }
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!query) return DONOR_FAQS;
    return DONOR_FAQS.filter(
      (f) =>
        f.q.toLowerCase().includes(query.toLowerCase()) ||
        f.a.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  function validateForm() {
    const err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Enter valid email address";
    if (!form.subject.trim()) err.subject = "Subject is required";
    if (!form.message.trim()) err.message = "Message is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setSuccess("");

    if (!validateForm()) return;

    try {
      await axios.post("http://${API}/api/help/send", {
        name: form.name,
        email: loggedInEmail,
        role: "donor",
        subject: form.subject,
        applicationId: form.donationId,
        message: form.message,
      });

      await fetchMyQueries(loggedInEmail);

      setSuccess("Your request has been submitted successfully.");

      setForm({
        name: "",
        email: "",
        donationId: "",
        subject: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error(error);
      alert("Error sending request");
    }
  }

  return (
    <div className="hs-wrapper">
      <div className="hs-main">

        {/* HEADER */}
        <header className="hs-header">
          <h2 className="hs-page-title">Donor Help & Support</h2>

          <div className="header-actions">
            <div className="search-wrap">
              <FiSearch />
              <input
                placeholder="Search FAQs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button className="btn ghost" onClick={() => setQuery("")}>
              Clear
            </button>
          </div>
        </header>

        {/* FAQ + CONTACT GRID */}
        <div className="hs-grid">

          {/* FAQs */}
          <div className="faqs-column">
            <h3>Top FAQs</h3>

            {filteredFaqs.map((f) => (
              <div key={f.id} className="faq-item">
                <button
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                >
                  {f.q}
                  {openFaq === f.id ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {openFaq === f.id && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>

          {/* CONTACT SUPPORT */}
          <aside className="ticket-column">

            <h4>Contact Support</h4>

            <form className="ticket-form" onSubmit={submit} noValidate>

              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <div className="error">{errors.name}</div>}

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <div className="error">{errors.email}</div>}

              <input
                placeholder="Donation ID (optional)"
                value={form.donationId}
                onChange={(e) =>
                  setForm({ ...form, donationId: e.target.value })
                }
              />

              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              {errors.subject && <div className="error">{errors.subject}</div>}

              <textarea
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {errors.message && <div className="error">{errors.message}</div>}

              <button className="btn primary">Submit</button>

              {success && <div className="hs-success">{success}</div>}
            </form>

            <div className="contact-short">
              <div>Helpline: +91 11 2222 4444</div>
              <div>Email: donorsupport@vidyasetu.gov.in</div>
            </div>

          </aside>

        </div>

        {/* FULL WIDTH REQUEST TABLE */}
        <div className="requests-section">

          <h3 className="requests-title">My Submitted Requests</h3>

          {tickets.length === 0 ? (
            <div className="muted">No requests submitted yet.</div>
          ) : (

            <table className="requests-table">

              <tbody>

                {tickets.map((t) => (
                  <tr key={t._id} onClick={() => setSelectedTicket(t)}>

                    <td className="req-subject">{t.subject}</td>

                    <td>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <span className={`status ${t.status}`}>
                        {t.status}
                      </span>
                    </td>

                    <td>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          )}

        </div>

        {/* MESSAGE VIEW */}
        {selectedTicket && (
          <div className="ticket-details">

            <h4>Submitted Message</h4>

            <p><b>Subject:</b> {selectedTicket.subject}</p>

            <p><b>Status:</b> {selectedTicket.status}</p>

            <p><b>Message:</b></p>

            <div className="message-box">
              {selectedTicket.message}
            </div>

            {selectedTicket.reply && (
              <div className="admin-reply-box">
                <p><b>Admin Reply:</b></p>
                <div className="reply-message">
                  {selectedTicket.reply}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}