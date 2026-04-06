const express = require("express");
const router = express.Router();
const Scheme = require("../models/Scheme");
const Student = require("../models/Student");
const StudentProfile = require("../models/StudentProfile"); // adjust if your model name differs
const authMiddleware = require("../middlewares/authMiddleware");

/* ─────────────────────────────────────────────
   Normalize doc names for fuzzy matching
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Build uploaded-doc list from profile (mirrors
   exactly what AvailableSchemes.jsx does on the
   frontend so backend + frontend stay in sync)
───────────────────────────────────────────── */
function getUploadedDocs(profile) {
  const docs = [];
  const p = profile || {};

  if (p.personal?.aadhaar)             docs.push("Aadhaar Card");
  if (p.personal?.incomeCertificate)   docs.push("Income Certificate");
  if (p.personal?.domicileCertificate) docs.push("Domicile Certificate");
  if (p.personal?.casteCertificate)    docs.push("Caste Certificate");

  (p.personal?.otherDocuments || []).forEach((d) => {
    if (d.documentName) docs.push(d.documentName);
  });

  if (p.courseList?.marksheet)               docs.push("Last Year Marksheet");
  if (p.qualificationRecords?.marksheet)     docs.push("Past Qualification Marksheet");
  if (p.qualificationRecords?.gapCertificate) docs.push("Gap Certificate");

  return docs;
}

/* ─────────────────────────────────────────────
   Days until deadline  (negative = already closed)
───────────────────────────────────────────── */
function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* ─────────────────────────────────────────────
   CORE SCORING  — returns:
     { matchPercentage, matchedReasons, missingDocs,
       isHardIneligible, hardIneligibleReason,
       docReadiness, urgencyDays, isNew }
