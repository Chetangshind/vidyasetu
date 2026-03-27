import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import "./ViewForm.css";
import API from "../../api";

export default function ApplyProfilePreview({ profile }) {
  const [showDocs, setShowDocs] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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

const steps = [
  { title: "Personal", content: (
    <Section title="Personal Information">
      <Row label="Aadhaar" value={p.aadhaar} />
      <Row label="Full Name" value={p.name} />
      <Row label="Email" value={p.email} />
      <Row label="Mobile" value={p.mobile} />
      <Row label="Gender" value={p.gender} />
      <Row label="Age" value={p.age} />
      <Row label="Family Income" value={p.familyIncome ? `₹${p.familyIncome}` : "—"} />
    </Section>
  )},

  { title: "Address", content: (
    <Section title="Address Information">
      <Row label="Permanent Address" value={perm.address} />
      <Row label="State" value={perm.state} />
      <Row label="District" value={perm.district} />
      <Row label="Taluka" value={perm.taluka} />
      <Row label="Village" value={perm.village} />
      <Row label="Pincode" value={perm.pincode} />
    </Section>
  )},

  { title: "Other", content: (
    <Section title="Other Information">
      <Row label="Father Name" value={other.fatherName} />
      <Row label="Mother Name" value={other.motherName} />
    </Section>
  )},

  { title: "Course", content: (
    <Section title="Course Info">
      <Row label="Course" value={course.standard} />
      <Row label="College" value={course.collegeName} />
    </Section>
  )},

  { title: "Documents", content: (
    <Section title="Uploaded Documents">
      <button className="secondary-btn" onClick={() => setShowDocs(s => !s)}>
        <FaEye /> View Documents
      </button>

      {showDocs && (
        <div className="docs-box active">
          {uploadedDocs.map((doc, i) => (
            <div key={i}>{doc.name}</div>
          ))}
        </div>
      )}
    </Section>
  )}
];

return (
  <div className="msbte-container">

    {/* 🔥 STEP HEADER */}
    <div className="step-header">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step-item ${activeStep === index ? "active" : ""}`}
          onClick={() => setActiveStep(index)}
        >
          {step.title}
        </div>
      ))}
    </div>

    {/* 🔥 STEP CONTENT */}
    <div className="step-content">
      {steps[activeStep].content}
    </div>

    {/* 🔥 STEP NAVIGATION */}
    <div className="step-actions">
      <button
        disabled={activeStep === 0}
        onClick={() => setActiveStep((s) => s - 1)}
        className="vs-btn outline"
      >
        Back
      </button>

      <button
        disabled={activeStep === steps.length - 1}
        onClick={() => setActiveStep((s) => s + 1)}
        className="vs-btn primary"
      >
        Next
      </button>
    </div>

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
