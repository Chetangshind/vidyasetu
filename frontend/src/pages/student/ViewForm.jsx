import { useNavigate, useParams } from "react-router-dom";
import React, { useRef, useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import "./ViewForm.css";
import API from "../../api";

export default function ViewForm() {
  const printRef = useRef();
  const [showDocs, setShowDocs] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const navigate = useNavigate();
const { id } = useParams();
  const a = profile?.address || {};
  const perm = a.perm || {};
  const corr = a.corr || {};
  const other = profile?.other || {};
  const currentCourse = profile?.courseList || {};
  const rawQualifications = profile?.qualificationRecords;

  const qualifications = Array.isArray(rawQualifications)
    ? rawQualifications
    : rawQualifications && typeof rawQualifications === "object"
      ? Object.values(rawQualifications).filter(
          (q) => q && typeof q === "object" && q.levelGroup,
        )
      : [];
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      let url = "";
      let isApplicationView = false;

      // ✅ 1. If ID exists → it is application snapshot
      if (id) {
        url = `${API}/api/applications/${id}`;
        isApplicationView = true;
      }

      // ✅ 2. If no ID → normal student profile preview
      else {
        url = `${API}/api/student/profile`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (isApplicationView) {
          setProfile(data.application.formSnapshot); // ✅ SNAPSHOT
        } else {
          setProfile(data.profile); // ✅ LIVE PROFILE
        }
      } else {
        setProfile(null);
      }

    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [id]);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;

    const win = window.open("", "", "width=900,height=650,scrollbars=yes");
    win.document.write(`
      <html>
        <head>
          <title>Profile Preview</title>
          <link rel="stylesheet" href="${window.location.origin}/ViewForm.css" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
    }, 500);
  };

 if (loading)
  return <p style={{ padding: 20 }}>Loading application preview...</p>;

if (!profile)
  return <p style={{ padding: 20 }}>No profile submitted yet.</p>;

  const p = profile.personal || {};
  const q = profile.qualificationRecords || {};
  const bank = profile?.collegeBank || {};
  const hostel = profile?.hostelRecords?.records?.[0] || {};

  const buildUploadedDocs = (profile) => {
    const docs = [];
    if (!profile) return docs;

    const p = profile.personal || {};
    const bank = profile.collegeBank || {};
    const course = profile.courseList || {};
    const qualsRaw = profile.qualificationRecords;

    // Personal docs
    if (p.incomeCertificate) {
      docs.push({ name: "Income Certificate", file: p.incomeCertificate });
    }

    if (p.domicileCertificate) {
      docs.push({ name: "Domicile Certificate", file: p.domicileCertificate });
    }

    if (Array.isArray(p.otherDocuments)) {
      p.otherDocuments.forEach((d) => {
        if (d?.file) {
          docs.push({
            name: d.documentName || "Other Document",
            file: d.file,
          });
        }
      });
    }

    // Current course marksheet
    if (course.marksheet) {
      docs.push({
        name: "Last Year Marksheet (Current Course)",
        file: course.marksheet,
      });
    }

    // ✅ Past qualification ROOT gap certificate  ← यही डालना है
    if (qualsRaw?.gapCertificate) {
      docs.push({
        name: "Gap Certificate (Past Qualification)",
        file: qualsRaw.gapCertificate,
      });
    }

    // ✅ FIX: PAST QUALIFICATION ROOT MARKSHEET
    if (qualsRaw?.marksheet) {
      docs.push({
        name: "Past Qualification Marksheet",
        file: qualsRaw.marksheet,
      });
    }

    // Existing qualification loop (UNCHANGED)
    const qualifications = Array.isArray(qualsRaw)
      ? qualsRaw
      : qualsRaw && typeof qualsRaw === "object"
        ? Object.values(qualsRaw)
        : [];

    qualifications.forEach((q, idx) => {
      if (Array.isArray(q?.marksheet)) {
        q.marksheet.forEach((file, i) => {
          docs.push({
            name: `Marksheet - ${q.qualificationLevel || `Qualification ${idx + 1}`} (${i + 1})`,
            file,
          });
        });
      }

      if (q?.gapCertificate) {
        docs.push({
          name: `Gap Certificate - ${q.qualificationLevel || ""}`,
          file: q.gapCertificate,
        });
      }
    });

    if (bank.collegeQR) {
      docs.push({
        name: "College UPI QR Code",
        file: bank.collegeQR,
      });
    }

    return docs;
  };

  const uploadedDocs = buildUploadedDocs(profile);

  return (
    <>
      {/* ================= PRINTABLE CONTENT ================= */}
      <div ref={printRef} className="msbte-container">
        <h2 className="msbte-title">Profile Preview</h2>

        {/* LOGO BADGE */}
        <div className="msbte-logo-badge"></div>

        {/* DATE */}
        <div className="msbte-date-display">
          DATE : {new Date().toLocaleDateString("en-GB")}
        </div>

        <Section title="Personal Information">
          <Row label="Aadhaar Number" value={p.aadhaar || "—"} />
          <Row label="Full Name" value={p.name || "—"} />
          <Row label="Email ID" value={p.email || "—"} />
          <Row label="Mobile Number" value={p.mobile || "—"} />
          <Row label="Parent Mobile" value={p.parentMobile || "—"} />
          <Row label="Date of Birth" value={p.dob || "—"} />
          <Row label="Age" value={p.age || "—"} />
          <Row label="Gender" value={p.gender || "—"} />

          <Row label="Religion" value={p.religion || "—"} />
          <Row label="Caste Category" value={p.casteCategory || "—"} />
          <Row label="Caste" value={p.caste || "—"} />
          <Row label="Sub Caste" value={p.subCaste || "—"} />

          <Row
            label="Family Annual Income"
            value={p.income ? `₹${p.income}` : "—"}
          />

          <Row label="Disability" value={p.disability || "—"} />
          <Row label="Salaried" value={p.salaried || "—"} />
        </Section>

        <Section title="Address Information">
          {/* Permanent Address */}
          <Row label="Permanent Address" value={perm.address || "—"} />
          <Row label="State" value={perm.state || "—"} />
          <Row label="District" value={perm.district || "—"} />
          <Row label="Taluka" value={perm.taluka || "—"} />
          <Row label="Village" value={perm.village || "—"} />
          <Row label="Pincode" value={perm.pincode || "—"} />

          {/* Correspondence Address */}
          <Row
            label="Correspondence Address Same As Permanent"
            value={a.same ? "Yes" : "No"}
          />

          {!a.same && (
            <>
              <Row label="Correspondence Address" value={corr.address || "—"} />
              <Row label="Correspondence State" value={corr.state || "—"} />
              <Row
                label="Correspondence District"
                value={corr.district || "—"}
              />
              <Row label="Correspondence Taluka" value={corr.taluka || "—"} />
              <Row label="Correspondence Village" value={corr.village || "—"} />
              <Row label="Correspondence Pincode" value={corr.pincode || "—"} />
            </>
          )}
        </Section>

        <Section title="Other Information">
          <Row label="Is Father Alive" value={other.fatherAlive || "—"} />
          <Row
            label="Father Name"
            value={other.fatherAlive === "No" ? "—" : other.fatherName || "—"}
          />
          <Row
            label="Father Occupation"
            value={
              other.fatherAlive === "No" ? "—" : other.fatherOccupation || "—"
            }
          />
          <Row
            label="Father Salaried"
            value={
              other.fatherAlive === "No" ? "—" : other.fatherSalaried || "—"
            }
          />

          <Row label="Is Mother Alive" value={other.motherAlive || "—"} />
          <Row
            label="Mother Name"
            value={other.motherAlive === "No" ? "—" : other.motherName || "—"}
          />
          <Row
            label="Mother Occupation"
            value={
              other.motherAlive === "No" ? "—" : other.motherOccupation || "—"
            }
          />
          <Row
            label="Mother Salaried"
            value={
              other.motherAlive === "No" ? "—" : other.motherSalaried || "—"
            }
          />
        </Section>

        <Section title="Current Course Information">
          <Row
            label="Current Standard / Course"
            value={currentCourse.standard || "—"}
          />

          <Row
            label="Institution Name"
            value={currentCourse.collegeName || "—"}
          />

          <Row
            label="Institution State"
            value={currentCourse.instituteState || "—"}
          />

          <Row
            label="Institution District"
            value={currentCourse.instituteDistrict || "—"}
          />

          <Row
            label="Institution Taluka"
            value={currentCourse.instituteTaluka || "—"}
          />

          <Row
            label="Qualification Level"
            value={currentCourse.qualificationLevel || "—"}
          />

          <Row label="Stream" value={currentCourse.stream || "—"} />

          {/* 🔥 FIX HERE */}
          <Row label="Course Name" value={currentCourse.courseName || "—"} />

          <Row label="Year of Study" value={currentCourse.yearOfStudy || "—"} />

          <Row label="Mode" value={currentCourse.mode || "—"} />

          <Row
            label="Completed / Pursuing"
            value={currentCourse.completedOrContinue || "—"}
          />

          <Row
            label="Admission Category"
            value={currentCourse.reservedCategory || "—"}
          />

          <Row label="Gap Years" value={currentCourse.gapYears ?? "0"} />
        </Section>

        <Section title="Past Qualification">
          {!q && <Row label="Status" value="No qualification data available" />}

          {q && (
            <>
              <Row
                label="Qualification Level"
                value={q.qualificationLevel || "—"}
              />
              <Row label="Level Group" value={q.levelGroup || "—"} />
              <Row label="Institute Name" value={q.collegeName || "—"} />
              <Row
                label="Board / University"
                value={q.boardUniversity || "—"}
              />
              <Row label="Institute State" value={q.instituteState || "—"} />
              <Row
                label="Institute District"
                value={q.instituteDistrict || "—"}
              />
              <Row label="Institute Taluka" value={q.instituteTaluka || "—"} />
              <Row label="Admission Year" value={q.admissionYear || "—"} />
              <Row label="Passing Year" value={q.passingYear || "—"} />
              <Row
                label="Percentage"
                value={q.percentage ? `${q.percentage}%` : "—"}
              />
              <Row label="Result" value={q.result || "—"} />
              <Row label="Gap" value={q.gap || "—"} />
              <Row label="Gap Years" value={q.gapYears || "0"} />
            </>
          )}
        </Section>

        <Section title="College Bank Details">
          <Row label="College Name" value={bank.collegeName || "—"} />
          <Row label="Payment Mode" value={bank.paymentMode || "—"} />
          <Row
            label="Bank Account Number"
            value={bank.collegeBankAccount || "—"}
          />
          <Row label="IFSC Code" value={bank.collegeIFSC || "—"} />
          <Row label="Branch Name" value={bank.collegeBranch || "—"} />
        </Section>

        <Section title="Hostel Details">
          <Row label="Beneficiary Category" value={hostel.category || "—"} />
          <Row label="Hostel Type" value={hostel.hostelType || "—"} />
          <Row label="Hostel Name" value={hostel.hostelName || "—"} />
          <Row label="State" value={hostel.state || "—"} />
          <Row label="District" value={hostel.district || "—"} />
          <Row label="Taluka" value={hostel.taluka || "—"} />
          <Row label="Address" value={hostel.address || "—"} />
          <Row label="Admission Date" value={hostel.admissionDate || "—"} />
          <Row label="Mess Available" value={hostel.messAvailable || "—"} />
        </Section>

        {/* ================= UPLOADED DOCUMENTS ================= */}
        <Section title="Uploaded Documents">
          <button
            className="secondary-btn"
            onClick={() => setShowDocs((prev) => !prev)}
          >
            <FaEye className="view-icon" />
            View Uploaded Documents
          </button>

          <div className={`docs-box ${showDocs ? "active" : ""}`}>
            <table className="msbte-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadedDocs.length === 0 && (
                  <tr>
                    <td colSpan="2">No documents uploaded</td>
                  </tr>
                )}

                {uploadedDocs.map((doc, i) => (
                  <tr key={i}>
                    <td>{doc.name}</td>
                    <td>
                      <button
                        className="view-doc-btn"
                      onClick={() => window.open(doc.file, "_blank")}
                      >
                        <FaEye className="view-icon" />
                        View Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* ================= ACTION BUTTONS ================= */}

      {/* ✅ Only show for student (not admin view) */}
      {!id && (
        <div className="action-btn-row">
          <button className="action-btn btn-print" onClick={handlePrint}>
            Print
          </button>

          <button
            className="action-btn btn-submit"
            onClick={() => setShowSubmitPopup(true)}
          >
            Submit
          </button>
        </div>
      )}

      {showSubmitPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Profile Submission Declaration</h3>

            <p style={{ marginTop: "10px" }}>
              I hereby declare that all the information provided in my profile
              is true and correct to the best of my knowledge. I understand that
              any false information may result in rejection of my scholarship
              applications.
            </p>

            <div className="declaration-box">
              <input
                type="checkbox"
                id="declarationCheck"
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
              />
              <label htmlFor="declarationCheck">
                I agree to the above declaration
              </label>
            </div>

            <div className="popup-actions">
              <button
                className="vf-btn-reset"
                onClick={() => {
                  setShowSubmitPopup(false);
                  setDeclarationChecked(false);
                }}
              >
                Cancel
              </button>

              <button
                className={`vf-btn-save submit-btn ${declarationChecked ? "active" : ""}`}
                disabled={!declarationChecked}
                onClick={() => {
                  if (!declarationChecked) return;
                  setShowSubmitPopup(false);
                  setShowSuccess(true);
                }}
              >
                Submit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="popup-overlay">
          <div className="popup-box success">
            <button
              className="popup-close"
              onClick={() => setShowSuccess(false)}
            >
              ×
            </button>

            <div className="success-icon">✓</div>

            <h3>Profile Ready for Applications</h3>

            <p>
              Your profile has been successfully submitted. You can now apply
              for available scholarship schemes.
            </p>

            <div className="popup-actions">
              <button
                className="vf-btn-save"
                onClick={() => {
                  setShowSuccess(false);
                  navigate("/student/schemes");
                }}
              >
                Explore Schemes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <>
      <h3 className="msbte-section-title">{title}</h3>
      <div className="msbte-box">{children}</div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="msbte-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
