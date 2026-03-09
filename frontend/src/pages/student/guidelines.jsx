import React, { useState } from "react";
import {
  FiFileText,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiBook,
} from "react-icons/fi";
import "./guidelines.css";
import ReactDOM from "react-dom";
import API from "../../api";

const categories = [
  { label: "All", value: "all" },
  { label: "Identity", value: "identity" },
  { label: "Education", value: "education" },
  { label: "Residence", value: "residence" },
  { label: "Financial", value: "financial" },
  { label: "Update", value: "update" },
];

const guideList = [
  /* ------------------ ORIGINAL ITEMS ------------------ */
  {
    title: "Income Certificate",
    file: "income.pdf",
    category: "financial",
    video: "https://www.youtube.com/embed/9i9qlnvEqck",
    steps: [
      "Visit your local Tahsildar / Municipal Office.",
      "Submit Aadhaar, Ration Card, Salary Slip.",
      "Fill and submit Income Declaration Form.",
      "Collect acknowledgment slip.",
    ],
    docs: ["Aadhaar Card", "Ration Card", "Salary Slip", "Passport Photo"],
    authority: "Tahsildar / Revenue Department",
    time: "3–7 Working Days",
    mistakes: [
      "Do not upload blurred photos.",
      "Ensure income year is correct.",
    ],
  },

  {
    title: "Caste Certificate",
    file: "caste.pdf",
    category: "identity",
    video: "https://www.youtube.com/embed/EqzUu-rP2U8",
    steps: [
      "Visit your local Taluka Office.",
      "Submit Aadhaar, Ration, and caste proof.",
      "Provide parent's caste certificate if required.",
    ],
    docs: ["Aadhaar Card", "Ration Card", "Caste Proof"],
    authority: "Revenue Department",
    time: "5–14 Working Days",
    mistakes: ["Mismatch in parental documents.", "Old certificate proofs."],
  },

  {
    title: "Domicile Certificate",
    file: "domicile.pdf",
    category: "residence",
    video: "https://www.youtube.com/embed/4tBgZ9NFpRM",
    steps: [
      "Visit Collector / Taluka Office.",
      "Submit address proof & Aadhaar.",
      "Sign self-declaration for residency.",
    ],
    docs: ["Aadhaar Card", "Electricity Bill", "Ration Card"],
    authority: "Collector Office",
    time: "3–10 Working Days",
    mistakes: ["Address mismatch with Aadhaar."],
  },

  {
    title: "Non-Creamy Layer Certificate",
    file: "non_creamy_layer.pdf",
    category: "financial",
    video: "https://www.youtube.com/embed/v8RQ2T-0peg",
    steps: [
      "Apply at Tahsildar Office.",
      "Submit Income Certificate & Caste Certificate.",
      "Provide Aadhaar, Ration, Salary Slip.",
    ],
    docs: ["Income Certificate", "Caste Certificate", "Salary Slip"],
    authority: "Revenue Department",
    time: "7–15 Working Days",
    mistakes: ["Incorrect income year.", "Missing parent's certificate."],
  },

  /* ------------------ NEW PDF ITEMS ADDED ------------------ */

  {
    title: "Aadhaar Card",
    file: "aadhaar.pdf",
    category: "identity",
    video: "https://www.youtube.com/embed/cBl0K3pX1-0",
    steps: [
      "Visit UIDAI portal.",
      "Download e-Aadhaar using mobile OTP.",
      "Verify details before using.",
    ],
    docs: ["Registered Mobile Number"],
    authority: "UIDAI",
    time: "Instant",
    mistakes: ["Incorrect mobile number may prevent download."],
  },

  {
    title: "Birth Certificate",
    file: "birth.pdf",
    category: "identity",
    video: "https://www.youtube.com/embed/-BulGMlIuDM",
    steps: [
      "Visit Municipal Corporation / Gram Panchayat.",
      "Submit hospital-issued birth record.",
      "Receive digital or physical certificate.",
    ],
    docs: ["Hospital Slip", "Parents' Identity Proof"],
    authority: "Municipal Corporation",
    time: "1–7 Working Days",
    mistakes: ["Incorrect date or name spelling errors."],
  },

  {
    title: "Bonafide Certificate",
    file: "bonafide.pdf",
    category: "education",
    steps: [
      "Visit school/college office.",
      "Apply through admin or student portal.",
      "Collect signed bonafide certificate.",
    ],
    docs: ["Student ID Card"],
    authority: "School / College",
    time: "1–3 Working Days",
    mistakes: ["Incorrect academic year selected."],
  },

  {
    title: "Caste Validity Certificate",
    file: "caste_validity.pdf",
    category: "identity",
    video: "https://www.youtube.com/embed/xLOa0DfG_iw",
    steps: [
      "Submit caste certificate & supporting documents.",
      "Upload proofs on Caste Validity Portal.",
      "Attend scrutiny committee verification if required.",
    ],
    docs: ["Caste Certificate", "School Leaving Certificate"],
    authority: "Caste Scrutiny Committee",
    time: "30–90 Days",
    mistakes: ["Missing historic documents.", "Wrong caste category selected."],
  },

  {
    title: "Nationality Certificate",
    file: "nationality.pdf",
    category: "identity",
    video: "https://www.youtube.com/embed/hPrr_vaqBYw",
    steps: [
      "Submit birth proof, parents’ nationality proof.",
      "Fill nationality application form.",
    ],
    docs: ["Birth Certificate", "Parents' ID Proof"],
    authority: "Collector / Tahsildar Office",
    time: "5–10 Working Days",
    mistakes: ["Document mismatch with Aadhaar."],
  },

  {
    title: "PAN Card",
    file: "pan.pdf",
    category: "identity",
    video: "https://www.youtube.com/embed/a3qvFunwxtc",
    steps: [
      "Visit NSDL or UTI portal.",
      "Fill PAN application form.",
      "Complete e-KYC using Aadhaar.",
    ],
    docs: ["Aadhaar Card"],
    authority: "NSDL / UTIITSL",
    time: "7–15 Days",
    mistakes: ["Incorrect signature or photograph."],
  },
];

