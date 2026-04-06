import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiList,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiInfo,
  FiFilter,
} from "react-icons/fi";
import "./AvailableSchemes.css";
import ApplyProfilePreview from "./ProfilePreviewPage";
import API from "../../api";

/* ─────────────────────────────────────────
   Utility
───────────────────────────────────────── */
function normalizeDocName(name = "") {
  const n = name.toLowerCase();
  if (n.includes("aadhaar") || n.includes("adhar")) return "aadhaar";
  if (n.includes("income")) return "income";
  if (n.includes("domicile")) return "domicile";
  if (n.includes("caste")) return "caste";
  if (n.includes("ration")) return "ration";
  if (n.includes("marksheet")) return "marksheet";
  if (n.includes("gap")) return "gap";
  return n.replace(/\s+/g, "").replace(/_/g, "");
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* ─────────────────────────────────────────
   Eligibility helpers  (frontend fallback —
   real scoring comes from backend now)
───────────────────────────────────────── */
function checkNonDocEligibility(student, scheme) {
  const e = scheme.eligibility || {};
  const checks = [];
  if (e.min_percentile != null) checks.push(student.percentile >= e.min_percentile);
  if (e.max_income != null)     checks.push(student.family_income <= e.max_income);
  if (e.departments?.length)    checks.push(e.departments.includes(student.department));
  if (e.gender)                 checks.push(student.gender === e.gender);
  if (checks.length === 0) return { passRatio: 1 };
  return { passRatio: checks.filter(Boolean).length / checks.length };
}

function determineStatus(student, scheme) {
  const now = new Date();
  const open =
    (!scheme.startDate || now >= scheme.startDate) &&
    (!scheme.lastDate  || now <= scheme.lastDate);
  if (!open) return "closed";

  const nonDoc      = checkNonDocEligibility(student, scheme);
  const requiredDocs = scheme.requiredDocuments || [];
  const uploadedDocs = student.uploaded_documents || [];

  const uploadedRequiredCount = requiredDocs.filter((d) =>
    uploadedDocs.some((u) => normalizeDocName(u) === normalizeDocName(d))
  ).length;

  const totalRequired = requiredDocs.length;

  if (totalRequired > 0 && uploadedRequiredCount === totalRequired)
    return nonDoc.passRatio === 1 ? "eligible" : "partially";
  if (totalRequired > 0 && uploadedRequiredCount < totalRequired) return "partially";
  if (nonDoc.passRatio === 1) return "eligible";
  return "partially";
}

/* ─────────────────────────────────────────
   Urgency badge
───────────────────────────────────────── */
function UrgencyBadge({ days }) {
  if (days == null) return null;
  if (days < 0)  return null; // already closed, handled by status
  if (days <= 3) return <span className="urgency-badge critical">⚡ Closes in {days}d</span>;
  if (days <= 7) return <span className="urgency-badge warning">🕐 {days} days left</span>;
  return null;
}

/* ─────────────────────────────────────────
   Why-eligible tooltip / panel
───────────────────────────────────────── */
function EligibilityReasons({ reasons, ineligibleReason }) {
  const [open, setOpen] = useState(false);

  if (ineligibleReason) {
    return (
      <span className="reason-pill ineligible" title={ineligibleReason}>
        <FiInfo size={12} /> Not eligible
      </span>
    );
  }

  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="reasons-wrapper">
      <button
        className="reason-pill eligible"
        onClick={() => setOpen((v) => !v)}
      >
        <FiInfo size={12} /> Why eligible
      </button>

      {open && (
        <div className="reasons-dropdown">
          <ul>
            {reasons.map((r, i) => (
              <li key={i}>✓ {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Missing-docs inline alert
───────────────────────────────────────── */
function MissingDocsAlert({ docs }) {
  if (!docs || docs.length === 0) return null;
  return (
    <div className="missing-docs-alert">
      <FiAlertCircle size={13} />
      <span>Missing: {docs.join(", ")}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Scheme Tabs
───────────────────────────────────────── */
function SchemeTabs({ activeTab, onChange }) {
  const tabs = [
    { id: "all",         label: "All Schemes",        icon: <FiList /> },
    { id: "eligible",    label: "Eligible",            icon: <FiCheckCircle /> },
    { id: "partially",   label: "Pending Documents",   icon: <FiAlertCircle /> },
    { id: "gov",         label: "Gov Schemes",         icon: <FiStar /> },
    { id: "recommended", label: "AI Recommended",      icon: <FiStar /> },
  ];

  return (
    <aside className="vs-left">
      <div className="vs-left-head">
        <h3>Scheme Tabs</h3>
      </div>
      <div className="vs-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`vs-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => onChange(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Category filter bar (shown in recommended tab)
───────────────────────────────────────── */
const CATEGORIES = ["All", "Merit", "Need-based", "Girls", "SC/ST/OBC", "Disability", "Govt"];

function CategoryFilterBar({ active, onChange }) {
  return (
    <div className="category-filter-bar">
      <FiFilter size={14} />
      {CATEGORIES.map((c) => (
        <button
          key={c}
          className={`cat-filter-btn ${active === c ? "active" : ""}`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function AvailableSchemes() {
  const navigate = useNavigate();

  const [schemes,        setSchemes]        = useState([]);
  const [govSchemes,     setGovSchemes]     = useState([]);
  const [student,        setStudent]        = useState(null);
  const [activeTab,      setActiveTab]      = useState("all");
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [appliedSchemeIds,  setAppliedSchemeIds]  = useState([]);
  const [showUploadPopup,   setShowUploadPopup]   = useState(false);
  const [uploadTargetScheme,setUploadTargetScheme]= useState(null);
  const [showConfirm,       setShowConfirm]       = useState(false);
  const [selectedScheme,    setSelectedScheme]    = useState(null);
  const [fullProfile,       setFullProfile]       = useState(null);
  const [applying,          setApplying]          = useState(false);
  const [infoPopup,         setInfoPopup]         = useState({ show: false, message: "", type: "info" });

  /* ── Fetch student profile for frontend eligibility ── */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API}/api/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.profile) return;

        const p            = data.profile;
        const uploadedDocs = [];

        if (p.personal?.aadhaar)             uploadedDocs.push("Aadhaar Card");
        if (p.personal?.incomeCertificate)   uploadedDocs.push("Income Certificate");
        if (p.personal?.domicileCertificate) uploadedDocs.push("Domicile Certificate");
        if (p.personal?.casteCertificate)    uploadedDocs.push("Caste Certificate");
        (p.personal?.otherDocuments || []).forEach((d) => {
          if (d.documentName) uploadedDocs.push(d.documentName);
        });
        if (p.courseList?.marksheet)                uploadedDocs.push("Last Year Marksheet");
        if (p.qualificationRecords?.marksheet)      uploadedDocs.push("Past Qualification Marksheet");
        if (p.qualificationRecords?.gapCertificate) uploadedDocs.push("Gap Certificate");

        setStudent({ ...p, uploaded_documents: uploadedDocs });
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, []);

  /* ── Fetch schemes with AI scoring from backend ── */
  useEffect(() => {
    async function fetchSchemes() {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API}/api/ai/all-with-ai`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSchemes(data.schemes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemes();
  }, []);

  /* ── Fetch gov schemes ── */
  useEffect(() => {
    async function fetchGovSchemes() {
      try {
        const res  = await fetch(`${API}/api/gov-schemes`);
        const data = await res.json();
        setGovSchemes(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchGovSchemes();
  }, []);

  /* ── Fetch applied scheme IDs ── */
  useEffect(() => {
    async function fetchApplied() {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API}/api/applications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAppliedSchemeIds(
          data.applications.map((a) => a.schemeId?._id || a.schemeId)
        );
      } catch (err) {
        console.error(err);
      }
    }
    fetchApplied();
  }, []);

  /* ── Enrich schemes with frontend status + normalised fields ── */
  const enriched = useMemo(() => {
    if (!student) return [];

    return schemes.map((raw) => {
      const s = {
        ...raw,
        amount:           raw.amount ?? raw.scholarshipAmount ?? 0,
        startDate:        safeDate(raw.startDate  || raw.createdAt),
        lastDate:         safeDate(raw.lastDate   || raw.deadline),
        requiredDocuments: raw.documents || [],
      };

      // Use backend-provided missingDocs if available, otherwise compute
      const missingDocs =
        Array.isArray(raw.missingDocs) && raw.missingDocs.length >= 0
          ? raw.missingDocs
          : (s.requiredDocuments || []).filter((d) => {
              const norm = normalizeDocName(d);
              return !(student.uploaded_documents?.map(normalizeDocName) || []).includes(norm);
            });

      // Use backend urgencyDays if provided, else compute
      const urgencyDays =
        raw.urgencyDays != null ? raw.urgencyDays : daysUntil(s.lastDate);

      return {
        ...s,
        status:              determineStatus(student, s),
        missingDocs,
        urgencyDays,
        // backend-provided AI fields (fallback to empty)
        matchPercentage:     raw.matchPercentage     ?? 0,
        matchedReasons:      raw.matchedReasons      ?? [],
        isHardIneligible:    raw.isHardIneligible    ?? false,
        hardIneligibleReason:raw.hardIneligibleReason ?? null,
        docReadiness:        raw.docReadiness        ?? "complete",
        isNew:               raw.isNew               ?? false,
      };
    });
  }, [schemes, student]);

  /* ── Apply category filter for recommended tab ── */
  function matchesCategory(scheme, cat) {
    if (cat === "All") return true;
    const name = (scheme.schemeName || "").toLowerCase();
    const cat_ = (scheme.category   || "").toLowerCase();
    if (cat === "Merit")      return name.includes("merit") || cat_.includes("merit");
    if (cat === "Need-based") return name.includes("need") || cat_.includes("need") || cat_.includes("income");
    if (cat === "Girls")      return (scheme.gender || "").toLowerCase() === "female" || name.includes("girl") || name.includes("woman");
    if (cat === "SC/ST/OBC")  return ["sc","st","obc"].includes(cat_) || name.includes("sc") || name.includes("st") || name.includes("obc");
    if (cat === "Disability") return scheme.forDisabled === true || name.includes("disab") || name.includes("handicap");
    if (cat === "Govt")       return name.includes("govt") || name.includes("government") || name.includes("national") || name.includes("central");
    return true;
  }

  /* ── Final filtered list ── */
  const filtered = useMemo(() => {
    if (activeTab === "gov") return [];

    let list = enriched;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        (s.schemeName || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
      );
    }

    if (activeTab === "recommended") {
      // Exclude hard-ineligible schemes
      list = list.filter((s) => !s.isHardIneligible);
      // Apply category filter
      list = list.filter((s) => matchesCategory(s, categoryFilter));
      // Sort by match % desc, then deadline asc
      return [...list].sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage)
          return b.matchPercentage - a.matchPercentage;
        if (a.urgencyDays == null) return 1;
        if (b.urgencyDays == null) return -1;
        return a.urgencyDays - b.urgencyDays;
      });
    }

    if (activeTab === "eligible")  return list.filter((s) => s.status === "eligible");
    if (activeTab === "partially") return list.filter((s) => s.status === "partially");

    return list;
  }, [enriched, activeTab, search, categoryFilter]);

  /* ── Loading / no profile state ── */
  if (loading || !student) {
    return (
      <div className="vs-warning-box">
        <div className="vs-warning-icon">⚠️</div>
        <div className="vs-warning-content">
          <h3>Profile Required</h3>
          <p>Please complete your profile details to unlock and view available schemes.</p>
          <button className="vs-warning-btn" onClick={() => navigate("/student/profile")}>
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="vs-schemes-root tidy">
      <SchemeTabs activeTab={activeTab} onChange={setActiveTab} />

      <main className="vs-main">
        <header className="vs-header">
          <h1 className="vs-title">Available Schemes</h1>
          <input
            className="vs-input"
            placeholder="Search schemes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </header>

        {/* Category filter bar — only in recommended tab */}
        {activeTab === "recommended" && (
          <CategoryFilterBar active={categoryFilter} onChange={setCategoryFilter} />
        )}

        <section className="vs-card">
          {/* ── GOV SCHEMES ── */}
          {activeTab === "gov" ? (
            <div className="gov-grid">
              {govSchemes.length === 0 ? (
                <p>No Government Schemes Available</p>
              ) : (
                govSchemes.map((scheme) => (
                  <div key={scheme._id} className="gov-card">
                    <div className="gov-card-header">
                      <h3>{scheme.name}</h3>
                    </div>
                    <p className="gov-desc">{scheme.description}</p>
                    <a
                      href={scheme.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gov-visit-btn"
                    >
                      Visit Official Portal
                    </a>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ── SCHEME TABLE ── */
            <table className="vs-table">
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Amount</th>
                  <th>Last Date</th>
                  <th>AI Match</th>
                  <th>Status</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
                      No schemes found
                    </td>
                  </tr>
                )}

                {filtered.map((s) => (
                  <tr key={s._id} className={s.isNew ? "row-new" : ""}>

                    {/* ── Scheme Name + badges ── */}
                    <td>
                      <div className="scheme-name-cell">
                        <span className="scheme-name">{s.schemeName}</span>

                        <div className="scheme-badges">
                          {/* NEW badge */}
                          {s.isNew && <span className="badge-new">NEW</span>}
                          {s.matchPercentage >= 70 && !s.isHardIneligible && (
  <span className="badge-recommended">⭐ Highly Recommended</span>
)}

                          {/* Urgency badge */}
                          <UrgencyBadge days={s.urgencyDays} />

                          {/* Why eligible / not eligible */}
                          {activeTab === "recommended" && (
                            <EligibilityReasons
                              reasons={s.matchedReasons}
                              ineligibleReason={s.hardIneligibleReason}
                            />
                          )}
                        </div>

                        {/* Missing docs alert inline */}
                        {s.missingDocs?.length > 0 && s.status !== "closed" && (
                          <MissingDocsAlert docs={s.missingDocs} />
                        )}
                      </div>
                    </td>

                    {/* ── Amount ── */}
                    <td>₹{s.amount}</td>

                    {/* ── Last Date ── */}
                    <td>
                      {s.lastDate
                        ? new Date(s.lastDate).toLocaleDateString("en-GB")
                        : "No deadline"}
                    </td>

                    {/* ── AI Match ── */}
                    <td>
                      <div className="ai-match-box">
                        <div
                          className={`ai-badge ${
                            s.matchPercentage >= 80
                              ? "high"
                              : s.matchPercentage >= 50
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {s.matchPercentage}% Match
                        </div>
                        <div className="ai-progress">
                          <div
                            className="ai-progress-fill"
                            style={{
                              width: `${s.matchPercentage}%`,
                              background:
                                s.matchPercentage >= 80
                                  ? "#22c55e"
                                  : s.matchPercentage >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                        {/* Doc readiness pill */}
                        {s.requiredDocuments?.length > 0 && (
                          <span className={`doc-readiness ${s.docReadiness}`}>
                            {s.docReadiness === "complete"
                              ? "✓ Docs ready"
                              : s.docReadiness === "partial"
                              ? `⚠ ${s.missingDocs.length} doc(s) missing`
                              : "✗ Docs needed"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ── Status ── */}
                    <td>
                      <span className={`status ${s.status}`}>
                        {s.status === "partially" ? "Pending Docs" : s.status}
                      </span>
                    </td>

                    {/* ── View ── */}
                    <td>
                      <button
                        className="vs-btn outline"
                        onClick={() => navigate(`/student/view-scheme/${s._id}`)}
                      >
                        View
                      </button>
                    </td>

                    {/* ── Action ── */}
                    <td>
                      {appliedSchemeIds.includes(s._id) ? (
                        <button className="vs-btn disabled" disabled>Applied</button>

                      ) : s.status === "eligible" ? (
                        <button
                          className="vs-btn primary"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              const res   = await fetch(`${API}/api/student/profile`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setInfoPopup({ show: true, message: "Failed to fetch profile", type: "warning" });
                                return;
                              }
                              setFullProfile(data.profile);
                              setSelectedScheme(s);
                              setShowConfirm(true);
                            } catch {
                              setInfoPopup({ show: true, message: "Something went wrong", type: "error" });
                            }
                          }}
                        >
                          Apply
                        </button>

                      ) : s.status === "partially" ? (
                        <button
                          className="vs-btn outline"
                          onClick={() => {
                            setUploadTargetScheme(s);
                            setShowUploadPopup(true);
                          }}
                        >
                          Upload Docs
                        </button>

                      ) : (
                        <button className="vs-btn disabled" disabled>Closed</button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Confirm Application Modal ── */}
        {showConfirm && fullProfile && (
          <div className="vs-modal-backdrop">
            <div className="vs-modal vs-modal-xl">
              <h2>Confirm Application</h2>
              <ApplyProfilePreview profile={fullProfile} />
              <div className="vs-modal-actions">
                <button className="vs-btn outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
                <button
                  className="vs-btn primary"
                  disabled={applying}
                  onClick={async () => {
                    try {
                      setApplying(true);
                      const token = localStorage.getItem("token");
                      const res   = await fetch(`${API}/api/applications/apply`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ schemeId: selectedScheme._id }),
                      });

                      if (!res.ok) {
                        const data = await res.json();
                        setInfoPopup({ show: true, message: data.message || "Application failed", type: "warning" });
                        return;
                      }

                      setAppliedSchemeIds((prev) =>
                        prev.includes(selectedScheme._id) ? prev : [...prev, selectedScheme._id]
                      );
                      setInfoPopup({ show: true, message: "Application submitted successfully!", type: "success" });
                      setShowConfirm(false);
                    } catch {
                      setInfoPopup({ show: true, message: "Apply failed. Please try again.", type: "error" });
                    } finally {
                      setApplying(false);
                    }
                  }}
                >
                  Confirm & Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Upload Documents Modal ── */}
        {showUploadPopup && uploadTargetScheme && (
          <div className="vs-modal-backdrop">
            <div className="vs-modal">
              <h2>Documents Required</h2>
              <p style={{ marginTop: 8, color: "var(--color-text-secondary)", fontSize: 14 }}>
                Upload the following documents in your profile to apply:
              </p>
              <ul style={{ marginTop: 10, marginLeft: 20, lineHeight: 1.8 }}>
                {uploadTargetScheme.missingDocs.map((doc, i) => (
                  <li key={i}>📄 {doc}</li>
                ))}
              </ul>
              <div className="vs-modal-actions">
                <button
                  className="vs-btn outline"
                  onClick={() => { setShowUploadPopup(false); setUploadTargetScheme(null); }}
                >
                  Cancel
                </button>
                <button
                  className="vs-btn primary"
                  onClick={() => navigate("/student/profile", { state: { scrollTo: "other-documents" } })}
                >
                  Go to Profile & Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Info / Success / Error Modal ── */}
        {infoPopup.show && (
          <div className="vs-modal-backdrop">
            <div className="vs-modal vs-info-modal">
              <div className={`vs-info-icon ${infoPopup.type}`}>
                {infoPopup.type === "success" ? "✓" : "!"}
              </div>
              <h2>
                {infoPopup.type === "success"
                  ? "Success"
                  : infoPopup.type === "warning"
                  ? "Notice"
                  : "Error"}
              </h2>
              <p className="vs-info-message">{infoPopup.message}</p>
              <div className="vs-modal-actions">
                <button
                  className="vs-btn primary"
                  onClick={() => setInfoPopup({ show: false, message: "", type: "info" })}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}