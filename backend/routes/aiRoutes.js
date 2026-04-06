const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Scheme = require("../models/Scheme");
const Student = require("../models/Student");
const StudentProfile = require("../models/StudentProfile");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/version", (req, res) => {
  res.json({ v: "NEW_v6", time: new Date().toISOString() });
});

router.get("/debug-raw", async (req, res) => {
  try {
    const profiles = await StudentProfile.find({}).limit(3).lean();
    const schemes  = await Scheme.find({ status: "active" }).limit(5).lean();
    const students = await Student.find({}).limit(3).lean();
    res.json({
      profileCount:        profiles.length,
      studentCount:        students.length,
      schemeCount:         schemes.length,
      firstProfileAllKeys: profiles[0] ? Object.keys(profiles[0]) : [],
      firstProfileRaw:     profiles[0] || null,
      firstStudentRaw:     students[0]
        ? { _id: students[0]._id, email: students[0].email, createdAt: students[0].createdAt }
        : null,
      firstSchemeRaw: schemes[0]
        ? {
            name:           schemes[0].schemeName,
            category:       schemes[0].category,
            gender:         schemes[0].gender,
            incomeLimit:    schemes[0].incomeLimit,
            ageLimit:       schemes[0].ageLimit,
            educationLevel: schemes[0].educationLevel,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Helpers ── */

function normalizeDocName(name = "") {
  const n = name.toLowerCase();
  if (n.includes("aadhaar") || n.includes("adhar")) return "aadhaar";
  if (n.includes("income"))    return "income";
  if (n.includes("domicile"))  return "domicile";
  if (n.includes("caste"))     return "caste";
  if (n.includes("ration"))    return "ration";
  if (n.includes("marksheet")) return "marksheet";
  if (n.includes("gap"))       return "gap";
  if (n.includes("bank") || n.includes("passbook")) return "bank";
  return n.replace(/\s+/g, "").replace(/_/g, "");
}

function normalizeCategory(raw = "") {
  const s = raw.toLowerCase().trim();
  if (s.startsWith("sc"))      return "sc";
  if (s.startsWith("st"))      return "st";
  if (s.startsWith("obc"))     return "obc";
  if (s.startsWith("general")) return "general";
  if (s.startsWith("nt"))      return "nt";
  if (s.startsWith("vjnt"))    return "vjnt";
  if (s.startsWith("sbc"))     return "sbc";
  return s;
}

function parseMaxAge(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/\s/g, "");
  const rangeMatch = s.match(/(\d+)[–\-](\d+)/);
  if (rangeMatch) return parseInt(rangeMatch[2], 10);
  const single = parseInt(s, 10);
  return isNaN(single) ? null : single;
}

function getUploadedDocs(profile) {
  const docs = [];
  if (!profile) return docs;
  const p  = profile.personal             || {};
  const cl = profile.courseList           || {};
  const qr = profile.qualificationRecords || {};
  if (p.aadhaar)             docs.push("Aadhaar Card");
  if (p.incomeCertificate)   docs.push("Income Certificate");
  if (p.domicileCertificate) docs.push("Domicile Certificate");
  if (p.casteCertificate)    docs.push("Caste Certificate");
  (p.otherDocuments || []).forEach((d) => { if (d.documentName) docs.push(d.documentName); });
  if (cl.marksheet)          docs.push("Last Year Marksheet");
  if (qr.marksheet)          docs.push("Past Qualification Marksheet");
  if (qr.gapCertificate)     docs.push("Gap Certificate");
  return docs;
}

function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function extractStudentFields(profile) {
  if (!profile) {
    return { income: null, category: "", religion: "", gender: "", disability: false, age: null, state: "", eduLevel: "", percentage: null };
  }
  const p       = (profile.personal && Object.keys(profile.personal).length > 0) ? profile.personal : profile;
  const address = profile.address              || {};
  const cl      = profile.courseList           || {};
  const qr      = profile.qualificationRecords || {};

  const incomeRaw = p.income ?? p.familyIncome ?? p.annualIncome ?? null;
  const income = incomeRaw != null
    ? parseFloat(String(incomeRaw).replace(/,/g, "").replace(/[^\d.]/g, ""))
    : null;

  const category   = normalizeCategory(p.casteCategory || p.preferredCasteCategory || p.category || p.caste || "");
  const religion   = (p.religion || p.preferredReligion || "").trim().toLowerCase();
  const gender     = (p.gender || "").trim().toLowerCase();
  const disabilityRaw = String(p.disability || "").trim().toLowerCase();
  const disability = disabilityRaw === "yes" || disabilityRaw === "true";

  let age = p.age ? Number(p.age) : null;
  if (!age && p.dob) {
    const diff = Date.now() - new Date(p.dob).getTime();
    age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  const state      = (address.state || address.permanentState || address.currentState || p.state || "").trim().toLowerCase();
  const eduLevel   = (cl.educationLevel || qr.educationLevel || p.educationLevel || "").trim().toLowerCase();
  const percentage = parseFloat(cl.percentage || qr.percentage || p.percentage || 0) || null;

  return { income, category, religion, gender, disability, age, state, eduLevel, percentage };
}

/* ── CORE SCORING ── */

function scoreScheme(profile, scheme, uploadedDocs, studentCreatedAt) {
  const result = {
    matchPercentage:      0,
    matchedReasons:       [],
    missingDocs:          [],
    isHardIneligible:     false,
    hardIneligibleReason: null,
    docReadiness:         "complete",
    urgencyDays:          null,
    isNew:                false,
  };

  const { income, category, religion, gender, disability, age, state, eduLevel, percentage }
    = extractStudentFields(profile);

  const schemeCategory = normalizeCategory(scheme.category || "");
  const schemeGender   = (scheme.gender        || "").trim().toLowerCase();
  const schemeReligion = (scheme.religion       || "").trim().toLowerCase();
  const schemeEdu      = (scheme.educationLevel || "").trim().toLowerCase();
  const schemeState    = (scheme.state          || "").trim().toLowerCase();
  const maxAge         = parseMaxAge(scheme.ageLimit);

  /* ── HARD FILTERS (mark ineligible but continue scoring) ── */

  if (schemeGender && schemeGender !== "any") {
    if (gender && gender !== schemeGender) {
      result.isHardIneligible     = true;
      result.hardIneligibleReason = `Scheme is for ${scheme.gender} students only`;
    }
  }

  if (schemeCategory && schemeCategory !== "any") {
    if (category && category !== schemeCategory) {
      result.isHardIneligible     = true;
      result.hardIneligibleReason = result.hardIneligibleReason || `Scheme is for ${scheme.category} category only`;
    }
  }

  if (schemeReligion && schemeReligion !== "any") {
    if (religion && religion !== schemeReligion) {
      result.isHardIneligible     = true;
      result.hardIneligibleReason = result.hardIneligibleReason || `Scheme is for ${scheme.religion} students only`;
    }
  }

  if (scheme.incomeLimit != null && income != null) {
    if (income > scheme.incomeLimit) {
      result.isHardIneligible     = true;
      result.hardIneligibleReason = result.hardIneligibleReason
        || `Family income ₹${income.toLocaleString("en-IN")} exceeds limit ₹${Number(scheme.incomeLimit).toLocaleString("en-IN")}`;
    }
  }

  if (maxAge != null && age != null) {
    if (age > maxAge) {
      result.isHardIneligible     = true;
      result.hardIneligibleReason = result.hardIneligibleReason || `Age ${age} exceeds scheme age limit of ${maxAge}`;
    }
  }

  if (schemeState && schemeState !== "any") {
    if (state && state !== schemeState) {
      result.isHardIneligible     = true;
      result.hardIneligibleReason = result.hardIneligibleReason || `Scheme is only for residents of ${scheme.state}`;
    }
  }

  /* ── SOFT SCORING — all criteria ── */

  let totalWeight  = 0;
  let earnedWeight = 0;

  // 1. Income (25 pts)
  if (scheme.incomeLimit != null) {
    totalWeight += 25;
    if (income != null && income <= scheme.incomeLimit) {
      earnedWeight += 25;
      result.matchedReasons.push(`Income ₹${income.toLocaleString("en-IN")} within limit ₹${Number(scheme.incomeLimit).toLocaleString("en-IN")}`);
    }
  }

  // 2. Caste/Category (20 pts)
  if (schemeCategory && schemeCategory !== "any") {
    totalWeight += 20;
    if (category && category === schemeCategory) {
      earnedWeight += 20;
      result.matchedReasons.push(`Category matches: ${scheme.category}`);
    }
  }

  // 3. Gender (15 pts)
  if (schemeGender && schemeGender !== "any") {
    totalWeight += 15;
    if (gender && gender === schemeGender) {
      earnedWeight += 15;
      result.matchedReasons.push(`Gender matches: ${scheme.gender}`);
    }
  }

  // 4. Education level (15 pts)
  if (schemeEdu && schemeEdu !== "any") {
    totalWeight += 15;
    if (eduLevel && eduLevel === schemeEdu) {
      earnedWeight += 15;
      result.matchedReasons.push(`Education level matches: ${scheme.educationLevel}`);
    }
  }

  // 5. Age (10 pts)
  if (maxAge != null) {
    totalWeight += 10;
    if (age != null && age <= maxAge) {
      earnedWeight += 10;
      result.matchedReasons.push(`Age ${age} within limit ${maxAge}`);
    }
  }

  // 6. Religion (10 pts)
  if (schemeReligion && schemeReligion !== "any") {
    totalWeight += 10;
    if (religion && religion === schemeReligion) {
      earnedWeight += 10;
      result.matchedReasons.push(`Religion matches: ${scheme.religion}`);
    }
  }

  // 7. Disability (5 pts)
  if (scheme.forDisabled === true) {
    totalWeight += 5;
    if (disability) {
      earnedWeight += 5;
      result.matchedReasons.push("Disability status matches");
    }
  }

  // 8. State (5 pts)
  if (schemeState && schemeState !== "any") {
    totalWeight += 5;
    if (state && state === schemeState) {
      earnedWeight += 5;
      result.matchedReasons.push(`State matches: ${scheme.state}`);
    }
  }

  // 9. Academic percentage (10 pts)
  if (scheme.minPercentage != null) {
    totalWeight += 10;
    if (percentage != null && percentage >= scheme.minPercentage) {
      earnedWeight += 10;
      result.matchedReasons.push(`Percentage ${percentage}% meets minimum ${scheme.minPercentage}%`);
    }
  }

  // 10. Documents — partial credit (10 pts)
  const requiredDocs = scheme.documents || [];
  if (requiredDocs.length > 0) {
    totalWeight += 10;
    const normalizedUploaded = uploadedDocs.map(normalizeDocName);
    const uploadedCount = requiredDocs.filter(
      (d) => normalizedUploaded.includes(normalizeDocName(d))
    ).length;
    const docScore = Math.round((uploadedCount / requiredDocs.length) * 10);
    earnedWeight += docScore;

    if (uploadedCount === requiredDocs.length) {
      result.matchedReasons.push("All required documents uploaded ✓");
    } else if (uploadedCount > 0) {
      result.matchedReasons.push(`${uploadedCount}/${requiredDocs.length} required documents uploaded`);
    }

    // Doc readiness status
    const missing = requiredDocs.filter(
      (d) => !normalizedUploaded.includes(normalizeDocName(d))
    );
    result.missingDocs   = missing;
    result.docReadiness  = missing.length === 0 ? "complete" : missing.length < requiredDocs.length ? "partial" : "none";
  }

  // Final percentage
  if (totalWeight === 0) {
    result.matchPercentage = 60;
    result.matchedReasons.push("Open to all students");
  } else {
    result.matchPercentage = Math.round((earnedWeight / totalWeight) * 100);
  }

  // Cap hard-ineligible at 40% so eligible schemes always rank higher
  if (result.isHardIneligible) {
    result.matchPercentage = Math.min(result.matchPercentage, 40);
  }

  result.urgencyDays = daysUntil(scheme.deadline || scheme.lastDate);

  if (studentCreatedAt && scheme.createdAt) {
    result.isNew = new Date(scheme.createdAt) > new Date(studentCreatedAt);
  }

  return result;
}

/* ── ROUTE ── */

router.get("/all-with-ai", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const studentObjectId = new mongoose.Types.ObjectId(req.user.id);
    let profile = await StudentProfile.findOne({ studentId: studentObjectId });
    if (!profile) profile = await StudentProfile.findOne({ userId:  studentObjectId });
    if (!profile) profile = await StudentProfile.findOne({ student: studentObjectId });

    console.log("\n========== AI SCORING ==========");
    console.log("studentId     :", req.user.id);
    console.log("Profile found :", profile ? "YES ✅" : "NO ❌");
    if (profile) console.log("Extracted     :", extractStudentFields(profile.toObject()));
    console.log("=================================\n");

    const profileObj   = profile ? profile.toObject() : null;
    const uploadedDocs = getUploadedDocs(profileObj);
    const schemes      = await Scheme.find({ status: "active" });

    const scoredSchemes = schemes.map((schemeDoc) => {
      const scheme  = schemeDoc.toObject();
      const scoring = scoreScheme(profileObj, scheme, uploadedDocs, student.createdAt);

      console.log(
        `[${scheme.schemeName}] ${scoring.matchPercentage}%`,
        scoring.isHardIneligible
          ? `⚠ ${scoring.hardIneligibleReason}`
          : `✅ ${scoring.matchedReasons.join(" | ") || "open"}`
      );

      return {
        ...scheme,
        matchPercentage:      scoring.matchPercentage,
        matchedReasons:       scoring.matchedReasons,
        missingDocs:          scoring.missingDocs,
        isHardIneligible:     scoring.isHardIneligible,
        hardIneligibleReason: scoring.hardIneligibleReason,
        docReadiness:         scoring.docReadiness,
        urgencyDays:          scoring.urgencyDays,
        isNew:                scoring.isNew,
      };
    });

    scoredSchemes.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      if (a.urgencyDays == null) return 1;
      if (b.urgencyDays == null) return -1;
      return a.urgencyDays - b.urgencyDays;
    });

    res.json({ success: true, total: scoredSchemes.length, schemes: scoredSchemes });

  } catch (error) {
    console.error("AI scoring error:", error);
    res.status(500).json({ message: "AI scoring failed", error: error.message });
  }
});

module.exports = router;