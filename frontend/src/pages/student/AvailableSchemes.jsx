import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiList, FiCheckCircle, FiAlertCircle, FiStar } from "react-icons/fi";
import "./AvailableSchemes.css";
import ApplyProfilePreview from "./ProfilePreviewPage";
import API from "../../api";

/* -------------------------
   Utility
------------------------- */
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

/* -------------------------
   Eligibility helpers
------------------------- */
function checkNonDocEligibility(student, scheme) {
  const e = scheme.eligibility || {};
  const checks = [];

  if (e.min_percentile != null)
    checks.push(student.percentile >= e.min_percentile);

  if (e.max_income != null) checks.push(student.family_income <= e.max_income);

  if (e.departments?.length)
    checks.push(e.departments.includes(student.department));

  if (e.gender) checks.push(student.gender === e.gender);

  if (checks.length === 0) return { passRatio: 1 };
  return { passRatio: checks.filter(Boolean).length / checks.length };
}

function determineStatus(student, scheme) {
  const now = new Date();

  const open =
    (!scheme.startDate || now >= scheme.startDate) &&
    (!scheme.lastDate || now <= scheme.lastDate);

  if (!open) return "closed";

  const nonDoc = checkNonDocEligibility(student, scheme);

  const requiredDocs = scheme.requiredDocuments || [];
  const uploadedDocs = student.uploaded_documents || [];

  const uploadedRequiredCount = requiredDocs.filter((d) =>
    uploadedDocs.some((u) => normalizeDocName(u) === normalizeDocName(d)),
  ).length;

  const totalRequired = requiredDocs.length;

  // ✅ All docs uploaded + non-doc eligibility pass
  if (totalRequired > 0 && uploadedRequiredCount === totalRequired) {
    return nonDoc.passRatio === 1 ? "eligible" : "partially";
  }

  // 🟡 Missing some or all docs
  if (totalRequired > 0 && uploadedRequiredCount < totalRequired) {
    return "partially";
  }

  // 🔹 No doc requirement
  if (nonDoc.passRatio === 1) return "eligible";
  return "partially";
}