───────────────────────────────────────────── */
function scoreScheme(profile, scheme, uploadedDocs, studentCreatedAt) {
  const result = {
    matchPercentage: 0,
    matchedReasons: [],      // why the student IS eligible
    missingDocs: [],         // docs needed but not uploaded
    isHardIneligible: false, // true = should NOT appear in recommended tab
    hardIneligibleReason: null,
    docReadiness: "complete", // complete | partial | none
    urgencyDays: null,        // days left till deadline
    isNew: false,             // scheme added after student joined
  };

  const p = profile || {};

  // ── Extract student fields (all the paths your profile uses) ──
  const income       = p.personal?.familyIncome   ?? p.familyIncome   ?? null;
  const category     = (p.personal?.category      ?? p.category       ?? "").trim().toLowerCase();
  const gender       = (p.personal?.gender        ?? p.gender         ?? "").trim().toLowerCase();
  const religion     = (p.personal?.religion      ?? p.religion       ?? "").trim().toLowerCase();
  const state        = (p.personal?.state         ?? p.state          ?? "").trim().toLowerCase();
  const disability   = p.personal?.disability     ?? p.disability     ?? false;

  // education: try academic block first, fallback to top-level
  const eduLevel     = (p.academic?.educationLevel ?? p.educationLevel ?? "").trim().toLowerCase();
  const percentage   = p.academic?.percentage      ?? p.percentage     ?? null;
  const classGrade   = (p.academic?.class          ?? p.class          ?? "").trim().toLowerCase();

  // age from DOB
  let age = null;
  const dob = p.personal?.dob || p.dob;
  if (dob) {
    const diff = Date.now() - new Date(dob).getTime();
    age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  /* ── 1. HARD FILTERS — ineligible = hide from recommended ── */

  // Gender hard check
  if (scheme.gender && scheme.gender !== "Any" && scheme.gender !== "") {
    const schemeGender = scheme.gender.trim().toLowerCase();
    if (gender && gender !== schemeGender) {
      result.isHardIneligible = true;
      result.hardIneligibleReason = `Scheme is for ${scheme.gender} students only`;
      return result;
    }
  }

  // Category hard check (SC / ST / OBC / General etc.)
  if (scheme.category && scheme.category !== "Any" && scheme.category !== "") {
    const schemeCategory = scheme.category.trim().toLowerCase();
    if (category && category !== schemeCategory) {
      result.isHardIneligible = true;
      result.hardIneligibleReason = `Scheme is for ${scheme.category} category only`;
      return result;
    }
  }

  // Religion hard check
  if (scheme.religion && scheme.religion !== "Any" && scheme.religion !== "") {
    const schemeReligion = scheme.religion.trim().toLowerCase();
    if (religion && religion !== schemeReligion) {
      result.isHardIneligible = true;
      result.hardIneligibleReason = `Scheme is for ${scheme.religion} religion only`;
      return result;
    }
  }

  // Income hard check — student MUST be below the limit
  if (scheme.incomeLimit != null && income != null) {
    if (income > scheme.incomeLimit) {
      result.isHardIneligible = true;
      result.hardIneligibleReason = `Family income ₹${income} exceeds scheme limit ₹${scheme.incomeLimit}`;
      return result;
    }
  }

  // Age hard check
  if (scheme.ageLimit != null && age != null) {
    if (age > Number(scheme.ageLimit)) {
      result.isHardIneligible = true;
      result.hardIneligibleReason = `Age ${age} exceeds scheme limit of ${scheme.ageLimit}`;
      return result;
    }
  }

  // State hard check
  if (scheme.state && scheme.state !== "Any" && scheme.state !== "") {
    const schemeState = scheme.state.trim().toLowerCase();
    if (state && state !== schemeState) {
      result.isHardIneligible = true;
      result.hardIneligibleReason = `Scheme is only for residents of ${scheme.state}`;
      return result;
    }
  }

  /* ── 2. SOFT SCORING — build match % and reasons ── */
  // Each criterion has a weight. Passed criteria accumulate score.

  let totalWeight = 0;
  let earnedWeight = 0;

  // Income match (weight 25)
  if (scheme.incomeLimit != null) {
    totalWeight += 25;
    if (income != null && income <= scheme.incomeLimit) {
      earnedWeight += 25;
      result.matchedReasons.push(`Family income ₹${income} is within limit ₹${scheme.incomeLimit}`);
    }
  }

  // Category match (weight 20)
  if (scheme.category && scheme.category !== "Any" && scheme.category !== "") {
    totalWeight += 20;
    if (category === scheme.category.trim().toLowerCase()) {
      earnedWeight += 20;
      result.matchedReasons.push(`Category matches: ${scheme.category}`);
    }
  }

  // Gender match (weight 15)
  if (scheme.gender && scheme.gender !== "Any" && scheme.gender !== "") {
    totalWeight += 15;
    if (gender === scheme.gender.trim().toLowerCase()) {
      earnedWeight += 15;
      result.matchedReasons.push(`Gender matches: ${scheme.gender}`);
    }
  }

  // Education level match (weight 15)
  if (scheme.educationLevel && scheme.educationLevel !== "Any" && scheme.educationLevel !== "") {
    totalWeight += 15;
    if (eduLevel === scheme.educationLevel.trim().toLowerCase()) {
      earnedWeight += 15;
      result.matchedReasons.push(`Education level matches: ${scheme.educationLevel}`);
    }
  }

  // Age match (weight 10)
  if (scheme.ageLimit != null) {
    totalWeight += 10;
    if (age != null && age <= Number(scheme.ageLimit)) {
      earnedWeight += 10;
      result.matchedReasons.push(`Age ${age} is within limit ${scheme.ageLimit}`);
    }
  }

  // Religion match (weight 10)
  if (scheme.religion && scheme.religion !== "Any" && scheme.religion !== "") {
    totalWeight += 10;
    if (religion === scheme.religion.trim().toLowerCase()) {
      earnedWeight += 10;
      result.matchedReasons.push(`Religion matches: ${scheme.religion}`);
    }
  }

  // Disability (weight 5)
  if (scheme.forDisabled === true) {
    totalWeight += 5;
    if (disability) {
      earnedWeight += 5;
      result.matchedReasons.push("Disability status matches");
    }
  }

  // State (weight 5)
  if (scheme.state && scheme.state !== "Any" && scheme.state !== "") {
    totalWeight += 5;
    if (state === scheme.state.trim().toLowerCase()) {
      earnedWeight += 5;
      result.matchedReasons.push(`State matches: ${scheme.state}`);
    }
  }

  // If scheme has no criteria at all, give 50% base
  if (totalWeight === 0) {
    result.matchPercentage = 50;
    result.matchedReasons.push("Open to all students");
  } else {
    result.matchPercentage = Math.round((earnedWeight / totalWeight) * 100);
  }

  /* ── 3. DOCUMENT READINESS ── */
  const requiredDocs = scheme.documents || [];
  if (requiredDocs.length > 0) {
    const normalizedUploaded = uploadedDocs.map(normalizeDocName);
    const missing = requiredDocs.filter(
      (d) => !normalizedUploaded.includes(normalizeDocName(d))
    );
    result.missingDocs = missing;

    if (missing.length === 0) {
      result.docReadiness = "complete";
    } else if (missing.length < requiredDocs.length) {
      result.docReadiness = "partial";
    } else {
      result.docReadiness = "none";
    }
  }

  /* ── 4. DEADLINE URGENCY ── */
  const deadline = scheme.deadline || scheme.lastDate;
  result.urgencyDays = daysUntil(deadline);

  /* ── 5. IS NEW (scheme created after student joined) ── */
  if (studentCreatedAt && scheme.createdAt) {
    result.isNew = new Date(scheme.createdAt) > new Date(studentCreatedAt);
  }

  return result;
}

/* ─────────────────────────────────────────────
   ROUTE  GET /api/ai/all-with-ai
───────────────────────────────────────────── */
router.get("/all-with-ai", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch the detailed profile (StudentProfile collection)
    // Adjust the query field to match your schema — common options shown
    const profile = await StudentProfile.findOne({
      $or: [
        { studentId: req.user.id },
        { userId: req.user.id },
        { student: req.user.id },
      ],
    });

    const uploadedDocs = getUploadedDocs(profile);

    const schemes = await Scheme.find({ status: "active" });

    const scoredSchemes = schemes.map((schemeDoc) => {
      const scheme = schemeDoc.toObject();
      const scoring = scoreScheme(
        profile ? profile.toObject() : {},
        scheme,
        uploadedDocs,
        student.createdAt
      );

      return {
        ...scheme,
        matchPercentage:      scoring.matchPercentage,
        matchedReasons:       scoring.matchedReasons,       // why eligible
        missingDocs:          scoring.missingDocs,          // docs still needed
        isHardIneligible:     scoring.isHardIneligible,     // hard filter fail
        hardIneligibleReason: scoring.hardIneligibleReason, // reason string
        docReadiness:         scoring.docReadiness,         // complete|partial|none
        urgencyDays:          scoring.urgencyDays,          // days till deadline
        isNew:                scoring.isNew,                // newly added scheme
      };
    });

    // Sort: highest match first, then by urgency
    scoredSchemes.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage)
        return b.matchPercentage - a.matchPercentage;
      // closer deadline ranks higher (non-null beats null)
      if (a.urgencyDays == null) return 1;
      if (b.urgencyDays == null) return -1;
      return a.urgencyDays - b.urgencyDays;
    });

    res.json({
      success: true,
      total: scoredSchemes.length,
      schemes: scoredSchemes,
    });
  } catch (error) {
    console.error("AI scoring error:", error);
    res.status(500).json({ message: "AI scoring failed", error: error.message });
  }
});

module.exports = router;