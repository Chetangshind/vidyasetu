import { jwtDecode } from "jwt-decode";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import "./HelpSupport.css";

const STUDENT_FAQS = [
  {
    id: 1,
    q: "How do I check which scholarships I'm eligible for?",
    a: "Login and go to All Available Schemes. Apply filters like course, category, income and year.",
  },
  {
    id: 2,
    q: "What documents should I upload?",
    a: "Aadhaar card, income certificate, caste certificate (if applicable), fee receipt and marksheets.",
  },
  {
    id: 3,
    q: "Application status shows Partial. What does it mean?",
    a: "Some documents are missing or incorrect. Edit the application and re-upload before deadline.",
  },
  {
    id: 4,
    q: "Why was my application rejected?",
    a: "Due to eligibility mismatch, invalid documents or late submission.",
  },
    {
    id: 5,
    q: "How can I track my scholarship application status?",
    a: "You can track your application status in the 'My Applications' section of the student dashboard."
  },
  {
  id: 6,
  q: "Can I apply for more than one scholarship scheme?",
  a: "No, you can not apply for multiple scholarship ."
},
];

export default function HelpSupportStudent() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    applicationId: "",
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
      console.error("Error fetching queries:", error);
    }
  }

  useEffect(() => {
    if (loggedInEmail) {
      fetchMyQueries(loggedInEmail);
    }
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!query) return STUDENT_FAQS;
    return STUDENT_FAQS.filter(
      (f) =>
        f.q.toLowerCase().includes(query.toLowerCase()) ||
        f.a.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  function validateForm() {
    const err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.email.trim()) err.email = "Email is required";
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
        role: "student",
        subject: form.subject,
        applicationId: form.applicationId,
        message: form.message,
      });

      await fetchMyQueries(loggedInEmail);

      setSuccess("Your request has been submitted successfully.");

      setForm({
        name: "",
        email: "",
        applicationId: "",
        subject: "",
        message: "",
      });
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
          <h2 className="hs-page-title">Student Help & Support</h2>

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

          {/* FAQ */}
          <div className="faqs-column">
            <h3>Top FAQs</h3>

            {filteredFaqs.map((f) => (
              <div key={f.id} className="faq-item">
                <button
                  className="faq-q"
                  onClick={() =>
                    setOpenFaq(openFaq === f.id ? null : f.id)
                  }
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

            <form className="ticket-form" onSubmit={submit}>

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

              <input
                placeholder="Application ID (optional)"
                value={form.applicationId}
                onChange={(e) =>
                  setForm({ ...form, applicationId: e.target.value })
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
              <div>Helpline: +91 11 2222 3333</div>
              <div>Email: studentsupport@vidyasetu.gov.in</div>
            </div>

          </aside>

        </div>

        {/* FULL WIDTH REQUEST TABLE */}
        <div className="requests-section">

          <h3 className="requests-title">My Submitted Requests</h3>

          {tickets.length === 0 ? (
            <div className="muted">No requests submitted yet.</div>
          ) : (

            <div className="table-wrapper">
  <table className="requests-table">

              <tbody>

                {tickets.map((t) => (
                 <tr key={t._id} onClick={() => setSelectedTicket(t)}>
  <td data-label="Subject" className="req-subject">{t.subject}</td>
  <td data-label="Created">{new Date(t.createdAt).toLocaleDateString()}</td>
  <td data-label="Status">
    <span className={`status ${t.status}`}>{t.status}</span>
  </td>
  <td data-label="Updated">{new Date(t.createdAt).toLocaleDateString()}</td>
</tr>
                ))}

              </tbody>

            </table>
</div>
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