import React, { useRef, useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewForm.css";

export default function DonorViewForm() {
  const normalize = (str = "") =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ✅ REQUIRED – reject reason states */
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  /* ================= FETCH APPLICATION ================= */
  useEffect(() => {
    if (!id) return;

    const fetchApplication = async () => {
      try {
        const res = await fetch(
          `http://localhost:5050/api/applications/${id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        const data = await res.json();

        if (res.ok && data.success && data.application) {
  setApplication(data.application);
  setProfile(data.application.formSnapshot); // ✅ FIXED
} else {
  setApplication(null);
  setProfile(null);
}
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading application…</p>;
  if (!application || !profile)
    return <p style={{ padding: 20 }}>Application not found</p>;

  /* ================= SHORT HANDS ================= */
  const p = profile.personal || {};
  const a = profile.address || {};
  const perm = a.perm || {};
  const corr = a.corr || {};
  const other = profile.other || {};
  const currentCourse = profile.courseList || {};
  const bank = profile.collegeBank || {};
  const hostel = profile?.hostelRecords?.records?.[0] || {};
  const rawQualifications = profile.qualificationRecords;
  const qualifications = Array.isArray(rawQualifications)
  ? rawQualifications
  : rawQualifications && typeof rawQualifications === "object"
  ? [rawQualifications]
  : [];
  const scheme = application.schemeId || {};

/* ================= DOCUMENT BUILDER ================= */

const buildUploadedDocs = () => {
  const docs = [];

  if (p.incomeCertificate)
    docs.push({ name: "Income Certificate", file: p.incomeCertificate });

  if (p.domicileCertificate)
    docs.push({ name: "Domicile Certificate", file: p.domicileCertificate });

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

  if (currentCourse.marksheet) {
    docs.push({
      name: "Last Year Marksheet (Current Course)",
      file: currentCourse.marksheet,
    });
  }

  if (rawQualifications?.marksheet) {
    docs.push({
      name: "Past Qualification Marksheet",
      file: rawQualifications.marksheet,
    });
  }

  if (rawQualifications?.gapCertificate) {
    docs.push({
      name: "Gap Certificate",
      file: rawQualifications.gapCertificate,
    });
  }

  if (bank.collegeQR) {
    docs.push({
      name: "College UPI QR Code",
      file: bank.collegeQR,
    });
  }

  return docs;
};

const uploadedDocs = buildUploadedDocs();

  /* ================= ACTIONS ================= */
  const approve = async () => {
    await fetch(`http://localhost:5050/api/applications/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ status: "approved" }),
    });
    navigate(-1);
  };

  const submitReject = async () => {
    const finalReason =
      rejectReason === "Other" ? otherReason : rejectReason;

    await fetch(`http://localhost:5050/api/applications/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        status: "rejected",
        rejectionReason: finalReason,
      }),
    });

    navigate(-1);
  };

  /* ================= JSX ================= */
  return (
    <>
      <div ref={printRef} className="msbte-container">
        <h2 className="msbte-title">Student Application</h2>

      <Section title="Scheme Information">
  <Row label="Scheme Name" value={scheme.schemeName} />

  <Row
    label="Scholarship Amount"
    value={
      scheme.scholarshipAmount
        ? `₹${scheme.scholarshipAmount}`
        : "—"
    }
  />

  <Row label="Education Level" value={scheme.educationLevel} />

  <Row label="Gender Preference" value={scheme.genderPreference} />

  <Row
    label="Application Deadline"
    value={
      scheme.applicationDeadline
        ? new Date(scheme.applicationDeadline).toLocaleDateString("en-GB")
        : "—"
    }
  />
</Section>


        {/* ⚠️ ALL YOUR EXISTING SECTIONS REMAIN EXACTLY SAME */}
        {/* PERSONAL */}
        <Section title="Personal Information">
          <Row label="Aadhaar Number" value={p.aadhaar} />
          <Row label="Full Name" value={p.name} />
          <Row label="Email ID" value={p.email} />
          <Row label="Mobile Number" value={p.mobile} />
          <Row label="Parent / Guardian Mobile" value={p.parentMobile} />
          <Row label="Date of Birth" value={p.dob} />
          <Row label="Age" value={p.age} />
          <Row label="Gender" value={p.gender} />
          <Row label="Religion" value={p.religion} />
          <Row label="Caste Category" value={p.casteCategory} />
          <Row label="Caste" value={p.caste} />
          <Row label="Sub Caste" value={p.subCaste} />
          <Row
            label="Family Annual Income"
            value={p.income ? `₹${p.income}` : "—"}
          />
          <Row label="Is Salaried" value={p.salaried} />
          <Row label="Disability" value={p.disability} />
        </Section>

        {/* ADDRESS */}
        <Section title="Address Information">
          <Row label="Permanent Address" value={perm.address} />
          <Row label="State" value={perm.state} />
          <Row label="District" value={perm.district} />
          <Row label="Taluka" value={perm.taluka} />
          <Row label="Village" value={perm.village} />
          <Row label="Pincode" value={perm.pincode} />

          <Row
            label="Correspondence Same As Permanent"
            value={a.same ? "Yes" : "No"}
          />

          {!a.same && (
            <>
              <Row label="Correspondence Address" value={corr.address} />
              <Row label="Correspondence State" value={corr.state} />
              <Row label="Correspondence District" value={corr.district} />
              <Row label="Correspondence Taluka" value={corr.taluka} />
              <Row label="Correspondence Village" value={corr.village} />
              <Row label="Correspondence Pincode" value={corr.pincode} />
            </>
          )}
        </Section>

        {/* OTHER */}
        <Section title="Other Information">
          <Row label="Is Father Alive" value={other.fatherAlive} />
          <Row label="Father Name" value={other.fatherName} />
          <Row label="Father Occupation" value={other.fatherOccupation} />
          <Row label="Father Salaried" value={other.fatherSalaried} />
          <Row label="Is Mother Alive" value={other.motherAlive} />
          <Row label="Mother Name" value={other.motherName} />
          <Row label="Mother Occupation" value={other.motherOccupation} />
          <Row label="Mother Salaried" value={other.motherSalaried} />
        </Section>

        {/* CURRENT COURSE */}
        <Section title="Current Course Information">
          <Row label="Current Standard / Course" value={currentCourse.standard} />
          <Row label="Institution Name" value={currentCourse.collegeName} />
          <Row label="Institution State" value={currentCourse.instituteState} />
          <Row
            label="Institution District"
            value={currentCourse.instituteDistrict}
          />
          <Row
            label="Institution Taluka"
            value={currentCourse.instituteTaluka}
          />
          <Row
            label="Qualification Level"
            value={currentCourse.qualificationLevel}
          />
          <Row label="Stream" value={currentCourse.stream} />
          <Row label="Course Name" value={currentCourse.courseName} />
          <Row label="Year of Study" value={currentCourse.yearOfStudy} />
          <Row label="Mode" value={currentCourse.mode} />
          <Row
            label="Completed / Pursuing"
            value={currentCourse.completedOrContinue}
          />
          <Row
            label="Admission Category"
            value={currentCourse.reservedCategory}
          />
          <Row label="Gap Years" value={currentCourse.gapYears} />
        </Section>

        {/* PAST QUALIFICATIONS */}
        <Section title="Past Qualification">

          {qualifications.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 18 }}>
              <Row label="Level Group" value={q.levelGroup} />
              <Row label="Qualification Level" value={q.qualificationLevel} />
              <Row label="Institute Name" value={q.collegeName} />
              <Row label="Board / University" value={q.boardUniversity} />
              <Row label="Institute State" value={q.instituteState} />
              <Row label="Institute District" value={q.instituteDistrict} />
              <Row label="Institute Taluka" value={q.instituteTaluka} />
              <Row label="Admission Year" value={q.admissionYear} />
              <Row label="Passing Year" value={q.passingYear} />
              <Row
                label="Percentage"
                value={q.percentage ? `${q.percentage}%` : "—"}
              />
              <Row label="Result" value={q.result} />
              <Row label="Gap" value={q.gap} />
              <Row label="Gap Years" value={q.gapYears} />
            </div>
          ))}
        </Section>

        {/* BANK */}
        <Section title="College Bank Details">
          <Row label="College Name" value={bank.collegeName} />
          <Row label="Payment Mode" value={bank.paymentMode} />
          <Row label="Bank Account Number" value={bank.collegeBankAccount} />
          <Row label="IFSC Code" value={bank.collegeIFSC} />
          <Row label="Branch Name" value={bank.collegeBranch} />
          <Row label="Total Fees Amount" value={bank.totalFeesAmount} />
          <Row label="Fees In Words" value={bank.totalFeesInWords} />
          <Row label="DD Favour Of" value={bank.ddFavourOf} />
          <Row label="DD Payable At" value={bank.ddPayableAt} />
          <Row label="Remarks" value={bank.ddRemarks} />
        </Section>

        {/* HOSTEL */}
        <Section title="Hostel Details">
          <Row label="Beneficiary Category" value={hostel.category} />
          <Row label="Hostel Type" value={hostel.hostelType} />
          <Row label="Hostel Name" value={hostel.hostelName} />
          <Row label="State" value={hostel.state} />
          <Row label="District" value={hostel.district} />
          <Row label="Taluka" value={hostel.taluka} />
          <Row label="Address" value={hostel.address} />
          <Row label="Admission Date" value={hostel.admissionDate} />
          <Row label="Mess Available" value={hostel.messAvailable} />
        </Section>

        {/* DOCUMENTS */}
        <Section title="Uploaded Documents">
          <button
            className="secondary-btn"
            onClick={() => setShowDocs((s) => !s)}
          >
            <FaEye /> View Uploaded Documents
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
      {doc.file ? (
        <button
          className="view-doc-btn"
          onClick={() =>
            window.open(
              `http://localhost:5050/uploads/${doc.file}`,
              "_blank"
            )
          }
        >
          <FaEye /> View
        </button>
      ) : (
        <span style={{ color: "red", fontWeight: 600 }}>Not Uploaded</span>
      )}
    </td>
  </tr>
))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* ACTIONS */}
      <div className="action-btn-row">
        <button className="action-btn" onClick={() => navigate(-1)}>
          Back
        </button>

        {/* ✅ REQUIRED – open reject modal */}
        <button
          className="action-btn btn-reject"
          onClick={() => setShowRejectModal(true)}
        >
          Reject
        </button>

        <button className="action-btn btn-approve" onClick={approve}>
          Approve
        </button>
      </div>

      {/* ✅ REQUIRED – reject modal */}
      {showRejectModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Reject Application</h3>

            <div className="reject-reasons">
  {[
    "Eligibility criteria not met",
    "Incomplete documents",
    "Incorrect information",
    "Duplicate application",
    "Income criteria exceeded",
  ].map((reason) => (
    <div
      key={reason}
      className={`reason-item ${
        rejectReason === reason ? "active" : ""
      }`}
      onClick={() => setRejectReason(reason)}
    >
      {reason}
    </div>
  ))}

  {/* Other reason */}
  <div
    className={`reason-item ${
      rejectReason === "Other" ? "active" : ""
    }`}
    onClick={() => setRejectReason("Other")}
  >
    Other
  </div>

  {rejectReason === "Other" && (
    <textarea
      placeholder="Enter rejection reason"
      value={otherReason}
      onChange={(e) => setOtherReason(e.target.value)}
    />
  )}
</div>



            <div className="modal-actions">
              <button onClick={submitReject} className="confirm-btn">
                Submit
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="cancel-btn"
              >
                Cancel
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
      <strong>{value || "—"}</strong>
    </div>
  );
}