/* -------------------------
   Tabs
------------------------- */
function SchemeTabs({ activeTab, onChange }) {
  const tabs = [
    { id: "all", label: "All Schemes", icon: <FiList /> },
    { id: "eligible", label: "Eligible", icon: <FiCheckCircle /> },
    { id: "partially", label: "Pending Documents", icon: <FiAlertCircle /> },
    { id: "gov", label: "Gov Schemes", icon: <FiStar /> },
    { id: "recommended", label: " Ai Recommended", icon: <FiStar /> },
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

/* -------------------------
   MAIN COMPONENT
------------------------- */
export default function AvailableSchemes() {
  const navigate = useNavigate();
  
  const [schemes, setSchemes] = useState([]);
  const [govSchemes, setGovSchemes] = useState([]);
  const [student, setStudent] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [appliedSchemeIds, setAppliedSchemeIds] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadTargetScheme, setUploadTargetScheme] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [infoPopup, setInfoPopup] = useState({
  show: false,
  message: "",
  type: "info", // success | warning | error
});


  /* -------------------------
     FETCH PROFILE FOR ELIGIBILITY
  ------------------------- */
  useEffect(() => {
    async function fetchProfileForEligibility() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.profile) return;

        const p = data.profile;
        const uploadedDocs = [];

        if (p.personal?.aadhaar) uploadedDocs.push("Aadhaar Card");
        if (p.personal?.incomeCertificate)
          uploadedDocs.push("Income Certificate");
        if (p.personal?.domicileCertificate)
          uploadedDocs.push("Domicile Certificate");
        if (p.personal?.casteCertificate)
          uploadedDocs.push("Caste Certificate");

        (p.personal?.otherDocuments || []).forEach((d) => {
          if (d.documentName) uploadedDocs.push(d.documentName);
        });

        if (p.courseList?.marksheet) uploadedDocs.push("Last Year Marksheet");

        if (p.qualificationRecords?.marksheet)
          uploadedDocs.push("Past Qualification Marksheet");

        if (p.qualificationRecords?.gapCertificate)
          uploadedDocs.push("Gap Certificate");

        setStudent({
          ...p,
          uploaded_documents: uploadedDocs,
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchProfileForEligibility();
  }, []);

  /* -------------------------
     FETCH SCHEMES
  ------------------------- */
 useEffect(() => {
  async function fetchSchemes() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/api/ai/all-with-ai`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      console.log("AI API Response:", data); // 👈 ADD THIS

      if (!data || !Array.isArray(data.schemes)) {
  console.error("Invalid API response", data);
  setSchemes([]);
} else {
  setSchemes(data.schemes);
}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchSchemes();
}, []);

  /* -------------------------
   FETCH GOV SCHEMES
------------------------- */
useEffect(() => {
  async function fetchGovSchemes() {
    try {
      const res = await fetch(`${API}/api/gov-schemes`);
      const data = await res.json();
      setGovSchemes(data || []);
    } catch (err) {
      console.error("Error fetching gov schemes:", err);
    }
  }

  fetchGovSchemes();
}, []);

  /* -------------------------
     FETCH APPLIED SCHEMES
  ------------------------- */
  useEffect(() => {
    async function fetchApplied() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/applications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAppliedSchemeIds(
          data.applications.map((a) => a.schemeId?._id || a.schemeId),
        );
      } catch (err) {
        console.error(err);
      }
    }
    fetchApplied();
  }, []);

  function safeDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  function normalizeScheme(s) {
    return {
      ...s,
      amount: s.amount ?? s.scholarshipAmount ?? 0,
      startDate: safeDate(s.startDate || s.createdAt),
      lastDate: safeDate(s.lastDate || s.deadline),
      requiredDocuments: s.documents || [],
    };
  }

  const enriched = useMemo(() => {
    if (!student) return [];
    return schemes.map((raw) => {
      const s = normalizeScheme(raw);
      const missingDocs = (s.requiredDocuments || []).filter((d) => {
        const norm = normalizeDocName(d);
        return !student.uploaded_documents
          ?.map(normalizeDocName)
          .includes(norm);
      });

      return {
        ...s,
        status: determineStatus(student, s),
        missingDocs,
      };
    });
  }, [schemes, student]);

  const filtered = useMemo(() => {
  if (activeTab === "gov") return [];

  let list = enriched;

  if (activeTab === "recommended") {
    return [...list].sort(
      (a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)
    );
  }

  if (activeTab === "eligible")
    return list.filter((s) => s.status === "eligible");

  if (activeTab === "partially")
    return list.filter((s) => s.status === "partially");

  return list;
}, [enriched, activeTab]);

  if (loading || !student) {
  return (
    <div className="vs-warning-box">
      <div className="vs-warning-icon">⚠️</div>

      <div className="vs-warning-content">
        <h3>Profile Required</h3>
        <p>
          Please complete your profile details to unlock and view available schemes.
        </p>

        <button
          className="vs-warning-btn"
          onClick={() => navigate("/student/profile")}
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
}

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

        <section className="vs-card">
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
) : (            <table className="vs-table">
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
                {Array.isArray(filtered) && filtered.map((s) => (
                  <tr key={s._id}>
                    <td>{s.schemeName}</td>
                    <td>₹{s.amount}</td>
                    <td>
                      {s.lastDate
  ? new Date(s.lastDate).toLocaleDateString("en-GB")
  : "No deadline"}
 
                    </td>
                     {/* ✅ AI MATCH COLUMN */}
  <td>
    <div className="ai-match-box">
      <div className="ai-badge">
        {s.matchPercentage || 0}% Match
      </div>

      <div className="ai-progress">
        <div
          className="ai-progress-fill"
          style={{ width: `${s.matchPercentage || 0}%` }}
        ></div>
      </div>
    </div>
  </td>

                    <td className={`status ${s.status}`}>
                      {s.status === "partially"
                        ? "Pending Documents"
                        : s.status}
                    </td>

                    {/* ✅ NEW VIEW COLUMN */}
                    <td>
                      <button
                        className="vs-btn outline"
                      
onClick={() => navigate(`/student/view-scheme/${s._id}`)}
                      >
                        View
                      </button>
                    </td>

                    {/* ACTION COLUMN */}
                    <td>
  {appliedSchemeIds.includes(s._id) ? (
    <button className="vs-btn disabled" disabled>
      Applied
    </button>
  ) : s.status === "eligible" ? (
    <button
      className="vs-btn primary"
      onClick={async () => {
        try {
          const token = localStorage.getItem("token");

          // Fetch full profile before confirm
          const res = await fetch(
            `${API}/api/student/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await res.json();
          if (!res.ok) {
            setInfoPopup({
              show: true,
              message: "Failed to fetch profile",
            });
            return;
          }

          setFullProfile(data.profile);
          setSelectedScheme(s);
          setShowConfirm(true);
        } catch (err) {
          setInfoPopup({
            show: true,
            message: "Something went wrong",
          });
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
      Upload Documents
    </button>
  ) : (
    <button className="vs-btn disabled" disabled>
      Closed
    </button>
  )}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {showConfirm && fullProfile && (
          <div className="vs-modal-backdrop">
            <div className="vs-modal vs-modal-xl">
              <h2>Confirm Application</h2>
              <ApplyProfilePreview profile={fullProfile} />

              <div className="vs-modal-actions">
                <button
                  className="vs-btn outline"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button
                  className="vs-btn primary"
                  disabled={applying}
                  onClick={async () => {
                    try {
                      setApplying(true);
                      const token = localStorage.getItem("token");
                      const res = await fetch(
                        `${API}/api/applications/apply`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            schemeId: selectedScheme._id,
                          }),
                        },
                      );

                      if (!res.ok) {
  const data = await res.json();
  setInfoPopup({
    show: true,
    message: data.message || "Application failed",
    type: "warning",   // ✅ ADD THIS
  });
  return;
}


                      setAppliedSchemeIds((prev) =>
                        prev.includes(selectedScheme._id)
                          ? prev
                          : [...prev, selectedScheme._id],
                      );

                      setInfoPopup({
  show: true,
  message: "Application submitted successfully",
  type: "success",   // ✅ ADD THIS
});


                      setShowConfirm(false);
                    } catch {
                      alert("Apply failed");
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

        {showUploadPopup && uploadTargetScheme && (
          <div className="vs-modal-backdrop">
            <div className="vs-modal">
              <h2>Documents Required</h2>

              <ul style={{ marginTop: 10, marginLeft: 20 }}>
                {uploadTargetScheme.missingDocs.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>

              <div className="vs-modal-actions">
                <button
                  className="vs-btn outline"
                  onClick={() => {
                    setShowUploadPopup(false);
                    setUploadTargetScheme(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="vs-btn primary"
                  onClick={() => {
                    navigate("/student/profile", {
                      state: { scrollTo: "other-documents" },
                    });
                  }}
                >
                  Continue to Upload
                </button>
              </div>
            </div>
          </div>
        )}
        {infoPopup.show && (
          <div className="vs-modal-backdrop">
            <div className="vs-modal vs-info-modal">
              <div className={`vs-info-icon ${infoPopup.type}`}>
  {infoPopup.type === "success" ? "✓" : "!"}
</div>


              <h2>Information</h2>

              <p className="vs-info-message">{infoPopup.message}</p>

              <div className="vs-modal-actions">
                <button
                  className="vs-btn primary"
                  onClick={() => setInfoPopup({ show: false, message: "" })}
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