export default function Guidelines() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalData, setModalData] = useState(null);

  const filteredGuides =
    selectedCategory === "all"
      ? guideList
      : guideList.filter((g) => g.category === selectedCategory);

  return (
    <div className="guidelines-root no-scrollbar">
      <h1 className="page-title">Guidance Documents</h1>
      <p className="page-sub">
        All essential certificates & document processes required for
        scholarship.
      </p>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`category-btn ${
              selectedCategory === cat.value ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="document-grid">
        {filteredGuides.map((g, i) => (
          <div key={i} className="doc-card" onClick={() => setModalData(g)}>
            <div className="doc-icon">
              <FiFileText />
            </div>
            <div className="doc-info">
              <h3>{g.title}</h3>
              <p>Tap to view details & PDF</p>
            </div>
            <div className="pdf-badge">PDF</div>
          </div>
        ))}
      </div>

      <div className="notes-box">
        <div className="notes-header">
          <FiInfo className="notes-icon" />
          <h3>Important Notes</h3>
        </div>

        <ul className="notes-list">
          <li>
            <FiAlertTriangle /> Make sure uploaded documents are clear &
            readable.
          </li>
          <li>
            <FiAlertTriangle /> Expired certificates are not accepted.
          </li>
          <li>
            <FiAlertTriangle /> Details must match Aadhaar records.
          </li>
          <li>
            <FiAlertTriangle /> Upload government-approved certificate formats.
          </li>
          <li>
            <FiAlertTriangle /> Keep acknowledgment slip for future use.
          </li>
        </ul>
      </div>

      {modalData &&
  ReactDOM.createPortal(
    <div className="modal-overlay" onClick={() => setModalData(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="guide-modal-content">
          <h2>{modalData.title}</h2>

          <h4>Step-by-Step Process</h4>
          <ul>
            {modalData.steps?.map((s, i) => (
              <li key={i}>
                <FiCheckCircle /> {s}
              </li>
            ))}
          </ul>

          <h4>Required Documents</h4>
          <ul>
            {modalData.docs?.map((d, i) => (
              <li key={i}>
                <FiBook /> {d}
              </li>
            ))}
          </ul>

          <div className="modal-info-box">
            <p>
              <b>Issuing Authority:</b> {modalData.authority}
            </p>
            <p>
              <b>Processing Time:</b> {modalData.time}
            </p>
          </div>

{modalData.video && (
  <>
    <h4>Video Tutorial</h4>

    <div className="video-box">
      <iframe
        width="100%"
        height="250"
        src={modalData.video}
        title="Document Tutorial"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  </>
)}

          <h4>Common Mistakes to Avoid</h4>
          <ul>
            {modalData.mistakes?.map((m, i) => (
              <li key={i}>
                <FiAlertTriangle /> {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-buttons">
          <button
            className="close-bottom-btn"
            onClick={() => setModalData(null)}
          >
            Close
          </button>

          <a
            href={`/pdfs/${modalData.file}`}
            target="_blank"
            rel="noreferrer"
            className="open-pdf-btn"
          >
            Open PDF
          </a>
        </div>
      </div>
    </div>,
    document.body
  )}
    </div>
  );
}
