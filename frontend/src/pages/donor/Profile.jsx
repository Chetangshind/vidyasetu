import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiX,
  FiCheckCircle,
  FiBriefcase,
} from "react-icons/fi";
import "./Profile.css";
import API from "../../api";

// ====================== ORG TYPE OPTIONS ======================
const ORG_TYPES = [
  { value: "Self / Independent", label: "👤 Self / Independent" },
  { value: "Trust", label: "🏛️ Trust" },
  { value: "NGO", label: "🤝 NGO (Non-Governmental Organization)" },
  { value: "Foundation", label: "🌱 Foundation" },
  { value: "Charitable Society", label: "🏘️ Charitable Society" },
  { value: "Corporate CSR", label: "🏢 Corporate CSR" },
  { value: "Religious Institution", label: "🕌 Religious Institution" },
  { value: "Educational Institution", label: "🎓 Educational Institution" },
  { value: "Government Body", label: "🏛️ Government Body" },
  { value: "Club / Association", label: "👥 Club / Association" },
  { value: "Other", label: "➕ Other" },
];

// Helper: parse stored "Peace Trust" → { type: "Trust", name: "Peace" }
function parseOrg(raw) {
  if (!raw || raw === "Self / Independent") {
    return { type: "Self / Independent", name: "" };
  }
  for (const opt of ORG_TYPES) {
    if (opt.value === "Self / Independent") continue;
    if (raw.endsWith(opt.value)) {
      const name = raw.slice(0, raw.length - opt.value.length).trim();
      return { type: opt.value, name };
    }
  }
  return { type: "Other", name: raw };
}

// Helper: combine → "Peace Trust"
function combineOrg(type, name) {
  if (!type || type === "Self / Independent") return "Self / Independent";
  const trimmed = name?.trim();
  if (!trimmed) return type;
  return `${trimmed} ${type}`;
}

// ====================== MODAL INPUT ======================
function ModalInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}) {
  return (
    <div className="modal-field">
      <label className={required ? "required-label" : ""}>
        {label} {required && <span className="required-asterisk">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className={error ? "error-input" : ""}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// ====================== ORG FIELD COMPONENT ======================
function OrgField({ orgType, orgName, onTypeChange, onNameChange, error }) {
  const isSelf = orgType === "Self / Independent";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Type Dropdown */}
      <div>
        <label
          className="required-label"
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Organization Type <span className="required-asterisk">*</span>
        </label>
        <div style={{ position: "relative" }}>
          <FiBriefcase
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6B7280",
              fontSize: 15,
              pointerEvents: "none",
            }}
          />
          <select
            value={orgType}
            onChange={(e) => onTypeChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              border: "1.5px solid #D1D5DB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#111827",
              background: "white",
              cursor: "pointer",
              appearance: "none",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgb(0,95,153)")}
            onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
          >
            {ORG_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#6B7280",
              fontSize: 12,
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Name Input — hidden for Self/Independent */}
      {!isSelf && (
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            {orgType} Name
          </label>
          <input
            type="text"
            value={orgName || ""}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={`e.g. Peace Charitable ${orgType}`}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #D1D5DB",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#111827",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgb(0,95,153)")}
            onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
          />

          {/* Preview badge */}
          {orgName?.trim() && (
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, #E1F5FE, #B3E5FC)",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: 13,
                color: "#0A2A43",
              }}
            >
              <span style={{ fontSize: 15 }}>🏷️</span>
              <strong>{combineOrg(orgType, orgName)}</strong>
            </div>
          )}
        </div>
      )}

      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// ====================== MAIN PROFILE COMPONENT ======================
