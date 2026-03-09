import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CreateScheme.css";
import axios from "axios";

// ====================== NUMBER TO INDIAN WORDS ======================
function toIndianWords(num) {
  const n = parseInt(num);
  if (!n || isNaN(n)) return "";

  const ones = [
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
  const tens = [
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

  function words(x) {
    if (x < 20) return ones[x];
    if (x < 100)
      return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    return (
      ones[Math.floor(x / 100)] +
      " Hundred" +
      (x % 100 ? " " + words(x % 100) : "")
    );
  }

  let result = "";
  let rem = n;
  if (rem >= 10000000) {
    result += words(Math.floor(rem / 10000000)) + " Crore ";
    rem %= 10000000;
  }
  if (rem >= 100000) {
    result += words(Math.floor(rem / 100000)) + " Lakh ";
    rem %= 100000;
  }
  if (rem >= 1000) {
    result += words(Math.floor(rem / 1000)) + " Thousand ";
    rem %= 1000;
  }
  if (rem > 0) result += words(rem);
  return result.trim() + " Rupees";
}

function toShorthand(num) {
  const n = parseInt(num);
  if (!n) return "";
  if (n >= 10000000) return `${+(n / 10000000).toFixed(1)} Crore`;
  if (n >= 100000) return `${+(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000) return `${+(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatINR(num) {
  const n = parseInt(num);
  if (!n) return "";
  return n.toLocaleString("en-IN");
}

// ====================== PRESET OPTIONS ======================
const INCOME_PRESETS = [
  { value: "50000", label: "Below ₹50,000 / year" },
  { value: "100000", label: "Below ₹1,00,000 / year" },
  { value: "150000", label: "Below ₹1,50,000 / year" },
  { value: "200000", label: "Below ₹2,00,000 / year" },
  { value: "250000", label: "Below ₹2,50,000 / year" },
  { value: "300000", label: "Below ₹3,00,000 / year" },
  { value: "500000", label: "Below ₹5,00,000 / year" },
  { value: "800000", label: "Below ₹8,00,000 / year" },
  { value: "1000000", label: "Below ₹10,00,000 / year" },
  { value: "0", label: "No Income Limit" },
];

const AGE_PRESETS = [
  { value: "Below 10", label: "Below 10 years" },
  { value: "10–14", label: "10 – 14 years" },
  { value: "14–18", label: "14 – 18 years" },
  { value: "18–21", label: "18 – 21 years" },
  { value: "18–25", label: "18 – 25 years" },
  { value: "21–30", label: "21 – 30 years" },
  { value: "25–35", label: "25 – 35 years" },
  { value: "Below 18", label: "Below 18 years (Minors)" },
  { value: "Below 25", label: "Below 25 years" },
  { value: "Below 30", label: "Below 30 years" },
  { value: "No Limit", label: "No Age Limit" },
];

// ====================== CASTE STRUCTURE ======================
const CASTE_CATEGORIES = {
  "General (Open)": [],
  "OBC (Other Backward Class)": [
    "Kunbi",
    "Mali",
    "Teli",
    "Koli",
    "Dhangar",
    "Tamboli",
    "Shimpi",
    "Sonar",
    "Lohar",
    "Sutar",
    "Kumbhar",
    "Nhavi",
    "Parit",
    "Gurav",
    "Rangari",
    "Bhandari",
    "Gavli",
    "Hatkar",
  ],
  "SC (Scheduled Caste)": [
    "Mahar",
    "Mang",
    "Chambhar",
    "Bhangi",
    "Dhor",
    "Holer",
    "Matang",
    "Vane",
    "Mochi",
    "Dom",
  ],
  "ST (Scheduled Tribe)": [
    "Bhil",
    "Gond",
    "Warli",
    "Kokna",
    "Mahadeo Koli",
    "Thakar",
    "Pardhi",
    "Halba",
    "Korku",
    "Andh",
    "Banjara (Lamani)",
  ],
  "NT (Nomadic Tribe)": [
    "Banjara",
    "Berad",
    "Kaikadi",
    "Nandiwale",
    "Vaidu",
    "Kolhati",
    "Dombari",
  ],
  Minority: ["Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi"],
  "EWS (Economically Weaker Section)": [],
};

// ====================== SHARED STYLES ======================
const selectStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #D1D5DB",
  borderRadius: "8px",
  fontSize: "14px",
  background: "white",
  cursor: "pointer",
  outline: "none",
  boxSizing: "border-box",
};
const inputStyle = {
  padding: "10px 12px",
  border: "1.5px solid #D1D5DB",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};
const smallBtn = (bg) => ({
  padding: "8px 12px",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

// ====================== INCOME FIELD ======================
function IncomeField({ value, onChange }) {
  const [mode, setMode] = useState("preset");
  const [raw, setRaw] = useState("");

  useEffect(() => {
    if (!value) return;
    const isPreset = INCOME_PRESETS.some((p) => p.value === value);
    if (!isPreset) {
      setMode("custom");
      setRaw(value);
    }
  }, []);

  const handlePreset = (e) => {
    const v = e.target.value;
    if (v === "__custom__") {
      setMode("custom");
      onChange("");
      return;
    }
    onChange(v);
  };

  const handleCustom = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setRaw(digits);
    onChange(digits);
  };

  const shorthand = value && value !== "0" ? toShorthand(value) : "";
  const words = value && value !== "0" ? toIndianWords(value) : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* ── Preset dropdown ── */}
      {mode === "preset" && (
        <select value={value || ""} onChange={handlePreset} style={selectStyle}>
          <option value="">Select Income Range</option>
          {INCOME_PRESETS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          <option value="__custom__">✏️ Enter Custom Amount…</option>
        </select>
      )}

      {/* ── Custom input ── */}
      {mode === "custom" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#374151",
                  pointerEvents: "none",
                }}
              >
                ₹
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 350000"
                value={raw ? formatINR(raw) : ""}
                onChange={handleCustom}
                style={{ ...inputStyle, width: "100%", paddingLeft: 28 }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMode("preset");
                setRaw("");
                onChange("");
              }}
              style={smallBtn("#EF4444")}
            >
              ✕ Back
            </button>
          </div>

          {/* Live words preview */}
          {raw && (
            <div
              style={{
                background: "linear-gradient(135deg,#E1F5FE,#B3E5FC)",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>💰</span>
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: "#0A2A43" }}
                >
                  ₹{formatINR(raw)}
                </span>
                <span
                  style={{
                    background: "rgb(0,95,153)",
                    color: "white",
                    borderRadius: 12,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {shorthand}
                </span>
              </div>
              <div
                style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}
              >
                {words}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset preview badge */}
      {mode === "preset" && value && value !== "0" && (
        <div
          style={{
            background: "linear-gradient(135deg,#E1F5FE,#B3E5FC)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 16 }}>💰</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0A2A43" }}>
            ₹{formatINR(value)} &nbsp;·&nbsp; {shorthand}
          </span>
          <span style={{ fontSize: 12, color: "#374151", fontStyle: "italic" }}>
            — {words}
          </span>
        </div>
      )}
      {mode === "preset" && value === "0" && (
        <div style={{ fontSize: 13, color: "#6B7280", fontStyle: "italic" }}>
          No income restriction applied.
        </div>
      )}
    </div>
  );
}

// ====================== AGE FIELD ======================
function AgeField({ value, onChange }) {
  const [mode, setMode] = useState("preset");
  const [cType, setCType] = useState("between"); // between | below | above
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  useEffect(() => {
    if (!value) return;
    const isPreset = AGE_PRESETS.some((p) => p.value === value);
    if (!isPreset) {
      setMode("custom");
      if (value.startsWith("Below ")) {
        setCType("below");
        setMax(value.replace("Below ", ""));
      } else if (value.startsWith("Above ")) {
        setCType("above");
        setMin(value.replace("Above ", ""));
      } else if (value.includes("–")) {
        setCType("between");
        const [a, b] = value.split("–");
        setMin(a);
        setMax(b);
      }
    }
  }, []);

  const build = (type, a, b) => {
    if (type === "below") return b ? `Below ${b}` : "";
    if (type === "above") return a ? `Above ${a}` : "";
    return a && b ? `${a}–${b}` : "";
  };

  const changeType = (t) => {
    setCType(t);
    onChange(build(t, min, max));
  };

  const handleMin = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setMin(v);
    onChange(build(cType, v, max));
  };
  const handleMax = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setMax(v);
    onChange(build(cType, min, v));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {mode === "preset" && (
        <select
          value={value || ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__custom__") {
              setMode("custom");
              onChange("");
              return;
            }
            onChange(v);
          }}
          style={selectStyle}
        >
          <option value="">Select Age Range</option>
          {AGE_PRESETS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          <option value="__custom__">✏️ Enter Custom Age Range…</option>
        </select>
      )}

      {mode === "custom" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Type tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["between", "below", "above"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => changeType(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${cType === t ? "rgb(0,95,153)" : "#D1D5DB"}`,
                  background: cType === t ? "rgb(0,95,153)" : "white",
                  color: cType === t ? "white" : "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMode("preset");
                setMin("");
                setMax("");
                onChange("");
              }}
              style={smallBtn("#EF4444")}
            >
              ✕ Back
            </button>
          </div>

          {/* Inputs */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {cType === "between" && (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Min"
                  value={min}
                  onChange={handleMin}
                  style={{ ...inputStyle, width: 80 }}
                />
                <span style={{ color: "#6B7280", fontWeight: 700 }}>–</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Max"
                  value={max}
                  onChange={handleMax}
                  style={{ ...inputStyle, width: 80 }}
                />
                <span style={{ fontSize: 13, color: "#6B7280" }}>years</span>
              </>
            )}
            {cType === "below" && (
              <>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Below
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Age"
                  value={max}
                  onChange={handleMax}
                  style={{ ...inputStyle, width: 80 }}
                />
                <span style={{ fontSize: 13, color: "#6B7280" }}>years</span>
              </>
            )}
            {cType === "above" && (
              <>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Above
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Age"
                  value={min}
                  onChange={handleMin}
                  style={{ ...inputStyle, width: 80 }}
                />
                <span style={{ fontSize: 13, color: "#6B7280" }}>years</span>
              </>
            )}
          </div>

          {value && (
            <div
              style={{
                background: "linear-gradient(135deg,#E8F5E9,#C8E6C9)",
                borderRadius: 10,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>🎂</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1B5E20" }}>
                {value} years
              </span>
            </div>
          )}
        </div>
      )}

      {mode === "preset" && value && value !== "No Limit" && (
        <div
          style={{
            background: "linear-gradient(135deg,#E8F5E9,#C8E6C9)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>🎂</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1B5E20" }}>
            {value} years
          </span>
        </div>
      )}
    </div>
  );
}

// ====================== MAIN COMPONENT ======================
export default function CreateScheme() {
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state?.scheme ?? null;

  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);

  const [formData, setFormData] = useState({
    schemeName: "",
    incomeLimit: "",
    educationLevel: "",
    ageLimit: "",
    casteGroup: "",
    casteSubcaste: "",
    scholarshipAmount: "",
    gender: "",
    deadline: "",
    documents: [],
    documentsList: [
      "Aadhaar Card",
      "Income Certificate",
      "Caste Certificate",
      "Bank Passbook",
      "Ration Card",
    ],
    newDoc: "",
    description: "",
    extraConditions: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showDocWarning, setShowDocWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!incoming) return;
    setEditingId(incoming._id);
    const mergedDocList = Array.from(
      new Set([...formData.documentsList, ...(incoming.documents || [])]),
    );
    let casteGroup = "",
      casteSubcaste = "";
    if (incoming.category) {
      const parts = incoming.category.split(" - ");
      if (parts.length === 2) {
        casteGroup = parts[0];
        casteSubcaste = parts[1];
      } else casteGroup = incoming.category;
    }
    setFormData((p) => ({
      ...p,
      schemeName: incoming.schemeName || "",
      incomeLimit: incoming.incomeLimit || "",
      educationLevel: incoming.educationLevel || "",
      ageLimit: incoming.ageLimit || "",
      casteGroup,
      casteSubcaste,
      scholarshipAmount: incoming.scholarshipAmount || "",
      gender: incoming.gender || "",
      deadline: incoming.deadline ? incoming.deadline.split("T")[0] : "",
      documents: incoming.documents || [],
      documentsList: mergedDocList,
      description: incoming.description || "",
      extraConditions: incoming.extraConditions || "",
    }));
  }, [incoming]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5050/api/donor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          const d = res.data;
          const ok =
            d.fullName?.trim() &&
            /^\d{10}$/.test(d.phone) &&
            d.dob &&
            d.gender &&
            d.occupation?.trim() &&
            d.city?.trim() &&
            d.state?.trim() &&
            d.country?.trim() &&
            /^\d{12}$/.test(d.aadhaar) &&
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(d.pan);
          setIsProfileComplete(!!ok);
          localStorage.setItem("donorProfileComplete", ok ? "true" : "false");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProfileCheckLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddDocument = () => {
    if (!formData.newDoc.trim()) return;
    const d = formData.newDoc.trim();
    setFormData((p) => ({
      ...p,
      documentsList: [...p.documentsList, d],
      documents: [...p.documents, d],
      newDoc: "",
    }));
    setShowDocWarning(false);
  };

  const getFinalCategory = () => {
    if (!formData.casteGroup) return "";
    return formData.casteSubcaste
      ? `${formData.casteGroup} - ${formData.casteSubcaste}`
      : formData.casteGroup;
  };

  const buildPayload = (status) => ({
    schemeName: formData.schemeName,
    description: formData.description,
    scholarshipAmount: Number(formData.scholarshipAmount) || 0,
    incomeLimit: formData.incomeLimit,
    educationLevel: formData.educationLevel,
    ageLimit: formData.ageLimit,
    category: getFinalCategory(),
    gender: formData.gender,
    deadline: formData.deadline,
    documents: formData.documents,
    extraConditions: formData.extraConditions,
    status,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isProfileComplete) {
      alert("🚫 Complete your profile first!");
      navigate("/donor/profile");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      if (editingId) {
        await axios.put(
          `http://localhost:5050/api/schemes/${editingId}`,
          buildPayload("active"),
          { headers },
        );
        alert("Scheme updated successfully");
      } else {
        await axios.post(
          "http://localhost:5050/api/schemes",
          buildPayload("active"),
          { headers },
        );
        alert("Scheme created successfully");
      }
      navigate("/donor/my-schemes/active");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Error: ${err.response?.status || err.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!isProfileComplete) {
      alert("🚫 Complete your profile first!");
      navigate("/donor/profile");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5050/api/schemes/draft",
        buildPayload("draft"),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Draft saved");
      navigate("/donor/my-schemes/draft");
    } catch (err) {
      setError(err.response?.data?.message || "Draft save failed");
    } finally {
      setLoading(false);
    }
  };

  if (profileCheckLoading)
    return (
      <div
        className="scheme-form-page"
        style={{ padding: "100px 20px", textAlign: "center" }}
      >
        <div style={{ fontSize: 18, color: "#3b82f6" }}>
          🔍 Checking profile…
        </div>
      </div>
    );

  if (!isProfileComplete)
    return (
      <div className="scheme-form-page">
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
          <h2 style={{ marginBottom: 16, color: "#1f2937" }}>
            Complete Your Profile First
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            Fill all mandatory fields (*) before creating schemes.
          </p>
          <button
            onClick={() => navigate("/donor/profile")}
            style={{
              padding: "16px 32px",
              fontSize: 18,
              background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            → Go to Profile
          </button>
        </div>
      </div>
    );

  const subcasteOptions = CASTE_CATEGORIES[formData.casteGroup] || [];

  return (
    <div className="scheme-form-page">
      <h2 className="scheme-title">
        {editingId ? "Edit Scheme" : "Create Scholarship Scheme"}
      </h2>
      <div className="scheme-form-container">
        {error && (
          <div
            style={{
              padding: 12,
              background: "#fee",
              border: "1px solid #f87171",
              borderRadius: 8,
              marginBottom: 16,
              color: "#dc2626",
            }}
          >
            ❌ {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Scheme Name</label>
            <input
              type="text"
              name="schemeName"
              value={formData.schemeName}
              onChange={handleChange}
              required
            />
          </div>

          {/* INCOME */}
          <div>
            <label>Income Eligibility</label>
            <IncomeField
              value={formData.incomeLimit}
              onChange={(v) => setFormData((p) => ({ ...p, incomeLimit: v }))}
            />
          </div>

          <div>
            <label>Education Level</label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>High School</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
              <option>Any</option>
            </select>
          </div>

          {/* AGE */}
          <div>
            <label>Age Limit</label>
            <AgeField
              value={formData.ageLimit}
              onChange={(v) => setFormData((p) => ({ ...p, ageLimit: v }))}
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label>Category</label>
            <div
              className="category-input-box"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <select
                value={formData.casteGroup}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    casteGroup: e.target.value,
                    casteSubcaste: "",
                  }))
                }
                style={selectStyle}
              >
                <option value="">Select Caste / Category Group</option>
                {Object.keys(CASTE_CATEGORIES).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {subcasteOptions.length > 0 && (
                <select
                  name="casteSubcaste"
                  value={formData.casteSubcaste}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">
                    All {formData.casteGroup} (no specific sub-caste)
                  </option>
                  {subcasteOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
              {formData.casteGroup && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "linear-gradient(135deg,#E8EAF6,#C5CAE9)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: 13,
                    color: "#1a237e",
                    width: "fit-content",
                  }}
                >
                  <span>🏷️</span>
                  <strong>{getFinalCategory()}</strong>
                </div>
              )}
            </div>
          </div>

          <div>
            <label>Scholarship Amount (₹)</label>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#374151",
                  }}
                >
                  ₹
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  name="scholarshipAmount"
                  placeholder="Enter amount"
                  value={
                    formData.scholarshipAmount
                      ? formatINR(formData.scholarshipAmount)
                      : ""
                  }
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setFormData((p) => ({
                      ...p,
                      scholarshipAmount: digits,
                    }));
                  }}
                  required
                  style={{
                    ...inputStyle,
                    width: "100%",
                    paddingLeft: 28,
                  }}
                />
              </div>

              {/* Live Preview */}
              {formData.scholarshipAmount && (
                <div
                  style={{
                    background: "linear-gradient(135deg,#FFF8E1,#FFE082)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🎓</span>

                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#7C4700",
                      }}
                    >
                      ₹{formatINR(formData.scholarshipAmount)}
                    </span>

                    <span
                      style={{
                        background: "#B45309",
                        color: "white",
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {toShorthand(formData.scholarshipAmount)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#5D4037",
                      fontStyle: "italic",
                    }}
                  >
                    {toIndianWords(formData.scholarshipAmount)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label>Gender Preference</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">No Preference</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label>Application Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="full-row">
            <label>Required Documents</label>
            <div className="doc-box">
              {formData.documentsList.map((doc, i) => (
                <label key={i} className="doc-item">
                  <input
                    type="checkbox"
                    checked={formData.documents.includes(doc)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...formData.documents, doc]
                        : formData.documents.filter((d) => d !== doc);
                      setFormData((p) => ({ ...p, documents: updated }));
                    }}
                  />
                  <span>{doc}</span>
                </label>
              ))}
              <div className="add-doc-row">
                <input
                  type="text"
                  placeholder="Add extra document…"
                  value={formData.newDoc}
                  onFocus={() => setShowDocWarning(true)}
                  onBlur={() => {
                    if (!formData.newDoc.trim()) setShowDocWarning(false);
                  }}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, newDoc: e.target.value }))
                  }
                />
                <button type="button" onClick={handleAddDocument}>
                  + Add
                </button>
              </div>
              {showDocWarning && (
                <p style={{ marginTop: 10, fontSize: 13, color: "#b45309" }}>
                  ⚠️ Use full document names (e.g. "Bonafide Certificate")
                </p>
              )}
            </div>
          </div>

          <div className="full-row">
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="full-row">
            <label>Additional Conditions</label>
            <textarea
              name="extraConditions"
              rows="3"
              value={formData.extraConditions}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button
              type="button"
              className="submit-btn"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? "Saving…" : "Save Draft"}
            </button>
            <button
              type="submit"
              className="submit-btn"
              style={{ background: "#0a64bc", color: "#fff" }}
              disabled={loading}
            >
              {loading
                ? "Saving…"
                : editingId
                  ? "Save & Back"
                  : "Create Scheme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
