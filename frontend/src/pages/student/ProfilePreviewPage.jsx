import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import "./ViewForm.css";
import API from "../../api";

export default function ApplyProfilePreview({ profile }) {
  const [showDocs, setShowDocs] = useState(false);
  if (!profile) return null;

  const p = profile.personal || {};
  const a = profile.address || {};
  const perm = a.perm || {};
  const corr = a.corr || {};
  const other = profile.other || {};
  const course = profile.courseList || {};
  const q = profile.qualificationRecords || {};
  const bank = profile.collegeBank || {};
  const hostel = profile?.hostelRecords?.records?.[0] || {};

const buildUploadedDocs = (profile) => {
  const docs = [];
  if (!profile) return docs;

  const p = profile.personal || {};
  const bank = profile.collegeBank || {};
  const course = profile.courseList || {};
  const qualsRaw = profile.qualificationRecords;

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

  if (course.marksheet) {
    docs.push({
      name: "Last Year Marksheet (Current Course)",
      file: course.marksheet,
    });
  }

  if (qualsRaw?.gapCertificate) {
    docs.push({
      name: "Gap Certificate (Past Qualification)",
      file: qualsRaw.gapCertificate,
    });
  }

  if (qualsRaw?.marksheet) {
    docs.push({
      name: "Past Qualification Marksheet",
      file: qualsRaw.marksheet,
    });
  }

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
    <div className="msbte-container">
      <h2 className="msbte-title">Profile Preview</h2>

      {/* PERSONAL */}
      <Section title="Personal Information">
        <Row label="Aadhaar" value={p.aadhaar} />
        <Row label="Full Name" value={p.name} />
        <Row label="Email" value={p.email} />
        <Row label="Mobile" value={p.mobile} />
        <Row label="Gender" value={p.gender} />
        <Row label="Age" value={p.age} />
        <Row label="Family Income" value={p.familyIncome ? `₹${p.familyIncome}` : "—"} />
      </Section>

      {/* ADDRESS */}
      <Section title="Address Information">
        <Row label="Permanent Address" value={perm.address} />
        <Row label="State" value={perm.state} />
        <Row label="District" value={perm.district} />
        <Row label="Taluka" value={perm.taluka} />
        <Row label="Village" value={perm.village} />
        <Row label="Pincode" value={perm.pincode} />
        <Row label="Correspondence Same As Permanent" value={a.same ? "Yes" : "No"} />

        {!a.same && (
          <>
            <Row label="Correspondence Address" value={corr.address} />
            <Row label="State" value={corr.state} />
            <Row label="District" value={corr.district} />
            <Row label="Taluka" value={corr.taluka} />
            <Row label="Village" value={corr.village} />
            <Row label="Pincode" value={corr.pincode} />
          </>
        )}
      </Section>

      {/* OTHER */}
      <Section title="Other Information">
        <Row label="Father Name" value={other.fatherName} />
        <Row label="Father Occupation" value={other.fatherOccupation} />
        <Row label="Mother Name" value={other.motherName} />
        <Row label="Mother Occupation" value={other.motherOccupation} />
      </Section>

      {/* CURRENT COURSE */}
      <Section title="Current Course Information">
        <Row label="Course" value={course.standard} />
        <Row label="Institute Name" value={course.collegeName} />
        <Row label="Institute State" value={course.instituteState} />
        <Row label="Stream" value={course.stream} />
        <Row label="Year of Study" value={course.yearOfStudy} />
      </Section>

      {/* PAST QUALIFICATION */}
      <Section title="Past Qualification">
        <Row label="Qualification Level" value={q.qualificationLevel} />
        <Row label="Board / University" value={q.boardUniversity} />
        <Row label="Institute Name" value={q.collegeName} />
        <Row label="Passing Year" value={q.passingYear} />
        <Row label="Percentage" value={q.percentage ? `${q.percentage}%` : "—"} />
      </Section>

      {/* COLLEGE BANK */}
      <Section title="College Bank Details">
        <Row label="College Name" value={bank.collegeName} />
        <Row label="Account Number" value={bank.collegeBankAccount} />
        <Row label="IFSC Code" value={bank.collegeIFSC} />
        <Row label="Branch" value={bank.collegeBranch} />
        <Row label="Payment Mode" value={bank.paymentMode} />
      </Section>

      {/* HOSTEL */}
      <Section title="Hostel Details">
        <Row label="Hostel Type" value={hostel.hostelType} />
        <Row label="Hostel Name" value={hostel.hostelName} />
        <Row label="State" value={hostel.state} />
        <Row label="District" value={hostel.district} />
        <Row label="Address" value={hostel.address} />
        <Row label="Mess Available" value={hostel.messAvailable} />
      </Section>

      {/* DOCUMENTS */}
      <Section title="Uploaded Documents">
        <button className="secondary-btn" onClick={() => setShowDocs(s => !s)}>
          <FaEye /> View Uploaded Documents
        </button>

        <div className={`docs-box ${showDocs ? "active" : ""}`}>
          <table className="msbte-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedDocs.map((doc, i) => (
                <tr key={i}>
                  <td>{doc.name}</td>
                  <td>
                    <button
                      className="view-doc-btn"
onClick={() => window.open(doc.file, "_blank")}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* HELPERS */
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
      <strong>{value || "—"}</strong>
    </div>
  );
}
