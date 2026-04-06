import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import casteData from "./CasteData.json";
import API from "../../api";
import "./Profile.css";

import {
  FaUser,
  FaHome,
  FaInfo,
  FaBook,
  FaGraduationCap,
  FaAddressCard,
  FaUniversity,
  FaTimes,
  FaEdit,
  FaEye,
} from "react-icons/fa";

const REQUIRED_PERSONAL_FIELDS = [
  "name",
  "mobile",
  "dob",
  "gender",
  "parentMobile",
  "religion",
  "casteCategory",
  "income",
  "incomeCertNo",
  "domicileCertNo",
];

const REQUIRED_ADDRESS_FIELDS = [
  "address",
  "district",
  "taluka",
  "village",
  "pincode",
];

export default function StudentProfile() {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);

  useEffect(() => {
  if (location.state?.stepKey) {
    const stepMap = {
      personal: 1,
      address: 2,
      other: 3,
      courseList: 4,
      qualificationRecords: 5,
      collegeBank: 6,
      hostelRecords: 7,
    };

    const targetStep = stepMap[location.state.stepKey];
    if (targetStep) {
      setStep(targetStep);
    }
  }
}, [location]);

const steps = [
  { label: "Personal Information", icon: <FaUser /> },
  { label: "Address Information", icon: <FaAddressCard /> },
  { label: "Other Information", icon: <FaInfo /> },
  { label: "Current Course", icon: <FaBook /> },
  { label: "Past Qualification", icon: <FaGraduationCap /> },
  { label: "College Bank Details", icon: <FaUniversity /> },
  { label: "Hostel Details", icon: <FaHome /> },
];

  // Preview data collected from children (when they save)
  const [previewData, setPreviewData] = useState({
    personal: {},
    address: {},
    other: {},
    courseList: null,
    qualificationRecords: null,
    collegeBank: {},
    hostelRecords: {},
  });

  const isPersonalComplete = REQUIRED_PERSONAL_FIELDS.every(
    (f) => previewData.personal?.[f]
  );

  const isAddressComplete =
    previewData.address?.perm?.address && previewData.address?.perm?.pincode;

  const isOtherComplete =
    previewData.other && Object.keys(previewData.other).length > 0;

  const isCourseComplete =
    previewData.courseList && Object.keys(previewData.courseList).length > 0;

  const isQualificationComplete =
    previewData.qualificationRecords &&
    Object.keys(previewData.qualificationRecords).length > 0;

  const isCollegeBankComplete =
    previewData.collegeBank && Object.keys(previewData.collegeBank).length > 0;

  const isHostelComplete =
    previewData.hostelRecords &&
    Object.keys(previewData.hostelRecords).length > 0;

  const isProfileComplete =
    isPersonalComplete &&
    isAddressComplete &&
    isOtherComplete &&
    isCourseComplete &&
    isQualificationComplete &&
    isCollegeBankComplete &&
    isHostelComplete;

  useEffect(() => {
    console.log("🔥 StudentProfile mounted");

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("TOKEN IN PROFILE:", token);

      if (!token) return;

      const res = await fetch(`${API}/api/student/profile`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      console.log("GET PROFILE STATUS:", res.status);

      const data = await res.json();
      console.log("GET PROFILE RESPONSE:", data);

      if (res.ok && data.success && data.profile) {
        setPreviewData({
          personal: data.profile.personal || {},
          address: data.profile.address || {},
          other: data.profile.other || {},
          courseList: data.profile.courseList || null,
          qualificationRecords: data.profile.qualificationRecords || null,
          collegeBank: data.profile.collegeBank || {},
          hostelRecords: data.profile.hostelRecords || {},
        });
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
  if (location.state?.scrollTo === "other-documents") {
    // Force Step 1 (Personal Info)
    setStep(1);

    setTimeout(() => {
      const section = document.getElementById("other-documents");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 400);
  }
}, [location]);


  // 🔹 SAVE FULL PROFILE TO BACKEND
  const saveFullProfile = async () => {
    console.log("SAVE PROFILE FUNCTION HIT"); // ✅ ADD

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Student not logged in");
      return;
    }

    const res = await fetch(`${API}/api/student/profile/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token, // ✅ ADD THIS
      },
      body: JSON.stringify({
        profileData: {
          ...previewData,
          personal: previewData.personal || {},
          address: previewData.address || {},
          other: previewData.other || {},
          courseList: previewData.courseList || null,
          qualificationRecords: previewData.qualificationRecords || null,
          collegeBank: previewData.collegeBank || {},
          hostelRecords: previewData.hostelRecords || {},
        },
      }),
    });

    const data = await res.json();
    console.log("FULL PROFILE SAVE RESPONSE:", data);

    if (!res.ok || !data.success) {
      console.error("SAVE FAILED:", data);
      alert(data.message || "Error saving profile");
      return;
    }

    alert("Profile Saved Successfully!");
  };
  const updatePreviewSection = (section, payload) =>
    setPreviewData((prev) => ({ ...prev, [section]: payload }));

  return (
    <>
      <div className="profile-container">
        {/* PROGRESS BAR */}
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar-fill"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        {/* STEPPER */}
        <div className="profile-steps">
          <div className="step-line" />
          {steps.map((s, index) => (
            <div
              key={index}
              className={`step-item ${step === index + 1 ? "active" : ""}`}
              onClick={() => {
                if (index + 1 > 1 && !isPersonalComplete) {
                  alert("Please complete Personal Details first.");
                  return;
                }
                setStep(index + 1);
              }}
            >
              <div className="step-circle">{s.icon}</div>
              <div className="step-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div className="profile-form-card fade-in">
          {step === 1 && (
            <PersonalInfo
              initialData={previewData.personal}
              onDataChange={(d) => updatePreviewSection("personal", d)}
            />
          )}

          {step === 2 && (
            <AddressInfo
              initialData={previewData.address}
              onDataChange={(d) => updatePreviewSection("address", d)}
            />
          )}

          {step === 3 && (
            <OtherInfo
              initialData={previewData.other}
              onDataChange={(d) => updatePreviewSection("other", d)}
            />
          )}

          {step === 4 && (
            <CourseInfo
              initialData={previewData.courseList}
              onDataChange={(list) => updatePreviewSection("courseList", list)}
            />
          )}

          {step === 5 && (
            <QualificationInfo
              initialData={previewData.qualificationRecords}
              onDataChange={(records) =>
                updatePreviewSection("qualificationRecords", records)
              }
            />
          )}

          {step === 6 && (
            <CollegeBankDetails
              initialData={previewData.collegeBank}
              onDataChange={(d) => updatePreviewSection("collegeBank", d)}
            />
          )}

          {step === 7 && (
            <HostelInfo
              initialData={previewData.hostelRecords}
              onDataChange={(r) => updatePreviewSection("hostelRecords", r)}
            />
          )}
        </div>

        <StepNavigation
          step={step}
          setStep={setStep}
          steps={steps}
          saveFullProfile={saveFullProfile}
          isProfileComplete={isProfileComplete}
        />
      </div>
    </>
  );
}
function numberToWords(num) {
  if (!num) return "";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num < 20) return a[num];
  if (num < 100)
    return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
  if (num < 1000)
    return (
      a[Math.floor(num / 100)] +
      " Hundred " +
      (num % 100 ? numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand " +
      (num % 1000 ? numberToWords(num % 1000) : "")
    );
  if (num < 10000000)
    return (
      numberToWords(Math.floor(num / 100000)) +
      " Lakh " +
      (num % 100000 ? numberToWords(num % 100000) : "")
    );

  return (
    numberToWords(Math.floor(num / 10000000)) +
    " Crore " +
    (num % 10000000 ? numberToWords(num % 10000000) : "")
  );
}

/* ---------------- FOOTER NAVIGATION ---------------- */

function StepNavigation({
  step,
  setStep,
  steps,
  saveFullProfile,
  isProfileComplete,
}) {
  const navigate = useNavigate();

  const isFirst = step === 1;
  const isLast = step === steps.length;

  const prevLabel = !isFirst ? steps[step - 2].label : "";
  const nextLabel = !isLast ? steps[step].label : "";

  return (
    <div className="footer-nav">
      {!isFirst ? (
        <button className="prev-btn" onClick={() => setStep(step - 1)}>
          {prevLabel}
        </button>
      ) : (
        <div className="prev-placeholder" />
      )}

      <div className="footer-bg" />

      {!isLast ? (
        <button className="next-btn" onClick={() => setStep(step + 1)}>
          {nextLabel}
        </button>
      ) : (
        <button
          type="button"
          className="next-btn finish-btn"
          disabled={!isProfileComplete}
          onClick={() => navigate("/student/view-form")}
          style={{
            opacity: isProfileComplete ? 1 : 0.5,
            cursor: isProfileComplete ? "pointer" : "not-allowed",
          }}
        >
          Review
        </button>
      )}
    </div>
  );
}

/* ---------------------- PERSONAL INFO COMPONENT ---------------------- */

function PersonalInfo({ initialData, onDataChange }) {
  const [form, setForm] = useState({
    aadhaar: "",
    name: "",
    email: "",
    mobile: "",
    dob: "",
    age: "",
    gender: "",

    parentMobile: "",
    maritalStatus: "Unmarried",

    religion: "",
    preferredReligion: "",

    casteCategory: "",
    preferredCasteCategory: "",

    casteSelect: "",
    caste: "",
    preferredCaste: "",

    subCaste: "",
    preferredSubCaste: "",

    // Income + Domicile + Eligibility
    income: "",
    incomeCertNo: "",
    incomeCertificateFile: null,

    domicileCertNo: "",
    domicileCertificateFile: null,
    domicileOwner: "Self",

    salaried: "No",
    disability: "No",
  });
 const [docForm, setDocForm] = useState({
  documentName: "",
  customDocumentName: "",
  documentNumber: "",
  file: null,
});

  const [otherDocs, setOtherDocs] = useState([]);
  useEffect(() => {
    if (initialData?.otherDocuments) {
      setOtherDocs(initialData.otherDocuments);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setForm((prev) => ({
        ...prev,
        ...initialData,

        // ❗ VERY IMPORTANT — never try to prefill file input
        incomeCertificateFile: null,
        domicileCertificateFile: null,
      }));
    }
  }, [initialData]);

  /* ---------------------- HANDLE CHANGE ---------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      /** Auto-age calculation **/
      if (name === "dob") {
        const birth = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        next.age = value ? age : "";
      }

      /** Preferred resets **/
      if (name === "religion" && value !== "Preferred")
        next.preferredReligion = "";
      if (name === "casteCategory" && value !== "Preferred") {
        next.preferredCasteCategory = "";
        // reset caste selection when category changes
        next.casteSelect = "";
        next.caste = "";
        next.subCaste = "";
      }
      if (name === "casteSelect") {
        if (value !== "Preferred") next.preferredCaste = "";
        if (value !== "Other") next.caste = "";
        // reset subCaste when casteSelect changes
        next.subCaste = "";
      }
      if (name === "subCaste" && value !== "Preferred")
        next.preferredSubCaste = "";

      return next;
    });
  };

  /* ---------------------- FILE HANDLER ---------------------- */
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
  };

  // open a File object in new tab
  const openFile = (file) => {
    if (!file) return alert("File not available");
    try {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
      // revoke after some time
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (err) {
      console.error(err);
      alert("Cannot open file");
    }
  };
  const saveOtherDocument = async () => {
    try {
      if (!docForm.documentName || !docForm.documentNumber || !docForm.file) {
        alert("Please fill all document fields");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not logged in");
        return;
      }

      const formData = new FormData();
      formData.append("section", "otherDocuments");
      formData.append(
        "data",
      JSON.stringify({
  documentName:
    docForm.documentName === "Other"
      ? docForm.customDocumentName
      : docForm.documentName,
  documentNumber: docForm.documentNumber,
})
      );
      formData.append("otherDocFile", docForm.file);

      const res = await fetch(
        `${API}/api/student/profile/save-section`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save document");
        return;
      }

      // ✅ update table from backend
      setOtherDocs(data.profile.personal?.otherDocuments || []);

      setDocForm({
        documentName: "",
        documentNumber: "",
        file: null,
      });

      alert("Document Saved Successfully!");
    } catch (err) {
      console.error("OTHER DOC SAVE ERROR:", err);
      alert("Something went wrong");
    }
  };

  const validatePersonal = () => {
    for (let field of REQUIRED_PERSONAL_FIELDS) {
      if (!form[field] || form[field].toString().trim() === "") {
        return false;
      }
    }
    return true;
  };

  /* ---------------------- SAVE ---------------------- */
  const handleSave = async () => {
    if (!validatePersonal()) {
      alert("Please fill all required personal details.");
      return;
    }
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("section", "personal");
    // 🔥 CLEAN DATA — DO NOT SEND FILE FIELDS OR NULLS
    const cleanedData = { ...form };

    // ❌ remove file objects
    delete cleanedData.incomeCertificateFile;
    delete cleanedData.domicileCertificateFile;

    // ❌ VERY IMPORTANT: do NOT overwrite saved filenames
    delete cleanedData.incomeCertificate;
    delete cleanedData.domicileCertificate;

    formData.append("data", JSON.stringify(cleanedData));

    if (form.incomeCertificateFile) {
      formData.append("incomeCertificate", form.incomeCertificateFile);
    }

    if (form.domicileCertificateFile) {
      formData.append("domicileCertificate", form.domicileCertificateFile);
    }

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DO NOT set Content-Type when using FormData
        },
        body: formData,
      }
    );

    const data = await res.json();
    console.log("SAVE PERSONAL RESPONSE:", data);

    if (res.ok && data.success) {
      if (typeof onDataChange === "function") {
        onDataChange({
          ...data.profile.personal,
          incomeCertificate: data.profile.personal?.incomeCertificate || null,
          domicileCertificate:
            data.profile.personal?.domicileCertificate || null,
        });
      }
      alert("Personal Details Saved Successfully!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  /* ---------------------- Derived options from casteData ---------------------- */
  const categories = Object.keys(casteData || {});
  const availableCastes =
    form.casteCategory && casteData[form.casteCategory]
      ? Object.keys(casteData[form.casteCategory])
      : [];
  const availableSubCastes =
    form.casteCategory &&
    form.casteSelect &&
    casteData[form.casteCategory] &&
    casteData[form.casteCategory][form.casteSelect]
      ? casteData[form.casteCategory][form.casteSelect]
      : [];

  /* ---------------------- UI START ---------------------- */

  const documentOptions = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Driving License",
  "Passport",
  "Ration Card",
  "Caste Certificate",
  "Disability Certificate",
  "Bank Passbook",
  "Other",
];

return (
    <>
      {/* BASIC DETAILS */}
      <div className="section-title">
  Personal Information
</div>

      <div className="section-box">
        <div className="form-grid">
          <div className="full-row">
            <label>Aadhaar Number</label>
            <input
              type="text"
              name="aadhaar"
              value={form.aadhaar}
              onChange={handleChange}
            />
          </div>

          <div className="full-row">
            <label className="required">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Age</label>
            <input type="number" value={form.age} disabled />
          </div>

          <div>
            <label className="required">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
</select>
          </div>

          <div>
            <label className="required">Parent/Guardian Mobile Number</label>
            <input
              type="text"
              name="parentMobile"
              value={form.parentMobile}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* RELIGION */}
      <div className="section-title">
  Religion Details
</div>

      <div className="section-box">
        <div>
          <label className="required">Religion</label>
          <select name="religion" value={form.religion} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Muslim">Muslim</option>
<option value="Hindu">Hindu</option>
<option value="Christian">Christian</option>
<option value="Buddhist">Buddhist</option>
<option value="Jain">Jain</option>
<option value="Sikh">Sikh</option>
<option value="Preferred">Preferred</option>
          </select>

          {form.religion === "Preferred" && (
            <input
              type="text"
              placeholder="Enter Preferred Religion"
              value={form.preferredReligion}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  preferredReligion: e.target.value,
                  religion: e.target.value,
                }))
              }
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>

      {/* CASTE DETAILS */}
      <div className="section-title">
  Caste Details
</div>

      <div className="section-box">
        <div className="form-grid">
          {/* CATEGORY */}
          <div>
            <label className="required">Caste Category</label>
            <select
              name="casteCategory"
              value={form.casteCategory}
              onChange={handleChange}
            >
             <option value="">Select</option>
{categories.map(cat => (
  <option key={cat} value={cat}>{cat}</option>
))}
<option value="Preferred">Preferred</option>
            </select>

            {form.casteCategory === "Preferred" && (
              <input
                type="text"
                placeholder="Enter Preferred Category"
                value={form.preferredCasteCategory}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredCasteCategory: e.target.value,
                    casteCategory: e.target.value,
                  }))
                }
                style={{ marginTop: 8 }}
              />
            )}
          </div>

          {/* CASTE */}
          <div>
            <label>Caste</label>
            <select
              name="casteSelect"
              value={form.casteSelect}
              onChange={handleChange}
            >
             <option value="">Select</option>
<option value="Preferred">Preferred</option>
<option value="Other">Other</option>
              {/* dynamic caste options */}
              {availableCastes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {form.casteSelect === "Preferred" && (
              <input
                type="text"
                placeholder="Enter Preferred Caste"
                value={form.preferredCaste}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredCaste: e.target.value,
                    caste: e.target.value,
                  }))
                }
                style={{ marginTop: 8 }}
              />
            )}

            {form.casteSelect === "Other" && (
              <input
                type="text"
                placeholder="Enter Caste"
                value={form.caste}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, caste: e.target.value }))
                }
                style={{ marginTop: 8 }}
              />
            )}
          </div>

          {/* SUB-CASTE */}
          <div>
            <label>Sub-Caste</label>
            <select
              name="subCaste"
              value={form.subCaste}
              onChange={handleChange}
            >
             <option value="">Select</option>
<option value="Preferred">Preferred</option>
<option value="Other">Other</option>
              {availableSubCastes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {form.subCaste === "Preferred" && (
              <input
                type="text"
                placeholder="Enter Preferred Sub-Caste"
                value={form.preferredSubCaste}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredSubCaste: e.target.value,
                    subCaste: e.target.value,
                  }))
                }
                style={{ marginTop: 8 }}
              />
            )}

            {form.subCaste === "Other" && (
              <input
                type="text"
                placeholder="Enter Sub-Caste"
                value={form.subCaste}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subCaste: e.target.value }))
                }
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* INCOME DETAILS */}
      <div className="section-title">
  Income Details
</div>

      <div className="section-box">
        <div className="form-grid">
          <div>
            <label className="required">Annual Income</label>
            <input
              type="number"
              name="income"
              value={form.income}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Income Certificate Number</label>
            <input
              type="text"
              name="incomeCertNo"
              value={form.incomeCertNo}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Upload Income Certificate</label>

            {/* REPLACED UPLOAD BLOCK - shows 'View Document' only after file chosen */}
            <div className="file-row">
              <div
                className="file-input-wrapper"
                style={{ flex: 1, position: "relative" }}
              >
                <input
                  type="file"
                  id="incomeCertificate"
                  name="incomeCertificateFile"
                  className="file-hidden-input"
                  accept=".jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                />

                <label htmlFor="incomeCertificate" className="file-choose-btn">
                Choose File
                </label>

                <div className="file-name-text" style={{ paddingLeft: 8 }}>
                  {form.incomeCertificateFile
                    ? form.incomeCertificateFile.name
                    : form.incomeCertificate
                    ? form.incomeCertificate
                    : "No file chosen"}
                </div>
              </div>

              {(form.incomeCertificateFile || form.incomeCertificate) && (
                <button
                  type="button"
                  className="view-doc-btn"
                  onClick={() =>
                    form.incomeCertificateFile
                      ? openFile(form.incomeCertificateFile)
                      : window.open(form.incomeCertificate, "_blank")
                  }
                >
                  <FaEye /> View
                </button>
              )}
            </div>

           <p className="file-note">
  Upload PDF, JPG or PNG (Max 2MB)
</p>
          </div>
        </div>
      </div>

      {/* DOMICILE DETAILS */}
      <div className="section-title">
  Domicile Details
</div>

      <div className="section-box">
        <div className="form-grid">
          <div>
            <label className="required">Domicile Certificate Number</label>
            <input
              type="text"
              name="domicileCertNo"
              value={form.domicileCertNo}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Domicile Certificate Owner</label>
            <select
              name="domicileOwner"
              value={form.domicileOwner}
              onChange={handleChange}
            >
              <option value="Self">Self</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
            </select>
          </div>

          <div>
            <label>Upload Domicile Certificate</label>

            {/* REPLACED UPLOAD BLOCK - shows 'View Document' only after file chosen */}
            <div className="file-row">
              <div
                className="file-input-wrapper"
                style={{ flex: 1, position: "relative" }}
              >
                <input
                  type="file"
                  id="domicileCertificate"
                  name="domicileCertificateFile"
                  className="file-hidden-input"
                  accept=".jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                />

                <label
                  htmlFor="domicileCertificate"
                  className="file-choose-btn"
                >
                  Choose File
                </label>

                <div className="file-name-text" style={{ paddingLeft: 8 }}>
                  {form.domicileCertificateFile
                    ? form.domicileCertificateFile.name
                    : form.domicileCertificate
                    ? form.domicileCertificate
                    : "No file chosen"}
                </div>
              </div>

              {(form.domicileCertificateFile || form.domicileCertificate) && (
                <button
                  type="button"
                  className="view-doc-btn"
                  onClick={() =>
                    form.domicileCertificateFile
                      ? openFile(form.domicileCertificateFile)
                      : window.open(form.domicileCertificate, "_blank")
                  }
                >
                  <FaEye /> View
                </button>
              )}
            </div>

           <p className="file-note">
  Upload PDF, JPG or PNG (Max 2MB)
</p>
          </div>
        </div>
      </div>
      {/* OTHER DOCUMENTS */}
      <div id="other-documents">
  <div className="section-title">
    Other Documents
  </div>
</div>
<p className="doc-note">
  * Please ensure the correct document name is selected or entered. 
  Uploaded documents will be verified as per donor scheme requirements.
</p>

      <div className="section-box">
        
        <div className="form-grid three-col">
     <div>
  <label>Document Name</label>

  <select
    value={docForm.documentName}
    onChange={(e) =>
      setDocForm({
        ...docForm,
        documentName: e.target.value,
        customDocumentName: "", // reset custom when changing
      })
    }
  >
    <option value="">Select Document</option>
    {documentOptions.map((doc) => (
      <option key={doc} value={doc}>
        {doc}
      </option>
    ))}
  </select>

  {docForm.documentName === "Other" && (
    <input
      type="text"
      placeholder="Enter Document Name"
      value={docForm.customDocumentName}
      onChange={(e) =>
        setDocForm({
          ...docForm,
          customDocumentName: e.target.value,
        })
      }
      style={{ marginTop: "8px" }}
    />
  )}
</div>

          <div>
            <label>Document Number</label>
            <input
              value={docForm.documentNumber}
              onChange={(e) =>
                setDocForm({ ...docForm, documentNumber: e.target.value })
              }
            />
          </div>

         <div>
  <label>Upload Document</label>

  <div className="file-row">
    <div className="file-input-wrapper">
      <input
        type="file"
        id="otherDocFile"
        className="file-hidden-input"
        accept=".jpg,.jpeg,.pdf"
        onChange={(e) =>
          setDocForm({ ...docForm, file: e.target.files[0] })
        }
      />

      <label htmlFor="otherDocFile" className="file-choose-btn">
        Choose File
      </label>

      <div className="file-name-text">
        {docForm.file
          ? docForm.file.name
          : "No file chosen"}
      </div>
    </div>
  </div>
</div>
        </div>

        <div className="button-row center">
          
          <button className="btn-save" onClick={saveOtherDocument}>
            Add Document
          </button>
        </div>

        {otherDocs.length > 0 && (
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Document Number</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {otherDocs.map((d, idx) => (
                <tr key={d._id || idx}>
                  <td>{d.documentName}</td>
                  <td>{d.documentNumber}</td>
                  <td>
                    <button
                      className="view-doc-btn"
                      onClick={() =>
                        window.open(d.file, "_blank")
                      }
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* PERSONAL ELIGIBILITY */}
      <div className="section-title">
  Eligibility
</div>

      <div className="section-box">
        <div className="form-grid">
          <div>
            <label>Are you Salaried?</label>
          <select
  name="salaried"
  value={form.salaried}
  onChange={handleChange}
>
  <option value="No">No</option>
  <option value="Yes">Yes</option>
</select>
          </div>

          <div>
            <label>Do you have any Disability?</label>
<select name="disability" value={form.disability} onChange={handleChange}>
  <option value="No">No</option>
  <option value="Yes">Yes</option>
</select>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="button-row">
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
        <button className="btn-reset" type="button">
          Reset
        </button>
      </div>
    </>
  );
}

/* ---------------------- COLLEGE BANK DETAILS — STEP 6 ---------------------- */

function CollegeBankDetails({ initialData, onDataChange }) {
  
  const [form, setForm] = useState({
    collegeName: "",

    // BANK
    collegeBankAccount: "",
    collegeIFSC: "",
    collegeBranch: "",

    // UPI
    collegeUPIId: "",
    collegeQR: null,

    paymentMode: "bank",

    // FEES
    totalFeesAmount: "",
    totalFeesInWords: "",

    // DD
    ddFavourOf: "",
    ddPayableAt: "",
    ddRemarks: "",
  });

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  /* ---------------- VALIDATION ---------------- */
  const validateCollegeBank = () => {
    if (!form.collegeName) return false;

    if (!form.totalFeesAmount || Number(form.totalFeesAmount) <= 0) {
      alert("Please fill all required College & Bank details.");
      return false;
    }

    // ✅ BANK
    if (form.paymentMode === "bank") {
      if (!form.collegeBankAccount) return false;
      if (!form.collegeIFSC) return false;
      if (!form.collegeBranch) return false;
    }

// ✅ UPI validation (NO JSX)
if (form.paymentMode === "upi") {
  if (!form.collegeUPIId && !form.collegeQR) {
    return false;
  }
}


    // ✅ DD
    if (form.paymentMode === "dd") {
      if (!form.ddFavourOf) return false;
      if (!form.ddPayableAt) return false;
    }

    return true;
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev };

      if (name === "totalFeesAmount") {
        const clean = value.replace(/\D/g, "");
        updated.totalFeesAmount = clean;
        updated.totalFeesInWords = clean ? numberToWords(clean) : "";
      } else {
        updated[name] = value;
      }

      if (typeof onDataChange === "function") {
        onDataChange(updated);
      }

      return updated;
    });
  };

  const handleFile = (e) => {
    setForm((prev) => ({ ...prev, collegeQR: e.target.files[0] }));
  };

  const openFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  /* ---------------- SAVE ---------------- */
  const saveCollegeBank = async () => {
    if (!validateCollegeBank()) {
      alert("Please fill all required College & Bank details.");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "collegeBank",
          data: form,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      onDataChange?.(data.profile.collegeBank);
      alert("College Payment Details Saved!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  return (
    <>
      <div className="section-title">
  College Payment Details
</div>

      <div className="section-box">
        <div className="form-grid">
          <div className="full-row">
            <label className="required">College Name</label>
            <input
              type="text"
              name="collegeName"
              value={form.collegeName}
              onChange={handleChange}
            />
          </div>

          <div className="full-row">
            <label className="required">Payment Mode</label>
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
            >
              <option value="bank">Bank Account</option>
              <option value="dd">Demand Draft (DD)</option>
              <option value="upi">UPI / QR Code</option>
            </select>
          </div>

          {/* ================= BANK ================= */}
          {form.paymentMode === "bank" && (
            <>
              <div>
                <label className="required">Account Number</label>
                <input
                  type="text"
                  name="collegeBankAccount"
                  value={form.collegeBankAccount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="required">IFSC Code</label>
                <input
                  type="text"
                  name="collegeIFSC"
                  value={form.collegeIFSC}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="required">Branch Name</label>
                <input
                  type="text"
                  name="collegeBranch"
                  value={form.collegeBranch}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* ================= DD ================= */}
          {form.paymentMode === "dd" && (
            <>
              <div className="full-row">
                <label className="required">DD in Favour of</label>
                <input
                  type="text"
                  name="ddFavourOf"
                  value={form.ddFavourOf}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="required">DD Payable at</label>
                <input
                  type="text"
                  name="ddPayableAt"
                  value={form.ddPayableAt}
                  onChange={handleChange}
                />
              </div>

              <div className="full-row">
                <label>Remarks</label>
                <textarea
                  rows={2}
                  name="ddRemarks"
                  value={form.ddRemarks}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
        </div>

        {/* FEES */}
        <div className="form-grid">
          <div>
            <label className="required">Total Fees Amount</label>
            <input
              type="text"
              name="totalFeesAmount"
              value={form.totalFeesAmount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Total Fees in Words</label>
            <input type="text" value={form.totalFeesInWords} disabled />
          </div>
        </div>
      </div>

      <div className="button-row">
        <button className="btn-save" onClick={saveCollegeBank}>
          Save
        </button>
      </div>
    </>
  );
}

/* ---------------------- ADDRESS INFO ---------------------- */

function AddressInfo({ initialData, onDataChange }) {
  
  const [perm, setPerm] = useState({
    address: "",
    state: "Maharashtra",
    district: "",
    taluka: "",
    village: "",
    pincode: "",
  });

  const [corr, setCorr] = useState({
    address: "",
    state: "Maharashtra",
    district: "",
    taluka: "",
    village: "",
    pincode: "",
  });

  const [same, setSame] = useState(true);

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setPerm(initialData.perm || perm);
      setSame(initialData.same ?? true);
      setCorr(
        initialData.same ? initialData.perm || perm : initialData.corr || corr
      );
    }
  }, [initialData]);

  const handlePerm = (e) => {
    const { name, value } = e.target;
    const updated = { ...perm, [name]: value };
    setPerm(updated);

    if (same) setCorr(updated);
  };

  const handleCorr = (e) => {
    const { name, value } = e.target;
    setCorr({ ...corr, [name]: value });
  };

  const toggleSame = (value) => {
    setSame(value);
    if (value) setCorr(perm);
  };

  const validateAddress = () => {
    // Permanent address mandatory
    if (!perm.address?.trim()) return false;
    if (!perm.district?.trim()) return false;
    if (!perm.taluka?.trim()) return false;
    if (!perm.pincode?.trim()) return false;

    // Correspondence address mandatory ONLY if not same
    if (!same) {
      if (!corr.address?.trim()) return false;
      if (!corr.district?.trim()) return false;
      if (!corr.taluka?.trim()) return false;
      if (!corr.pincode?.trim()) return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateAddress()) {
      alert("Please fill all required Address details.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not logged in");
      return;
    }

    const payload = {
      perm,
      corr: same ? perm : corr,
      same,
    };

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "address",
          data: payload,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      if (typeof onDataChange === "function") {
        onDataChange(data.profile.address);
      }
      alert("Address Details Saved Successfully!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  return (
    <>
      <div className="section-title">
  Permanent Address
</div>

      <div className="section-box">
        <div className="form-grid">
          <div className="full-row">
          <label className="required">Address</label>
            <textarea
              name="address"
              rows={3}
              value={perm.address}
              onChange={handlePerm}
            />
          </div>

          <div>
          <label className="required">State</label>
            <input
              type="text"
              name="State"
              value={perm.state}
              onChange={handlePerm}
            />
          </div>

          <div>
           <label className="required">District</label>
            <input
              type="text"
              name="district"
              value={perm.district}
              onChange={handlePerm}
            />
          </div>

          <div>
            <label className="required">Taluka</label>
            <input
              type="text"
              name="taluka"
              value={perm.taluka}
              onChange={handlePerm}
            />
          </div>

          <div>
            <label>Village/City</label>
            <input
              type="text"
              name="village"
              value={perm.village}
              onChange={handlePerm}
            />
          </div>

          <div>
          <label className="required">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={perm.pincode}
              onChange={handlePerm}
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label>Is Correspondence Address same as Permanent Address?</label>
          <div className="radio-group">
            <label className="radio-inline">
  <input type="radio" checked={same} onChange={() => toggleSame(true)} />{" "}
  Yes
</label>

<label className="radio-inline">
  <input type="radio" checked={!same} onChange={() => toggleSame(false)} />{" "}
  No
</label>
          </div>
        </div>
      </div>

      <div className="section-title">
  Correspondence Address
</div>

      <div className="section-box">
        <div className="form-grid">
          <div className="full-row">
            <label className="required">Address</label>
            <textarea
              name="address"
              rows={3}
              value={corr.address}
              disabled={same}
              onChange={handleCorr}
            />
          </div>

          <div>
            <label className="required">State</label>
            <input
              type="text"
              name="state"
              value={corr.state}
              disabled={same}
              onChange={handleCorr}
            />
          </div>

          <div>
            <label className="required">District</label>
            <input
              type="text"
              name="district"
              value={corr.district}
              disabled={same}
              onChange={handleCorr}
            />
          </div>

          <div>
            <label>Taluka</label>
            <select
              name="taluka"
              disabled={same}
              value={corr.taluka}
              onChange={handleCorr}
            >
              <option value="Mumbai City">
  Mumbai City
</option>

<option value="Mumbai Suburban">
  Mumbai Suburban
</option>
            </select>
          </div>

          <div>
            <label>Village/City</label>
            <input
              type="text"
              name="village"
              disabled={same}
              value={corr.village}
              onChange={handleCorr}
            />
          </div>

          <div>
            <label className="required">Pincode</label>
            <input
              type="text"
              name="pincode"
              disabled={same}
              value={corr.pincode}
              onChange={handleCorr}
            />
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 18 }}>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
          <button
            className="btn-reset"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------------- OTHER INFO ---------------------- */

function OtherInfo({ initialData, onDataChange }) {
  
  const [form, setForm] = useState({
    fatherAlive: "Yes",
    fatherName: "",
    fatherOccupation: "Service",
    fatherSalaried: "Yes",

    motherAlive: "Yes",
    motherName: "",
    motherOccupation: "Housewife",
    motherSalaried: "No",
  });

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setForm((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadio = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateOtherInfo = () => {
    const requiredFields = [
      "fatherAlive",
      "fatherName",
      "fatherOccupation",
      "fatherSalaried",
      "motherAlive",
      "motherName",
      "motherOccupation",
      "motherSalaried",
    ];

    for (let field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === "") {
        return false;
      }
    }
    return true;
  };

  const saveOther = async () => {
    if (!validateOtherInfo()) {
      alert("Please fill all required Parent details.");
      return;
    }
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "other",
          data: form,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      if (typeof onDataChange === "function") {
        onDataChange(data.profile.other);
      }
      alert("Other Details Saved Successfully!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  return (
    <>
      <div className="section-title">
  Parent Details
</div>

      <div className="section-box">
        <div className="form-grid">
          <div>
            <label className="required">Is Father Alive?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={form.fatherAlive === "Yes"}
                  onChange={() => handleRadio("fatherAlive", "Yes")}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  checked={form.fatherAlive === "No"}
                  onChange={() => handleRadio("fatherAlive", "No")}
                />{" "}
                No
              </label>
            </div>
          </div>

          <div>
            <label className="required">Father Name</label>
            <input
              type="text"
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              disabled={form.fatherAlive === "No"}
            />
          </div>

          <div>
            <label className="required">Occupation</label>
            <select
  name="fatherOccupation"
  value={form.fatherOccupation}
  onChange={handleChange}
  disabled={form.fatherAlive === "No"}
>
  <option value="Service">Service</option>
  <option value="Business">Business</option>
  <option value="Farmer">Farmer</option>
  <option value="Retired">Retired</option>
  <option value="Unemployed">Unemployed</option>
</select>
          </div>

          <div>
            <label className="required">Is Salaried?</label>
            <select
  name="fatherSalaried"
  value={form.fatherSalaried}
  onChange={handleChange}
>
  <option value="No">No</option>
  <option value="Yes">Yes</option>
</select>
          </div>

          <div>
            <label className="required">Is Mother Alive?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={form.motherAlive === "Yes"}
                  onChange={() => handleRadio("motherAlive", "Yes")}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  checked={form.motherAlive === "No"}
                  onChange={() => handleRadio("motherAlive", "No")}
                />{" "}
                No
              </label>
            </div>
          </div>

          <div>
         <label className="required">Mother Name</label>
            <input
              type="text"
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
              disabled={form.motherAlive === "No"}
            />
          </div>

          <div>
            <label className="required">Occupation</label>
            <select
  name="motherOccupation"
  value={form.motherOccupation}
  onChange={handleChange}
  disabled={form.motherAlive === "No"}
>
  <option value="Housewife">Housewife</option>
  <option value="Service">Service</option>
  <option value="Business">Business</option>
  <option value="Farmer">Farmer</option>
  <option value="Retired">Retired</option>
  <option value="Unemployed">Unemployed</option>
</select>
          </div>

          <div>
            <label className="required">Is Salaried?</label>
            <select
  name="motherSalaried"
  value={form.motherSalaried}
  onChange={handleChange}
>
  <option value="No">No</option>
  <option value="Yes">Yes</option>
</select>
          </div>
        </div>

        <div className="button-row">
          <button className="btn-save" onClick={saveOther}>
            Save
          </button>
          <button
            className="btn-reset"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------- CourseInfo (Upload Last Year Marksheet uses custom UI) ---------------- */
function CourseInfo({ initialData, onDataChange }) {
  
const [course, setCourse] = useState({
    admissionYear: "",
    standard: "",
    instituteState: "Maharashtra",
    instituteDistrict: "Mumbai City",
    instituteTaluka: "Mumbai City",
    qualificationLevel: "",
    stream: "",
    courseName: "",
    collegeName: "",
    cetScore: "",
    lastYearMarksheet: null,
    yearOfStudy: "",
    completedOrContinue: "",
    isProfessional: "",
    reservedCategory: "General",
    gapYears: "0",
    mode: "Regular",
    admissionDate: "",
    admissionYearCollege: "",
    university: "",
    result: "",
  });

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setCourse((prev) => ({
        ...prev,
        ...initialData,
        lastYearMarksheet: null,
      }));
    }
  }, [initialData]);

  const [fileError, setFileError] = useState(""); // store file validation error message

 const districts = [
  "ahmednagar",
  "akola",
  "amravati",
  "aurangabad",
  "beed",
  "bhandara",
  "buldhana",
  "chandrapur",
  "dhule",
  "gadchiroli",
  "gondia",
  "hingoli",
  "jalgaon",
  "jalna",
  "kolhapur",
  "latur",
  "mumbai_city",
  "mumbai_suburban",
  "nanded",
  "nandurbar",
  "nashik",
  "osmanabad",
  "palghar",
  "parbhani",
  "pune",
  "raigad",
  "ratnagiri",
  "sangli",
  "satara",
  "sindhudurg",
  "solapur",
  "thane",
  "wardha",
  "washim",
  "yavatmal"
];

  const talukaOptionsMap = {
    "Mumbai City": ["Mumbai City"],
    "Mumbai Suburban": [
      "Andheri",
      "Bandra",
      "Borivali",
      "Kurla",
      "Andheri East",
      "Goregaon",
      "Juhu",
    ],
    Thane: [
      "Thane",
      "Kalyan",
      "Bhiwandi",
      "Murbad",
      "Ulhasnagar",
      "Shahapur",
      "Ambarnath",
    ],
    Palghar: [
      "Palghar",
      "Vasai",
      "Dahanu",
      "Talasari",
      "Jawhar",
      "Mokhada",
      "Vada",
      "Vikramgad",
    ],
    Pune: [
      "Pune",
      "Haveli",
      "Shirur",
      "Khed (Rajgurunagar)",
      "Bhor",
      "Mulshi",
      "Baramati",
      "Khandala",
      "Junnar",
    ],
    Nashik: [
      "Nashik",
      "Igatpuri",
      "Dindori",
      "Niphad",
      "Sinnar",
      "Yeola",
      "Trimbakeshwar",
      "Baglan",
      "Deola",
    ],
    Nagpur: [
      "Nagpur",
      "Hingna",
      "Umred",
      "Bramhapuri",
      "Savner",
      "Parseoni",
      "Kuhi",
    ],
    Raigad: [
      "Alibag",
      "Pen",
      "Mangaon",
      "Mahad",
      "Roha",
      "Karjat",
      "Khalapur",
      "Uran",
    ],
    Ratnagiri: [
      "Ratnagiri",
      "Sangameshwar",
      "Chiplun",
      "Khed",
      "Dapoli",
      "Mandangad",
      "Guhagar",
    ],
    Sindhudurg: [
      "Kankavli",
      "Vaibhavwadi",
      "Malvan",
      "Sawantwadi",
      "Kudal",
      "Vengurla",
      "Dodamarg",
    ],
    Solapur: [
      "Solapur",
      "Akkalkot",
      "Mohol",
      "Karmala",
      "Madha",
      "Barshi",
      "Mangalwedha",
    ],
    Aurangabad: ["Aurangabad", "Kannad", "Vaijapur", "Paithan", "Gangapur"],
  };

  const hideForStandards = ["6th", "7th", "8th", "9th", "10th"];

  const isSchoolStandard = (val) => {
    const s = (val || "").toLowerCase();
    return hideForStandards.some((h) => s.includes(h));
  };

  const getInstitutionType = (standard) => {
    if (!standard) return "Institute";
    const s = standard.toLowerCase();
    if (
      s.includes("11th") ||
      s.includes("12th") ||
      s.includes("diploma") ||
      s.includes("undergraduate") ||
      s.includes("postgraduate") ||
      s.includes("professional") ||
      s.includes("degree") ||
      s.includes("ug") ||
      s.includes("pg")
    ) {
      return "College";
    }
    if (
      s.includes("standard") ||
      s.includes("6th") ||
      s.includes("7th") ||
      s.includes("8th") ||
      s.includes("9th") ||
      s.includes("10th")
    ) {
      return "School";
    }
    return "Institute";
  };

  const institutionType = getInstitutionType(course.standard);
  const showExtras = !isSchoolStandard(course.standard);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      const school = isSchoolStandard(value);
      setCourse((p) => ({
        ...p,
        [name]: value,
        courseName: school ? "" : p.courseName,
        yearOfStudy: school ? "" : p.yearOfStudy,
        isProfessional: school ? "" : p.isProfessional,
      }));
      return;
    }

    if (name === "instituteDistrict") {
      setCourse((p) => ({
        ...p,
        [name]: value,
        instituteTaluka: talukaOptionsMap[value]
          ? talukaOptionsMap[value][0]
          : "",
      }));
      return;
    }

    setCourse((p) => ({ ...p, [name]: value }));
  };

  // file size/type validation: 15 KB to 256 KB, and extension jpg/jpeg/pdf
  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFileError("");
    if (!f) {
      setCourse((p) => ({ ...p, lastYearMarksheet: null }));
      return;
    }

    const allowed = ["image/jpeg", "application/pdf"];
    const min = 15 * 1024; // 15 KB
    const max = 256 * 1024; // 256 KB

    // check mime OR extension fallback
    const ext = f.name.split(".").pop().toLowerCase();
    const mimeOk = allowed.includes(f.type);
    const extOk = ["jpg", "jpeg", "pdf"].includes(ext);

    if (!mimeOk && !extOk) {
      setFileError("Invalid file type. Only .jpeg, .jpg or .pdf allowed.");
      setCourse((p) => ({ ...p, lastYearMarksheet: null }));
      e.target.value = ""; // reset native input
      return;
    }

    if (f.size < min) {
      setFileError("File too small. Minimum allowed size is 15 KB.");
      setCourse((p) => ({ ...p, lastYearMarksheet: null }));
      e.target.value = "";
      return;
    }

    if (f.size > max) {
      setFileError("File too large. Maximum allowed size is 256 KB.");
      setCourse((p) => ({ ...p, lastYearMarksheet: null }));
      e.target.value = "";
      return;
    }

    // all ok
    setCourse((p) => ({ ...p, lastYearMarksheet: f }));
    setFileError("");
  };

  const validateCourseInfo = () => {
    // mandatory for all
    if (!course.standard) return false;
    if (!course.completedOrContinue) return false;
    if (!course.reservedCategory) return false;
    if (course.gapYears === "") return false;
    // School / College / Institute Name mandatory for ALL
    if (!course.collegeName || course.collegeName.trim() === "") {
      return false;
    }

    // last year marksheet mandatory ONLY for non-school standards
    if (!isSchoolStandard(course.standard) && !course.lastYearMarksheet) {
      return false;
    }

    const std = (course.standard || "").toLowerCase();

    // 11th / 12th → stream mandatory
    if (std.includes("11th") || std.includes("12th")) {
      if (!course.stream) return false;
    }

    // NON-school & NON 11–12 → extra fields mandatory
    if (
      !std.includes("6th") &&
      !std.includes("7th") &&
      !std.includes("8th") &&
      !std.includes("9th") &&
      !std.includes("10th") &&
      !std.includes("11th") &&
      !std.includes("12th")
    ) {
      if (!course.qualificationLevel) return false;
      if (!course.courseName) return false;
      if (!course.yearOfStudy) return false;
      if (!course.isProfessional) return false;
      if (!course.mode) return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateCourseInfo()) {
      alert("Please fill all required Course details.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not logged in");
      return;
    }

    const formData = new FormData();
    formData.append("section", "courseList");

    // 🔥 copy data WITHOUT file
    const cleaned = { ...course };
    delete cleaned.lastYearMarksheet;

    formData.append("data", JSON.stringify(cleaned));

    // 🔥 send file with correct key
    if (course.lastYearMarksheet) {
      formData.append("marksheet", course.lastYearMarksheet);
    }

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DO NOT SET Content-Type
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      if (typeof onDataChange === "function") {
        onDataChange(data.profile.courseList);
      }
      alert("Course Details Saved Successfully!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  const openFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
  };

  const talukasForDistrict = (district) => talukaOptionsMap[district] || null;

  return (
    <>
      <div className="section-title">
  Qualification Details
</div>
      <div className="section-box">
        <div className="form-grid">
          <div>
            <label className="required">Current Course</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select
                name="standard"
                value={course.standard}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">Select</option>
                <option value="6th Standard">6th Standard</option>
                <option value="7th Standard">7th Standard</option>
                <option value="8th Standard">8th Standard</option>
                <option value="9th Standard">9th Standard</option>
                <option value="10th Standard">10th Standard</option>
                <option value="11th Standard">11th Standard</option>
                <option value="12th Standard">12th Standard</option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Professional (Medical/Engineering/Law)">
                  Professional (Medical/Engineering/Law)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="required">Institute State</label>
            <select
              name="instituteState"
              disabled
              value={course.instituteState}
              onChange={handleChange}
            >
              <option>Maharashtra</option>
            </select>
          </div>

          <div>
            <label className="required">Institute District</label>
            <select
              name="instituteDistrict"
              value={course.instituteDistrict}
              onChange={handleChange}
            >
              {districts.map((d) => (
  <option key={d} value={d}>
    {d}
  </option>
))}
            </select>
          </div>

          <div>
            <label>Institute Taluka</label>
            {talukasForDistrict(course.instituteDistrict) ? (
              <select
                name="instituteTaluka"
                value={course.instituteTaluka}
                onChange={handleChange}
              >
                {talukasForDistrict(course.instituteDistrict).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="instituteTaluka"
                value={course.instituteTaluka}
                placeholder="Institute Taluka"
                onChange={handleChange}
              />
            )}
          </div>

          {!isSchoolStandard(course.standard) &&
            !course.standard.toLowerCase().includes("11th") &&
            !course.standard.toLowerCase().includes("12th") && (
              <div>
                <label className="required">Qualification Level</label>
                <select
                  name="qualificationLevel"
                  value={course.qualificationLevel}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="School (Primary/Secondary)">School (Primary/Secondary)</option>
                  <option value="Post S.S.C Diploma">Post S.S.C Diploma</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Professional (Medical/Engineering/Law)">Professional (Medical/Engineering/Law)</option>
                </select>
              </div>
            )}

          {(course.standard.toLowerCase().includes("11th") ||
            course.standard.toLowerCase().includes("12th")) && (
            <div>
              <label>
                <label className="required">Stream</label>
              </label>
              <select
                name="stream"
                value={course.stream}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
          )}

          {/* Course Name: only show for non-school standards */}
          {!isSchoolStandard(course.standard) &&
            !course.standard.toLowerCase().includes("11th") &&
            !course.standard.toLowerCase().includes("12th") && (
              <div>
                <label className="required">Course Name</label>
                <select
                  name="courseName"
                  value={course.courseName}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="MBBS">MBBS</option>
                  <option value="BDS">BDS</option>
                  <option value="B.Sc Nursing">B.Sc Nursing</option>
                  <option value="BPT (Physiotherapy)">BPT (Physiotherapy)</option>
                  <option value="B.Pharma">B.Pharma</option>
                  <option value="M.B.B.S. - Post Graduate">M.B.B.S. - Post Graduate</option>
                  <option value="LLB">LLB</option>
                  <option value="LLM">LLM</option>
                  <option value="B.A. LL.B">B.A. LL.B</option>
                  <option value="B.Com LL.B">B.Com LL.B</option>
                  <option value="Post S.S.C Diploma - Information Technology">Post S.S.C Diploma - IT</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            )}

          <div>
            <label className="required">Institute/College Name</label>
            <input
              type="text"
              name="collegeName"
              value={course.collegeName}
              onChange={handleChange}
            />
          </div>

          {/* File upload - REPLACED BLOCK (shows error only when fileError set) */}
          <div>
            <label className="required">Upload Last Year Marksheet</label>
            <div className="file-row">
              <div
                className="file-input-wrapper"
                role="group"
                aria-label="Upload marksheet"
                style={{ flex: 1 }}
              >
                <input
                  id="lastYearMarksheet"
                  className="file-hidden-input"
                  type="file"
                  accept=".jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                />

                <label
                  htmlFor="lastYearMarksheet"
                  className="file-choose-btn"
                  tabIndex={0}
                >
                  Choose File
                </label>

                <div className="file-name-text">
                  {course.lastYearMarksheet
                    ? course.lastYearMarksheet.name
                    : course.marksheet
                    ? course.marksheet
                    : "No file chosen"}
                </div>
              </div>

              {/* View only when valid file set and no fileError */}
              {!fileError && (course.lastYearMarksheet || course.marksheet) && (
                <button
                  type="button"
                  className="view-doc-btn"
                  aria-label="View uploaded marksheet"
                  onClick={
                    () =>
                      course.lastYearMarksheet
                        ? openFile(course.lastYearMarksheet) // NEW upload
                        : window.open(course.marksheet, "_blank")
                  }
                >
                  <FaEye className="view-icon" /> View
                </button>
              )}
            </div>

            {/* Show error note ONLY when there is an actual error */}
            {fileError ? (
              <div className="file-note error">{fileError}</div>
            ) : null}
          </div>

          {/* Extras (Year Of Study, Is Professional, Mode) shown only for non-school standards */}
          {showExtras &&
            !course.standard.toLowerCase().includes("11th") &&
            !course.standard.toLowerCase().includes("12th") && (
              <>
                <div>
                  <label className="required">Year of Study</label>
                  <select
                    name="yearOfStudy"
                    value={course.yearOfStudy}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="NA">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="required">Is Professional Course?</label>
                  <select
                    name="isProfessional"
                    value={course.isProfessional}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Professional Course">Professional Course</option>
                    <option value="Non-professional Course">Non-professional Course</option>
                  </select>
                </div>

                <div>
                  <label className="required">Mode of Study</label>
                  <select
                    name="mode"
                    value={course.mode}
                    onChange={handleChange}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Distance">Distance</option>
                  </select>
                </div>
              </>
            )}

          <div>
            <label>
              <label className="required">Course Status</label>
            </label>
            <select
              name="completedOrContinue"
              value={course.completedOrContinue}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Completed">Completed</option>
              <option value="Pursuing">Pursuing</option>
            </select>
          </div>

          <div>
            <label>
              <label className="required">Admission Category</label>
            </label>
            <select
              name="reservedCategory"
              value={course.reservedCategory}
              onChange={handleChange}
            >
              <option value="General">General</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
            </select>
          </div>

          <div>
            <label className="required">Gap Years</label>
            <input
              type="number"
              name="gapYears"
              value={course.gapYears}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
          <button
            className="btn-reset"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

function QualificationInfo({ initialData, onDataChange }) {
  // ---- Dynamic State → District → Taluka Data ----
 
 const locationData = {
    Maharashtra: {
      Ahmednagar: [
        "Akole",
        "Jamkhed",
        "Karjat",
        "Nevasa",
        "Parner",
        "Rahata",
        "Rahuri",
        "Shrigonda",
        "Shevgaon",
        "Sangamner",
      ],
      Akola: [
        "Akola",
        "Akot",
        "Balapur",
        "Barshitakli",
        "Murtizapur",
        "Telhara",
      ],
      Amravati: [
        "Amravati",
        "Anjangaon",
        "Bhatkuli",
        "Chandur Bazar",
        "Chandur Railway",
        "Daryapur",
        "Dhamangaon",
        "Morshi",
        "Nandgaon",
        "Teosa",
        "Warud",
      ],
      Aurangabad: [
        "Aurangabad",
        "Kannad",
        "Khuldabad",
        "Phulambri",
        "Sillod",
        "Soegaon",
        "Vaijapur",
        "Gangapur",
      ],
      Beed: [
        "Ambajogai",
        "Ashti",
        "Beed",
        "Dharur",
        "Georai",
        "Kaij",
        "Majalgaon",
        "Parli",
        "Patoda",
        "Shirur",
      ],
      Bhandara: [
        "Bhandara",
        "Lakhandur",
        "Lakhani",
        "Mohadi",
        "Pauni",
        "Sakoli",
        "Tumsar",
      ],
      Buldhana: [
        "Buldhana",
        "Chikhli",
        "Deulgaon Raja",
        "Jalgaon Jamod",
        "Khamgaon",
        "Lonar",
        "Malkapur",
        "Mehkar",
        "Motala",
        "Nandura",
        "Shegaon",
        "Sindkhed Raja",
      ],
      Chandrapur: [
        "Ballarpur",
        "Bhadravati",
        "Brahmapuri",
        "Chandrapur",
        "Chimur",
        "Gondpipri",
        "Jiwati",
        "Korpana",
        "Mul",
        "Nagbhid",
        "Pombhurna",
        "Rajura",
        "Sawali",
        "Sindewahi",
        "Warora",
      ],
      Dhule: ["Dhule", "Sakri", "Shirpur", "Sindkheda"],
      Gadchiroli: [
        "Aheri",
        "Armori",
        "Bhamragarh",
        "Chamorshi",
        "Dhanora",
        "Desaiganj",
        "Etapalli",
        "Gadchiroli",
        "Kurkheda",
        "Mulchera",
        "Sironcha",
      ],
      Gondia: [
        "Arjuni Morgaon",
        "Deori",
        "Gondia",
        "Goregaon",
        "Sadak Arjuni",
        "Salekasa",
        "Tirora",
      ],
      Hingoli: ["Aundha", "Basmat", "Hingoli", "Kalamnuri", "Sengaon"],
      Jalgaon: [
        "Amalner",
        "Bhadgaon",
        "Bhusawal",
        "Bodwad",
        "Chalisgaon",
        "Chopda",
        "Erandol",
        "Jalgaon",
        "Jamner",
        "Muktainagar",
        "Pachora",
        "Parola",
        "Raver",
        "Yawal",
      ],
      Jalna: [
        "Ambad",
        "Badnapur",
        "Bhokardan",
        "Ghansawangi",
        "Jafrabad",
        "Jalna",
        "Mantha",
        "Partur",
      ],
      Kolhapur: [
        "Ajra",
        "Bavda",
        "Bhudargad",
        "Chandgad",
        "Gadhinglaj",
        "Hatkanangale",
        "Karveer",
        "Kagal",
        "Panhala",
        "Radhanagari",
        "Shahuwadi",
      ],
      Latur: [
        "Ahmadpur",
        "Ausa",
        "Chakur",
        "Deoni",
        "Jalkot",
        "Latur",
        "Nilanga",
        "Renapur",
        "Shirur Anantpal",
        "Udgir",
      ],
      Mumbai: ["Mumbai City", "Mumbai Suburban"],
      Nagpur: [
        "Bhiwapur",
        "Hingna",
        "Kalmeshwar",
        "Katol",
        "Kuhi",
        "Mouda",
        "Nagpur",
        "Narkhed",
        "Parseoni",
        "Ramtek",
        "Savner",
        "Umred",
      ],
      Nanded: [
        "Ardhapur",
        "Bhokar",
        "Biloli",
        "Deglur",
        "Dharmabad",
        "Hadgaon",
        "Himayatnagar",
        "Kandhar",
        "Kinwat",
        "Loha",
        "Mahur",
        "Mudkhed",
        "Mukhed",
        "Nanded",
        "Naigaon",
        "Umri",
      ],
      Nandurbar: [
        "Akkalkuwa",
        "Akrani",
        "Nandurbar",
        "Nawapur",
        "Shahada",
        "Taloda",
      ],
      Nashik: [
        "Baglan",
        "Chandwad",
        "Deola",
        "Dindori",
        "Igatpuri",
        "Kalwan",
        "Malegaon",
        "Nandgaon",
        "Nashik",
        "Niphad",
        "Peint",
        "Sinnar",
        "Surgana",
        "Trimbakeshwar",
      ],
      Osmanabad: [
        "Bhum",
        "Kalamb",
        "Lohara",
        "Osmanabad",
        "Paranda",
        "Tuljapur",
        "Umarga",
        "Washi",
      ],
      Palghar: [
        "Dahanu",
        "Jawhar",
        "Mokhada",
        "Palghar",
        "Talasari",
        "Vada",
        "Vasai",
        "Wada",
      ],
      Parbhani: [
        "Gangakhed",
        "Jintur",
        "Manwat",
        "Palam",
        "Parbhani",
        "Pathri",
        "Purna",
        "Sailu",
        "Sonpeth",
      ],
      Pune: [
        "Baramati",
        "Bhor",
        "Daund",
        "Haveli",
        "Indapur",
        "Junnar",
        "Khed",
        "Mawal",
        "Mulshi",
        "Pune City",
        "Purandar",
        "Shirur",
        "Velhe",
      ],
      Raigad: [
        "Alibag",
        "Karjat",
        "Khalapur",
        "Mahad",
        "Mangaon",
        "Murud",
        "Panvel",
        "Pen",
        "Poladpur",
        "Roha",
        "Shrivardhan",
        "Sudhagad",
        "Tala",
        "Uran",
      ],
      Ratnagiri: [
        "Chiplun",
        "Dapoli",
        "Guhagar",
        "Khed",
        "Lanja",
        "Mandangad",
        "Rajapur",
        "Ratnagiri",
        "Sangameshwar",
      ],
      Sangli: [
        "Atpadi",
        "Jath",
        "Kadegaon",
        "Kavathe Mahankal",
        "Khanapur",
        "Miraj",
        "Palus",
        "Shirala",
        "Tasgaon",
        "Walwa",
      ],
      Satara: [
        "Jaoli",
        "Karad",
        "Khandala",
        "Khatav",
        "Koregaon",
        "Man",
        "Patan",
        "Phaltan",
        "Satara",
        "Wai",
      ],
      Sindhudurg: [
        "Devgad",
        "Kankavli",
        "Kudal",
        "Malwan",
        "Sawantwadi",
        "Vaibhavwadi",
        "Vengurla",
      ],
      Solapur: [
        "Akkalkot",
        "Barshi",
        "Karmala",
        "Madha",
        "Malshiras",
        "Mangalwedhe",
        "Mohol",
        "Pandharpur",
        "Sangole",
        "Solapur North",
        "Solapur South",
      ],
      Thane: [
        "Ambarnath",
        "Bhiwandi",
        "Kalyan",
        "Murbad",
        "Shahapur",
        "Thane",
        "Ulhasnagar",
        "Vasai",
        "Vikramgad",
      ],
      Wardha: [
        "Arvi",
        "Ashti",
        "Deoli",
        "Hinganghat",
        "Karanja",
        "Samudrapur",
        "Seloo",
        "Wardha",
      ],
      Washim: [
        "Karanja",
        "Malegaon",
        "Mangrulpir",
        "Manora",
        "Risod",
        "Washim",
      ],
      Yavatmal: [
        "Arni",
        "Babulgaon",
        "Darwha",
        "Digras",
        "Ghatanji",
        "Kalamb",
        "Mahagaon",
        "Maregaon",
        "Ner",
        "Pandharkawada",
        "Pusad",
        "Ralegaon",
        "Umarkhed",
        "Wani",
        "Yavatmal",
      ],
    },
  };

  const [form, setForm] = useState({
    levelGroup: "",
    qualificationLevel: "",
    stream: "",
    instituteState: "Maharashtra",
    instituteDistrict: "",
    instituteTaluka: "",
    collegeName: "",
    course: "",
    boardUniversity: "",
    admissionYear: "",
    passingYear: "",
    percentage: "",
    result: "",
    marksheet: null,
    gap: "No",
    gapYears: "",
    gapCertificate: null,
  });

  useEffect(() => {
    if (initialData && typeof initialData === "object") {
      setForm((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  useEffect(() => {
    if (
      [
        "SSC (10th)",
        "Diploma",
        "Undergraduate (UG)",
        "Postgraduate (PG)",
      ].includes(form.levelGroup)
    ) {
      setForm((prev) => ({
        ...prev,
        qualificationLevel: form.levelGroup,
      }));
    }
  }, [form.levelGroup]);

  const isDropout = form.levelGroup === "Dropout";

  const validateQualification = () => {
    if (!form.levelGroup) return false;

    // ✅ STATE MANDATORY
    if (!form.instituteState || form.instituteState.trim() === "") return false;

    if (isDropout) {
      if (!form.collegeName) return false;
      return true;
    }

    // Non-dropout
    if (!form.passingYear) return false;
    if (!form.result) return false;
    const hasMarksheet =
      form.marksheet instanceof File || typeof form.marksheet === "string";

    if (!hasMarksheet) return false;

    return true;
  };

  // handle select/text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // file upload
  // file upload handler (works for marksheet + gap certificate)
  const handleFile = (e) => {
    const file = e.target.files[0];

    setForm((prev) => ({
      ...prev,
      [e.target.name]: file,
      [e.target.name + "Preview"]: file ? URL.createObjectURL(file) : null,
    }));
  };

  // Radio gap
  const handleRadio = (value) => {
    setForm((prev) => ({ ...prev, gap: value }));
  };

  // Save
  const handleSave = async () => {
    if (!validateQualification()) {
      alert("Please fill all mandatory Qualification fields.");
      return;
    }

    const formData = new FormData();
    formData.append("section", "qualificationRecords");

    // 🔥 SEND NON-FILE DATA
    const cleaned = { ...form };
    delete cleaned.marksheet;
    delete cleaned.gapCertificate;
    delete cleaned.marksheetPreview;
    delete cleaned.gapCertificatePreview;

    formData.append("data", JSON.stringify(cleaned));

    // 🔥 SEND FILES PROPERLY
    if (form.marksheet) {
      formData.append("marksheet", form.marksheet);
    }
    if (form.gapCertificate) {
      formData.append("gapCertificate", form.gapCertificate);
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DO NOT SET CONTENT-TYPE
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      if (typeof onDataChange === "function") {
        onDataChange(data.profile.qualificationRecords);
      }
      alert("Qualification Saved!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  return (
    <>
      <div className="section-title">
  Qualification Details
</div>

      <div className="section-box">
        <div className="form-grid">
          {/* MAIN GROUP */}
          <div>
            <label className="required">Qualification Category</label>
            <select
              name="levelGroup"
              value={form.levelGroup}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Class 6–10">Class 6–10</option>
              <option value="SSC (10th)">SSC (10th)</option>
              <option value="Class 11–12 (HSC)">Class 11–12 (HSC)</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate (UG)">Undergraduate (UG)</option>
              <option value="Postgraduate (PG)">Postgraduate (PG)</option>
              <option value="Dropout">Dropout</option>
            </select>
          </div>

          {/* Std picker for Class 6–10 */}
          {form.levelGroup === "Class 6–10" && (
            <div>
              <label className="required">Select Standard</label>
              <select
                name="qualificationLevel"
                value={form.qualificationLevel}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="6th Standard">6th Standard</option>
                <option value="7th Standard">7th Standard</option>
                <option value="8th Standard">8th Standard</option>
                <option value="9th Standard">9th Standard</option>
                <option value="10th Standard">10th Standard</option>
              </select>
            </div>
          )}

          {/* SSC */}
          {form.levelGroup === "SSC (10th)" && (
            <div>
              <label>Qualification Level</label>
              <input
                type="text"
                disabled
                value="SSC (10th)"
                name="qualificationLevel"
              />
            </div>
          )}

          {/* HSC */}
          {form.levelGroup === "Class 11–12 (HSC)" && (
            <>
              <div>
                <label className="required">Select Standard</label>
                <select
                  name="qualificationLevel"
                  value={form.qualificationLevel}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="11th Standard">11th Standard</option>
                  <option value="12th Standard">12th Standard</option>
                </select>
              </div>

              <div>
                <label className="required">Stream</label>
                <select
                  name="stream"
                  value={form.stream}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
            </>
          )}

          {/* Diploma / UG / PG */}
          {["Diploma", "Undergraduate (UG)", "Postgraduate (PG)"].includes(
            form.levelGroup
          ) && (
            <>
              <div>
                <label className="required">Course Name</label>
                <input
                  type="text"
                  name="course"
                  placeholder="Ex: Mechanical Engg, B.Com, B.Sc IT"
                  value={form.course}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Qualification Level</label>
                <input
                  type="text"
                  name="qualificationLevel"
                  disabled
                  value={form.levelGroup}
                />
              </div>
            </>
          )}

          {/* COMMON FIELDS BELOW ↓↓↓ */}

          {/* SCHOOL / INSTITUTE LABEL BASED ON CATEGORY */}

          {/* STATE */}
          <div>
            <label className="required">
              {["Class 6–10", "SSC (10th)"].includes(form.levelGroup)
                ? "School State"
                : "Institute State"}
            </label>

            <select
              name="instituteState"
              value={form.instituteState}
              onChange={(e) => {
                const state = e.target.value;

                setForm({
                  ...form,
                  instituteState: state,
                  instituteDistrict: "",
                  instituteTaluka: "",
                });
              }}
            >
              <option value="">--Select State--</option>
              <option>Maharashtra</option>
              <option>Gujarat</option>
              <option>Karnataka</option>
              <option>Madhya Pradesh</option>
              <option>Uttar Pradesh</option>
              <option>Bihar</option>
              <option>Rajasthan</option>
              <option>Delhi</option>
              <option>Goa</option>
              <option>Telangana</option>
              <option>Tamil Nadu</option>
              <option>Kerala</option>
              <option>West Bengal</option>
              <option>Punjab</option>
              <option>Haryana</option>
              <option>Jharkhand</option>
              <option>Odisha</option>
            </select>
          </div>

          {/* DISTRICT */}
          <div>
            <label>
              {["Class 6–10", "SSC (10th)"].includes(form.levelGroup)
                ? "School District"
                : "Institute District"}
            </label>

            <select
              name="instituteDistrict"
              value={form.instituteDistrict}
              onChange={(e) => {
                const d = e.target.value;
                setForm({
                  ...form,
                  instituteDistrict: d,
                  instituteTaluka: "",
                });
              }}
              disabled={form.instituteState !== "Maharashtra"}
            >
              {form.instituteState !== "Maharashtra" ? (
                <option value="NA">Not Applicable</option>
              ) : (
                <>
                  <option value="">--Select District--</option>
                  {Object.keys(locationData.Maharashtra).map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* TALUKA */}
          <div>
            <label>
              {["Class 6–10", "SSC (10th)"].includes(form.levelGroup)
                ? "School Taluka"
                : "Institute Taluka"}
            </label>

            <select
              name="instituteTaluka"
              value={form.instituteTaluka}
              onChange={handleChange}
              disabled={
                form.instituteState !== "Maharashtra" || !form.instituteDistrict
              }
            >
              {form.instituteState !== "Maharashtra" ? (
                <option value="NA">Not Applicable</option>
              ) : (
                <>
                  <option value="">--Select Taluka--</option>
                  {form.instituteDistrict &&
                    locationData.Maharashtra[form.instituteDistrict].map(
                      (taluka) => (
                        <option key={taluka} value={taluka}>
                          {taluka}
                        </option>
                      )
                    )}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="required">
              {["Class 6–10", "SSC (10th)"].includes(form.levelGroup)
                ? "School Name"
                : "Institute/College Name"}
            </label>
            <input
              type="text"
              name="collegeName"
              value={form.collegeName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Board / University</label>
            <input
              type="text"
              name="boardUniversity"
              placeholder="Ex: Maharashtra State Board"
              value={form.boardUniversity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Admission Year</label>
            <input
              type="text"
              name="admissionYear"
              placeholder="Ex: 2022"
              maxLength={4}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/\D/g, ""))
              }
              value={form.admissionYear}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Passing Year</label>
            <input
              type="text"
              name="passingYear"
              placeholder="Ex: 2023"
              maxLength={4}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/\D/g, ""))
              }
              value={form.passingYear}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="required">Result</label>
            <select name="result" value={form.result} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Passed">Passed</option>
              <option value="Promoted">Promoted</option>
              <option value="Failed">Failed</option>
              <option value="Dropout">Dropout</option>
            </select>
          </div>

          <div>
            <label className="required">Percentage / CGPA</label>
            <input
              type="text"
              name="percentage"
              placeholder="Ex: 85.50"
              maxLength={6}
              value={form.percentage}
              onChange={(e) => {
                let v = e.target.value;

                // allow only digits + decimal
                v = v.replace(/[^0-9.]/g, "");

                // allow only one decimal point
                if ((v.match(/\./g) || []).length > 1) return;

                // restrict to 0–100
                if (parseFloat(v) > 100) v = "100";

                setForm((prev) => ({ ...prev, percentage: v }));
              }}
            />
          </div>

          <div className="full-row">
            <label className="required">Upload Last Year Marksheet</label>

            <div className="file-row">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="marksheetFile"
                  name="marksheet"
                  className="file-hidden-input"
                  accept=".jpg,.jpeg,.pdf"
                  onChange={handleFile}
                />

                <label htmlFor="marksheetFile" className="file-choose-btn">
                  Choose File
                </label>

                <div className="file-name-text">
                  {form.marksheet instanceof File
                    ? form.marksheet.name
                    : form.marksheet
                    ? form.marksheet
                    : "No file chosen"}
                </div>
              </div>

              {form.marksheet && (
                <button
                  type="button"
                  className="view-doc-btn"
                  onClick={() =>
                    form.marksheet instanceof File
                      ? window.open(
                          URL.createObjectURL(form.marksheet),
                          "_blank"
                        )
                      : window.open(form.marksheet, "_blank")
                  }
                >
                  <FaEye /> View
                </button>
              )}
            </div>

           <p className="file-note">
  Upload PDF, JPG or PNG (Max 2MB)
</p>
          </div>
        </div>

        {/* GAP */}
        <div style={{ marginTop: 20 }}>
          <label className="required">Did you have any Gap in your Education?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={form.gap === "Yes"}
                onChange={() => handleRadio("Yes")}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                checked={form.gap === "No"}
                onChange={() => handleRadio("No")}
              />{" "}
              No
            </label>
          </div>
        </div>

        {form.gap === "Yes" && (
          <div className="form-grid" style={{ marginTop: 15 }}>
            {/* GAP YEARS */}
            <div>
              <label>Gap Years</label>
              <input
                type="number"
                name="gapYears"
                value={form.gapYears || ""}
                onChange={handleChange}
              />
            </div>

            {/* GAP CERTIFICATE */}
            <div>
              <label className="required">Upload Gap Certificate</label>

              <div className="file-row">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="gapCertificate"
                    name="gapCertificate"
                    className="file-hidden-input"
                    accept=".jpg,.jpeg,.pdf"
                    onChange={handleFile}
                  />

                  <label htmlFor="gapCertificate" className="file-choose-btn">
                    Choose File
                  </label>

                  <div className="file-name-text">
                    {form.gapCertificate instanceof File
                      ? form.gapCertificate.name
                      : form.gapCertificate
                      ? form.gapCertificate
                      : "No file chosen"}
                  </div>
                </div>

                {form.gapCertificate && (
                  <button
                    type="button"
                    className="view-doc-btn"
                    onClick={() =>
                      form.gapCertificate instanceof File
                        ? window.open(
                            URL.createObjectURL(form.gapCertificate),
                            "_blank"
                          )
                        : window.open(form.gapCertificate, "_blank")
                    }
                  >
                    <FaEye /> View
                  </button>
                )}
              </div>

              <p className="file-note">
  Upload PDF, JPG or PNG (Max 2MB)
</p>
            </div>
          </div>
        )}

        <div className="button-row">
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
          <button
            className="btn-reset"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------------- HOSTEL INFO ---------------------- */

function HostelInfo({ initialData, onDataChange }) {
  
const initialForm = {
  category: "",
  hostelType: "",
  hostelName: "",
  state: "Maharashtra",
  district: "",
  taluka: "",
  address: "",
  admissionDate: "",
  messAvailable: "",
};

const [form, setForm] = useState(initialForm);
const [records, setRecords] = useState([]);
const [editId, setEditId] = useState(null);

useEffect(() => {
  if (initialData?.records?.length > 0) {
    setRecords(initialData.records);

    const first = initialData.records[0];
    if (first) {
      setForm(first);
      setEditId(first.id);
    }
  }
}, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setCategory = (value) => {
    setForm((prev) => ({ ...prev, category: value }));
  };

  const saveHostel = async () => {
    // 🔴 Category mandatory
    if (!form.category) {
      alert("Please select Beneficiary Category.");
      return;
    }

    // 🔴 If Hosteller → all hostel fields mandatory
    if (form.category === "Hosteller") {
      const requiredFields = [
        "hostelType",
        "hostelName",
        "address",
        "admissionDate",
        "messAvailable",
      ];

      for (let f of requiredFields) {
        if (!form[f] || form[f].toString().trim() === "") {
          alert("Please fill all mandatory Hostel details.");
          return;
        }
      }
    }

    // ⬇️ KEEP YOUR EXISTING PAYLOAD LOGIC (copied from old function)
    let payload = {};

    if (form.category === "Day Scholar") {
      payload = {
        id: editId || Date.now(),
        category: "Day Scholar",
        hostelType: "NA",
        hostelName: "NA",
        state: "NA",
        district: "NA",
        taluka: "NA",
        address: "NA",
        admissionDate: "NA",
        messAvailable: "NA",
      };
    } else {
      payload = { id: editId || Date.now(), ...form };
    }

    const newRecords = editId
      ? records.map((r) => (r.id === editId ? payload : r))
      : [...records, payload];

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API}/api/student/profile/save-section`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "hostelRecords",
          data: { records: newRecords },
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      setRecords(data.profile.hostelRecords.records);

      if (typeof onDataChange === "function") {
        onDataChange(data.profile.hostelRecords);
      }

      setForm(initialForm);
      setEditId(null);

      alert("Hostel Details Saved!");
    } else {
      alert(data.message || "Save failed");
    }
  };

  const editRecord = (rec) => {
    setForm(rec);
    setEditId(rec.id);
  };

  const reset = () => {
    setForm(initialForm);
    setEditId(null);
  };

  return (
    <>
      <div className="section-title">
  Hostel Details
</div>

<div className="warning-box red">
  If not staying in a Government/Private Hostel or PG, select Day Scholar.
</div>

      <div className="section-subtitle">
  <div className="section-subtitle">
  Beneficiary Category
</div>
</div>
      <div className="radio-group">
        <label>
  <input
    type="radio"
    checked={form.category === "Hosteller"}
    onChange={() => setCategory("Hosteller")}
  />{" "}
  Hosteller
</label>

        <label>
  <input
    type="radio"
    checked={form.category === "Day Scholar"}
    onChange={() => setCategory("Day Scholar")}
  />{" "}
  Day Scholar
</label>
      </div>

      {form.category === "Hosteller" && (
        <div className="section-box">
          <div className="form-grid">
            <div>
              <label className="required">Hostel Type</label>
              <select
                name="hostelType"
                value={form.hostelType}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Government Hostel">
  Government Hostel
</option>

<option value="Private Hostel">
  Private Hostel
</option>

<option value="PG">
  PG
</option>

<option value="Rented House">
  Rented House
</option>
                <option value="Private Hostel">Private Hostel</option>
                <option value="PG">PG</option>
                <option value="Rented House">Rented House</option>
              </select>
            </div>

            <div>
              <label className="required">Hostel Name</label>
              <input
                type="text"
                name="hostelName"
                value={form.hostelName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>District</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Mumbai City">
  Mumbai City
</option>

<option value="Mumbai Suburban">
  Mumbai Suburban
</option>
              </select>
            </div>

            <div>
              <label>Taluka</label>
              <select name="taluka" value={form.taluka} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Mumbai City">
  Mumbai City
</option>

<option value="Mumbai Suburban">
  Mumbai Suburban
</option>
              </select>
            </div>

            <div className="full-row">
              <label className="required">Address</label>
              <textarea
                rows={3}
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="required">Admission Date</label>
              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="required">Mess Available?</label>
              <select
  name="messAvailable"
  value={form.messAvailable}
  onChange={handleChange}
>
  <option value="">Select</option>
  <option value="Yes">Yes</option>
<option value="No">No</option>
</select>
            </div>
          </div>
        </div>
      )}

      <div className="button-row">
        <button className="btn-save" onClick={saveHostel}>
          Save
        </button>
        <button className="btn-reset" onClick={reset}>
          Reset
        </button>
      </div>
    </>
  );
}