export default function Profile() {
  const navigate = useNavigate();
  const fetchedOnce = useRef(false);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    occupation: "",
    organization: "Self / Independent",
    helped: 0,
    aadhaar: "",
    pan: "",
    documents: [],
  });

  // Org split state
  const [orgType, setOrgType] = useState("Self / Independent");
  const [orgName, setOrgName] = useState("");

  const [errors, setErrors] = useState({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [media, setMedia] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [modalForm, setModalForm] = useState(null);
  const [modalOrgType, setModalOrgType] = useState("Self / Independent");
  const [modalOrgName, setModalOrgName] = useState("");

  // ====================== PROFILE COMPLETION CHECK ======================
  const checkProfileComplete = (data, shouldScroll = false) => {
    const newErrors = {};
    if (!data.fullName?.trim()) newErrors.fullName = "Full Name is required";
    if (!data.phone || !/^\d{10}$/.test(data.phone))
      newErrors.phone = "Phone must be exactly 10 digits";
    if (!data.dob) newErrors.dob = "Date of Birth is required";
    if (!data.gender) newErrors.gender = "Gender is required";
    if (!data.occupation?.trim())
      newErrors.occupation = "Occupation is required";
    if (!data.city?.trim()) newErrors.city = "City is required";
    if (!data.state?.trim()) newErrors.state = "State is required";
    if (!data.country?.trim()) newErrors.country = "Country is required";
    if (!data.aadhaar || !/^\d{12}$/.test(data.aadhaar))
      newErrors.aadhaar = "Aadhaar must be 12 digits";
    if (!data.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan))
      newErrors.pan = "Invalid PAN format (ABCDE1234F)";

    setErrors(newErrors);
    const complete = Object.keys(newErrors).length === 0;
    setIsProfileComplete(complete);

    if (shouldScroll && !complete) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
    return complete;
  };

  const isFieldValid = (field) => !!profile[field] && !errors[field];

  // ====================== FETCH PROFILE ======================
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API}/api/donor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          const profileData = {
            ...res.data,
            dob: res.data.dob ? res.data.dob.split("T")[0] : "",
          };
          setProfile(profileData);

          // Parse org
          const parsed = parseOrg(profileData.organization);
          setOrgType(parsed.type);
          setOrgName(parsed.name);

          const complete = checkProfileComplete(profileData);
          localStorage.setItem(
            "donorProfileComplete",
            complete ? "true" : "false",
          );
        }
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    checkProfileComplete(profile);
  }, [profile]);

  // ====================== SAVE ======================
  const saveProfile = async (data) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not logged in");
        return false;
      }
      const payload = {
        ...data,
        location: `${data.city || ""}, ${data.state || ""}, ${data.country || ""}`,
        profileComplete: checkProfileComplete(data),
      };
      await axios.post(`${API}/api/donor/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data);
      const complete = checkProfileComplete(data);
      localStorage.setItem("donorProfileComplete", complete ? "true" : "false");
      alert("✅ Profile saved successfully!");
      return true;
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save profile");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (e) => {
    e.preventDefault();
    // Merge current org combo into profile
    const combined = combineOrg(orgType, orgName);
    const updatedProfile = { ...profile, organization: combined };
    checkProfileComplete(updatedProfile, true);
    await saveProfile(updatedProfile);
  };

  const handleInlineChange = (e) => {
    const { name, value } = e.target;
    let updatedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    const updatedProfile = { ...profile, [name]: updatedValue };
    setProfile(updatedProfile);
    checkProfileComplete(updatedProfile);
  };

  // Org type/name change handlers (inline)
  const handleOrgTypeChange = (val) => {
    setOrgType(val);
    const combined = combineOrg(val, orgName);
    setProfile((prev) => ({ ...prev, organization: combined }));
  };
  const handleOrgNameChange = (val) => {
    setOrgName(val);
    const combined = combineOrg(orgType, val);
    setProfile((prev) => ({ ...prev, organization: combined }));
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(URL.createObjectURL(file));
  };

  const handleMediaUpload = (e) => {
    const files = [...e.target.files];
    const items = files.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.includes("video") ? "video" : "image",
    }));
    setMedia((prev) => [...prev, ...items]);
  };

  const openModal = (sec) => {
    const parsed = parseOrg(profile.organization);
    setModalOrgType(parsed.type);
    setModalOrgName(parsed.name);
    setModalForm({
      ...profile,
      documents: profile.documents ? [...profile.documents] : [],
    });
    setEditSection(sec);
  };
  const closeModal = () => {
    setEditSection(null);
    setModalForm(null);
  };
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalForm((prev) => ({ ...prev, [name]: value }));
  };

  const addDocument = () =>
    setModalForm((prev) => ({
      ...prev,
      documents: [
        ...(prev.documents || []),
        { name: "", number: "", owner: "" },
      ],
    }));
  const removeDocument = (i) =>
    setModalForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, idx) => idx !== i),
    }));
  const updateDocField = (i, field, value) => {
    const docs = [...(modalForm.documents || [])];
    docs[i][field] = value;
    setModalForm((prev) => ({ ...prev, documents: docs }));
  };

  const handleModalSave = async () => {
    if (!modalForm) return;
    const combined = combineOrg(modalOrgType, modalOrgName);
    const mergedData = { ...profile, ...modalForm, organization: combined };
    checkProfileComplete(mergedData, true);
    const saved = await saveProfile(mergedData);
    if (saved) {
      setOrgType(modalOrgType);
      setOrgName(modalOrgName);
      setProfile(mergedData);
      closeModal();
    }
  };

  const handleCreateScheme = () => {
    if (!isProfileComplete) {
      alert("⚠️ Please complete your profile first!");
      return;
    }
    navigate("/donor/create-scheme");
  };

  // ====================== RENDER ======================
  return (
    <div className="profile-page">
      <h2 className="scheme-title">Donor Portal</h2>

      <div
        className={`profile-completion-banner ${isProfileComplete ? "complete" : "incomplete"}`}
      >
        <div className="status-icon">
          {isProfileComplete ? <FiCheckCircle /> : "⚠️"}
        </div>
        <div>
          <strong>
            {isProfileComplete
              ? "All mandatory information filled! Click save to continue."
              : "Complete all the Profile mandatory(*) fields to continue saving"}
          </strong>
          <br />
          <small>
            {isProfileComplete
              ? "You can now create scholarship schemes"
              : "Fill all fields marked * to create schemes"}
          </small>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-top-grid">
          {/* LEFT PROFILE CARD */}
          <div className="profile-summary-card profile-card">
            <div className="profile-avatar">
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
              ) : (
                <span style={{ fontSize: 40, fontWeight: 700 }}>
                  {profile.fullName?.charAt(0)?.toUpperCase() || "D"}
                </span>
              )}
            </div>
            <label className="upload-btn">
              Change Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleProfilePicUpload}
              />
            </label>
            <h3 className="profile-name">{profile.fullName || "A. D."}</h3>
            <p className="profile-tagline">
              Donor • {profile.organization || "Self / Independent"}
            </p>
            <div className="profile-summary-row">
              <FiMail /> {profile.email || "a.d@example.com"}
            </div>
            <div className="profile-summary-row">
              <FiPhone /> {profile.phone || "—"}
            </div>
            <div className="profile-summary-row">
              <FiMapPin /> {profile.city || "—"}, {profile.state || "—"},{" "}
              {profile.country || "—"}
            </div>
            <div className="help-box">
              🎉 Helped {profile.helped || 0} Students
            </div>
          </div>

          {/* QUICK EDIT */}
          <form
            className="profile-quick-edit profile-card"
            onSubmit={handleInlineSave}
          >
            <div className="profile-section-header">
              <h2>Quick Edit</h2>
            </div>
            <div className="profile-grid-2">
              <div>
                <label className="required-label">
                  Full Name <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <FiUser />
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInlineChange}
                    className={
                      errors.fullName
                        ? "error-input"
                        : isFieldValid("fullName")
                          ? "success-input"
                          : ""
                    }
                  />
                  {isFieldValid("fullName") && (
                    <FiCheckCircle className="input-success-icon" />
                  )}
                </div>
                {errors.fullName && (
                  <span className="error-text">{errors.fullName}</span>
                )}
              </div>

              <div>
                <label>Email</label>
                <div className="input-with-icon">
                  <FiMail />
                  <input type="email" value={profile.email} disabled />
                </div>
              </div>

              <div>
                <label className="required-label">
                  Phone <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <FiPhone />
                  <input
                    name="phone"
                    value={profile.phone}
                    maxLength={10}
                    onChange={handleInlineChange}
                    className={
                      errors.phone
                        ? "error-input"
                        : isFieldValid("phone")
                          ? "success-input"
                          : ""
                    }
                  />
                  {isFieldValid("phone") && (
                    <FiCheckCircle className="input-success-icon" />
                  )}
                </div>
                {errors.phone && (
                  <span className="error-text">{errors.phone}</span>
                )}
              </div>

              <div>
                <label className="required-label">
                  Date of Birth <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <FiCalendar />
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={handleInlineChange}
                    className={
                      errors.dob
                        ? "error-input"
                        : isFieldValid("dob")
                          ? "success-input"
                          : ""
                    }
                  />
                  {isFieldValid("dob") && (
                    <FiCheckCircle className="input-success-icon" />
                  )}
                </div>
                {errors.dob && <span className="error-text">{errors.dob}</span>}
              </div>

              <div>
                <label className="required-label">
                  Gender <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <FiUser />
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInlineChange}
                    className={
                      errors.gender
                        ? "error-input"
                        : isFieldValid("gender")
                          ? "success-input"
                          : ""
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {isFieldValid("gender") && (
                    <FiCheckCircle className="input-success-icon" />
                  )}
                </div>
                {errors.gender && (
                  <span className="error-text">{errors.gender}</span>
                )}
              </div>
            </div>
            <div className="quick-edit-footer">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* BOTTOM GRID */}
        <div className="profile-bottom-grid">
          {/* IDENTITY DOCUMENTS */}
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Identity Documents</h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="required-label">
                Aadhaar <span className="required-asterisk">*</span>
              </label>
              <div className="input-with-icon">
                <FiUser />
                <input
                  name="aadhaar"
                  value={profile.aadhaar}
                  maxLength={12}
                  onChange={handleInlineChange}
                  className={
                    errors.aadhaar
                      ? "error-input"
                      : isFieldValid("aadhaar")
                        ? "success-input"
                        : ""
                  }
                />
                {isFieldValid("aadhaar") && (
                  <FiCheckCircle className="input-success-icon" />
                )}
              </div>
              {errors.aadhaar && (
                <span className="error-text">{errors.aadhaar}</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="required-label">
                PAN <span className="required-asterisk">*</span>
              </label>
              <div className="input-with-icon">
                <FiUser />
                <input
                  name="pan"
                  value={profile.pan}
                  maxLength={10}
                  onChange={handleInlineChange}
                  className={
                    errors.pan
                      ? "error-input"
                      : isFieldValid("pan")
                        ? "success-input"
                        : ""
                  }
                />
                {isFieldValid("pan") && (
                  <FiCheckCircle className="input-success-icon" />
                )}
              </div>
              {errors.pan && <span className="error-text">{errors.pan}</span>}
            </div>

            {profile.documents && profile.documents.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 10 }}>Additional Documents</h4>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f0f4ff" }}>
                      {["Document", "Number", "Owner"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            border: "1px solid #dde3f0",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.documents.map((doc, i) => (
                      <tr
                        key={i}
                        style={{ background: i % 2 === 0 ? "#fff" : "#f8faff" }}
                      >
                        {["name", "number", "owner"].map((f) => (
                          <td
                            key={f}
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #dde3f0",
                            }}
                          >
                            {doc[f] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* PERSONAL DETAILS */}
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Personal Details</h3>
              <button
                onClick={() => openModal("personal")}
                className="profile-icon-btn"
              >
                <FiEdit2 /> Edit
              </button>
            </div>
            <div className="profile-details-grid">
              <p>
                <b>Gender:</b> {profile.gender || "Not set"}
              </p>
              <p>
                <b>DOB:</b>{" "}
                {profile.dob
                  ? new Date(profile.dob).toLocaleDateString()
                  : "Not set"}
              </p>
              <p>
                <b>Occupation:</b> {profile.occupation || "Not set"}
              </p>
            </div>
          </section>

          {/* CONTACT DETAILS */}
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Contact Details</h3>
              <button
                onClick={() => openModal("contact")}
                className="profile-icon-btn"
              >
                <FiEdit2 /> Edit
              </button>
            </div>
            <div className="profile-details-grid">
              <p>
                <b>Phone:</b> {profile.phone || "Not set"}
              </p>
              <p>
                <b>City:</b> {profile.city || "Not set"}
              </p>
              <p>
                <b>State:</b> {profile.state || "Not set"}
              </p>
              <p>
                <b>Country:</b> {profile.country || "Not set"}
              </p>
            </div>
          </section>

          {/* ORGANIZATION & DOCUMENTS — NOW WITH ORG FIELD */}
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Organization & Documents</h3>
              <button
                onClick={() => openModal("documents")}
                className="profile-icon-btn"
              >
                <FiEdit2 /> Edit
              </button>
            </div>

            {/* Inline org field */}
            <div style={{ marginTop: 16 }}>
              <OrgField
                orgType={orgType}
                orgName={orgName}
                onTypeChange={handleOrgTypeChange}
                onNameChange={handleOrgNameChange}
              />
            </div>

            <p style={{ marginTop: 12, fontSize: 13, color: "#6B7280" }}>
              Saved as:{" "}
              <strong style={{ color: "#0A2A43" }}>
                {profile.organization || "Self / Independent"}
              </strong>
            </p>
          </section>
        </div>
      </div>

      {/* CREATE SCHEME BUTTON */}
      <div className="create-scheme-section">
        <button
          className={`create-scheme-btn ${isProfileComplete ? "enabled" : "disabled"}`}
          onClick={handleCreateScheme}
          disabled={!isProfileComplete}
        >
          {isProfileComplete
            ? "🚀 Create Scholarship Scheme"
            : "🔒 Complete Profile First"}
        </button>
      </div>

      {/* ====================== MODALS ====================== */}

      {/* DOCUMENTS MODAL */}
      {editSection === "documents" && modalForm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Organization & Documents</h3>
              <button onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {/* ORG FIELD IN MODAL */}
              <div className="modal-field">
                <OrgField
                  orgType={modalOrgType}
                  orgName={modalOrgName}
                  onTypeChange={setModalOrgType}
                  onNameChange={setModalOrgName}
                />
              </div>

              <ModalInput
                label="Aadhaar"
                name="aadhaar"
                value={modalForm.aadhaar}
                onChange={handleModalChange}
                required
                error={errors.aadhaar}
              />
              <ModalInput
                label="PAN"
                name="pan"
                value={modalForm.pan}
                onChange={handleModalChange}
                required
                error={errors.pan}
              />

              <h4 style={{ marginTop: 15 }}>Additional Documents</h4>
              {modalForm.documents?.map((doc, i) => (
                <div className="document-row" key={i}>
                  <input
                    placeholder="Document Name"
                    value={doc.name}
                    onChange={(e) => updateDocField(i, "name", e.target.value)}
                  />
                  <input
                    placeholder="Document Number"
                    value={doc.number}
                    onChange={(e) =>
                      updateDocField(i, "number", e.target.value)
                    }
                  />
                  <input
                    placeholder="Owner"
                    value={doc.owner}
                    onChange={(e) => updateDocField(i, "owner", e.target.value)}
                  />
                  <span
                    className="document-remove-btn"
                    onClick={() => removeDocument(i)}
                  >
                    Remove
                  </span>
                </div>
              ))}
              <button
                type="button"
                className="add-doc-btn"
                onClick={addDocument}
              >
                + Add Document
              </button>
            </div>
            <button
              className="save-modal-btn"
              onClick={handleModalSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* PERSONAL DETAILS MODAL */}
      {editSection === "personal" && modalForm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Personal Details</h3>
              <button onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <ModalInput
                label="Gender"
                name="gender"
                value={modalForm.gender}
                onChange={handleModalChange}
                error={errors.gender}
              />
              <ModalInput
                label="Date of Birth"
                name="dob"
                type="date"
                value={modalForm.dob}
                onChange={handleModalChange}
                error={errors.dob}
              />
              <ModalInput
                label="Occupation"
                name="occupation"
                value={modalForm.occupation}
                onChange={handleModalChange}
                error={errors.occupation}
              />
            </div>
            <button
              className="save-modal-btn"
              onClick={handleModalSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* CONTACT DETAILS MODAL */}
      {editSection === "contact" && modalForm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Contact Details</h3>
              <button onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <ModalInput
                label="Phone"
                name="phone"
                value={modalForm.phone}
                onChange={handleModalChange}
                error={errors.phone}
              />
              <ModalInput
                label="City"
                name="city"
                value={modalForm.city}
                onChange={handleModalChange}
                error={errors.city}
              />
              <ModalInput
                label="State"
                name="state"
                value={modalForm.state}
                onChange={handleModalChange}
                error={errors.state}
              />
              <ModalInput
                label="Country"
                name="country"
                value={modalForm.country}
                onChange={handleModalChange}
                error={errors.country}
              />
            </div>
            <button
              className="save-modal-btn"
              onClick={handleModalSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* MEDIA SECTION */}
      <div className="media-section">
        <div className="media-header">
          <h3>Helping Activity • Photos / Videos (Optional)</h3>
          <label className="media-btn">
            + Upload Media
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              hidden
              onChange={handleMediaUpload}
            />
          </label>
        </div>
        <div className="media-grid">
          {media.length === 0 && <p>No Content Uploaded</p>}
          {media.map((m, i) =>
            m.type === "image" ? (
              <img key={i} src={m.url} className="media-box" />
            ) : (
              <video key={i} src={m.url} className="media-box" controls />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
