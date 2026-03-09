import { useState, useEffect, useCallback } from "react";
import "./Students.css";
import { useNavigate } from "react-router-dom";
import API from "../../api";
const API_BASE = `${API}/api`;

const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "#16a34a",
    bg: "#dcfce7",
    icon: "●",
  },
  under_review: {
    label: "Under Review",
    color: "#eab308",
    bg: "#422006",
    icon: "◑",
  },
  warning_issued: {
    label: "Warning Issued",
    color: "#f97316",
    bg: "#431407",
    icon: "⚠",
  },
  suspended: {
    label: "Suspended",
    color: "#ef4444",
    bg: "#450a0a",
    icon: "🔒",
  },
  blacklisted: {
    label: "Blacklisted",
    color: "#a1a1aa",
    bg: "#18181b",
    icon: "⊘",
  },
};

const getDocStatus = (s) => {
  if (!s.profileComplete) return { label: "No Profile", color: "#6b7280" };
  if (!s.hasIncomeCert) return { label: "Incomplete", color: "#f97316" };
  return { label: "Submitted", color: "#22c55e" };
};

// ── Investigation Modal ───────────────────────────────────────────────────────
function InvestigationModal({ student, token, onClose, onActionDone }) {
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const st = STATUS_CONFIG[student.status] || STATUS_CONFIG.active;
  const doc = getDocStatus(student);

  const handleSubmit = async () => {
    if (!action || !reason.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/students/${student._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, reason }),
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Request failed");
      setSubmitted(true);
      setTimeout(() => {
        onActionDone(student._id, action);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const ACTIONS = [
   {
     val: "under_review",
     icon: "◑",
     label: "Set Under Review",
     desc: "Investigate — student can still login",
     className: "action-review",
   },
   {
     val: "warning",
     icon: "⚠",
     label: "Issue Warning",
     desc: "Minor violation (max 3 warnings)",
     className: "action-warning",
   },
   {
     val: "suspended",
     icon: "🔒",
     label: "Suspend Account",
     desc: "Temporary lock — restorable later",
     className: "action-suspend",
   },
   {
     val: "blacklisted",
     icon: "⊘",
     label: "Blacklist Student",
     desc: "Permanent ban — cannot re-register",
     className: "action-blacklist",
   },
   {
     val: "active",
     icon: "✓",
     label: "Restore to Active",
     desc: "Clear all flags and reset status",
     className: "action-restore",
   },
 ];

  return (
    <div className="stu-modal-overlay" onClick={onClose}>
      <div className="stu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stu-modal-header">
          <div>
            <h2>Investigation Panel</h2>
            <p className="stu-modal-sub">
              Joined {new Date(student.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          <button className="stu-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="stu-modal-snapshot">
          <div className="stu-modal-avatar">
            {student.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="stu-modal-info">
            <h3>{student.name}</h3>
            <p>
              {student.email}
              {student.mobile ? ` · ${student.mobile}` : ""}
            </p>
            {student.college && (
              <p>
                {student.college}
                {student.course ? ` · ${student.course}` : ""}
              </p>
            )}
            {student.year && (
              <p>
                Year: <strong>{student.year}</strong>
              </p>
            )}
            {student.familyIncome && (
              <p>
                Income:{" "}
                <strong>
                  ₹{Number(student.familyIncome).toLocaleString("en-IN")}
                </strong>
              </p>
            )}
            {student.casteCategory && (
              <p>
                Category: <strong>{student.casteCategory}</strong>
              </p>
            )}
          </div>
          <div
            className="stu-modal-status-pill"
            style={{ color: st.color, background: st.bg }}
          >
            {st.icon} {st.label}
          </div>
        </div>

        <div className="stu-modal-stats">
          <div className="stu-mstat">
            <span
              style={{ color: student.warnings > 0 ? "#f97316" : "#7dd3f0" }}
            >
              {student.warnings}/3
            </span>
            <p>Warnings</p>
          </div>
          <div className="stu-mstat">
            <span
              style={{ color: student.profileComplete ? "#22c55e" : "#ef4444" }}
            >
              {student.profileComplete ? "Done" : "Empty"}
            </span>
            <p>Profile</p>
          </div>
          <div className="stu-mstat">
            <span style={{ color: doc.color }}>●</span>
            <p style={{ color: doc.color }}>{doc.label}</p>
          </div>
          <div className="stu-mstat">
            <span>{student.gender || "—"}</span>
            <p>Gender</p>
          </div>
        </div>

        <div className="stu-warn-section">
          <span className="stu-warn-label">Warning Progress (Max 3)</span>
          <div className="stu-warn-bar">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`stu-warn-seg ${i < student.warnings ? "stu-warn-filled" : ""}`}
              >
                {i < student.warnings ? `⚠ Warning ${i + 1}` : "—"}
              </div>
            ))}
          </div>
        </div>

        {student.suspiciousFlags?.length > 0 && (
          <div className="stu-flags-section">
            <p className="stu-flags-title">⚑ Suspicious Activity Detected</p>
            <div className="stu-flags-list">
              {student.suspiciousFlags.map((f, i) => (
                <span key={i} className="stu-flag-chip">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {!submitted ? (
          <>
            <p className="stu-action-title">Choose Action</p>
            <div className="stu-action-grid">
              {ACTIONS.map((opt) => (
                <button
                  key={opt.val}
                  className={`stu-action-card ${opt.className} ${
                    action === opt.val ? "stu-action-selected" : ""
                  }`}
                  onClick={() => setAction(opt.val)}
                >
                  <span className="stu-ac-icon">{opt.icon}</span>
                  <span className="stu-ac-label">{opt.label}</span>
                  <span className="stu-ac-desc">{opt.desc}</span>
                </button>
              ))}
            </div>

            <textarea
              className="stu-reason-input"
              placeholder="Reason (required — saved to Investigation Log)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />

            {error && <p className="stu-error-msg">⚠ {error}</p>}

            <div className="stu-modal-footer">
              <button className="stu-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="stu-submit-btn"
                disabled={!action || !reason.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? "Saving..." : "Confirm & Log Action"}
              </button>
            </div>
          </>
        ) : (
          <div className="stu-success-banner">
            <span>✓</span>
            Action saved to Investigation Log. Student will be notified.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Student Row ───────────────────────────────────────────────────────────────
function StudentRow({ student, onInvestigate, onViewForm }) {
  const st = STATUS_CONFIG[student.status] || STATUS_CONFIG.active;
  const doc = getDocStatus(student);

  return (
    <tr className="stu-row">
      <td>
        <div className="stu-identity">
          <div className="stu-avatar">
            {student.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="stu-name">{student.name}</p>
            <p className="stu-email">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="stu-income">
        {student.familyIncome ? (
          `₹${Number(student.familyIncome).toLocaleString("en-IN")}`
        ) : (
          <span className="stu-no-data">—</span>
        )}
      </td>
      <td>
        <span
          className="stu-status-badge"
          style={{ color: st.color, background: st.bg }}
        >
          {st.icon} {st.label}
        </span>
      </td>
      <td>
        <span className="stu-doc-badge" style={{ color: doc.color }}>
          ● {doc.label}
        </span>
      </td>
      <td>
        <div className="stu-warn-mini">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`stu-warn-dot ${i < student.warnings ? "stu-warn-dot-on" : ""}`}
            />
          ))}
          <span className="stu-warn-num">{student.warnings}/3</span>
        </div>
      </td>
      <td className="stu-joined">
        {new Date(student.createdAt).toLocaleDateString("en-IN")}
      </td>
      <td>
        {student.suspiciousFlags?.length > 0 && (
          <span
            className="stu-flag-dot"
            title={student.suspiciousFlags.join(", ")}
          >
            ⚑ {student.suspiciousFlags.length}
          </span>
        )}
      </td>
      <td>
      <button
  className="stu-view-btn"
  onClick={() => {
    if (!student.applicationId) {
      alert("No application submitted by this student.");
      return;
    }
    onViewForm(student.applicationId);
  }}
>
  View Form
</button>
      </td>
      <td>
        <button
          className="stu-investigate-btn"
          onClick={() => onInvestigate(student)}
        >
          Investigate
        </button>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Students() {
  const navigate = useNavigate();

  const handleViewForm = (id) => {
    navigate(`/admin/students/view-form/${id}`);
  };
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to load students");
      setStudents(data.students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleActionDone = (id, action) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s._id !== id) return s;
        if (action === "warning")
          return {
            ...s,
            warnings: Math.min((s.warnings || 0) + 1, 3),
            status: "warning_issued",
          };
        if (action === "active") return { ...s, status: "active", warnings: 0 };
        return { ...s, status: action };
      }),
    );
  };

  const counts = {
    all: students.length,
    active: students.filter((s) => s.status === "active").length,
    under_review: students.filter((s) => s.status === "under_review").length,
    warning_issued: students.filter((s) => s.status === "warning_issued")
      .length,
    suspended: students.filter((s) => s.status === "suspended").length,
    blacklisted: students.filter((s) => s.status === "blacklisted").length,
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.college?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const needsAttention =
    counts.under_review + counts.warning_issued + counts.suspended;

  const TABS = [
    { key: "all", label: "All Students" },
    { key: "active", label: "🟢 Active" },
    { key: "under_review", label: "🟡 Under Review" },
    { key: "warning_issued", label: "🟠 Warnings" },
    { key: "suspended", label: "🔴 Suspended" },
    { key: "blacklisted", label: "⚫ Blacklisted" },
  ];

  return (
    <div className="stu-page">
      <div className="stu-page-header">
        <div>
          <h1 className="stu-page-title">Student Management</h1>
          <p className="stu-page-sub">
            Monitor accounts · Investigate violations · Manage student status
          </p>
        </div>
        <div className="stu-header-right">
          <div className="stu-header-stats">
            <div className="stu-hstat stu-hstat-green">
              <span>{counts.active}</span>Active
            </div>
            <div className="stu-hstat stu-hstat-yellow">
              <span>{counts.under_review}</span>Review
            </div>
            <div className="stu-hstat stu-hstat-orange">
              <span>{counts.warning_issued}</span>Warned
            </div>
            <div className="stu-hstat stu-hstat-red">
              <span>{counts.suspended + counts.blacklisted}</span>Flagged
            </div>
          </div>
          <button
            className="stu-refresh-btn"
            onClick={fetchStudents}
            disabled={loading}
          >
            {loading ? "⟳" : "↻"} Refresh
          </button>
        </div>
      </div>

      {needsAttention > 0 && (
        <div className="stu-alert-banner">
          <span>⚠</span>
          <span>
            <strong>{needsAttention} student account(s)</strong> require admin
            attention.
          </span>
        </div>
      )}

      <div className="stu-filter-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`stu-filter-tab ${filterStatus === tab.key ? "stu-tab-active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            <span className="stu-tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="stu-search-bar">
        <span>🔍</span>
        <input
          type="text"
          className="stu-search-input"
          placeholder="Search by name, email or college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="stu-search-clear" onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="stu-loading">
          <div className="stu-spinner" />
          <p>Loading students...</p>
        </div>
      ) : error ? (
        <div className="stu-error-banner">
          <span>⚠</span> {error}
          <button onClick={fetchStudents}>Retry</button>
        </div>
      ) : (
        <div className="stu-table-wrapper">
          <table className="stu-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Family Income</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Warnings</th>
                <th>Joined</th>
                <th>Flags</th>
                <th>View Form</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="stu-empty-row">
                    {students.length === 0
                      ? "No students registered yet."
                      : "No students match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <StudentRow
                    key={s._id}
                    student={s}
                    onInvestigate={setSelected}
                    onViewForm={handleViewForm}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <div className="stu-footer-row">
          <span className="stu-total-count">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{students.length}</strong> students
          </span>
          <div className="stu-legend">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span
                key={key}
                className="stu-legend-item"
                style={{ color: cfg.color }}
              >
                {cfg.icon} {cfg.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <InvestigationModal
          student={selected}
          token={token}
          onClose={() => setSelected(null)}
          onActionDone={handleActionDone}
        />
      )}
    </div>
  );
}
