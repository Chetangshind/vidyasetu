const express = require("express");
const router = express.Router();

const StudentProfile = require("../models/StudentProfile");
const auth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

router.patch(
  "/save-section",
  auth,
  upload.fields([
    { name: "incomeCertificate", maxCount: 1 },
    { name: "domicileCertificate", maxCount: 1 },
    { name: "marksheet", maxCount: 10 },
    { name: "gapCertificate", maxCount: 1 },
    { name: "collegeQR", maxCount: 1 },
    { name: "otherDocFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { section } = req.body;

      const studentId = req.user?.id || req.user?.userId || req.user?._id;
      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Unauthenticated",
        });
      }

      if (!section) {
        return res.status(400).json({
          success: false,
          message: "Section missing",
        });
      }

      // ✅ Parse data safely
      let data = {};
      if (req.body.data) {
        data =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;
      }

      // ✅ Attach uploaded file names (for normal sections)
      if (req.files?.incomeCertificate?.[0]) {
        data.incomeCertificate = req.files.incomeCertificate[0].filename;
      }

      if (req.files?.domicileCertificate?.[0]) {
        data.domicileCertificate =
          req.files.domicileCertificate[0].filename;
      }

      if (req.files?.marksheet?.[0]) {
        data.marksheet = req.files.marksheet[0].filename;
      }

      if (req.files?.gapCertificate?.[0]) {
        data.gapCertificate = req.files.gapCertificate[0].filename;
      }

      if (req.files?.collegeQR?.[0]) {
        data.collegeQR = req.files.collegeQR[0].filename;
      }

      // ✅ Find or create profile
      let profile = await StudentProfile.findOne({ studentId });
      if (!profile) {
        profile = new StudentProfile({ studentId });
      }

      /* ================= OTHER DOCUMENTS (INSIDE PERSONAL ONLY) ================= */
      if (section === "otherDocuments") {
        const parsed =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;

        const documentName = parsed?.documentName;
        const documentNumber = parsed?.documentNumber;
        const file = req.files?.otherDocFile?.[0]?.filename;

        if (!documentName || !file) {
          return res.status(400).json({
            success: false,
            message: "Document name and file are required",
          });
        }

        if (!profile.personal) {
          profile.personal = {};
        }

        if (!Array.isArray(profile.personal.otherDocuments)) {
          profile.personal.otherDocuments = [];
        }

        profile.personal.otherDocuments.push({
          documentName,
          documentNumber,
          file,
        });

        await profile.save();

        return res.json({
          success: true,
          profile,
        });
      }

      /* ================= PERSONAL (MERGE + PRESERVE OTHER DOCS) ================= */
      if (section === "personal") {
        const existingOtherDocs =
          profile.personal?.otherDocuments || [];

        profile.personal = {
          ...(profile.personal || {}),
          ...data,
          otherDocuments: existingOtherDocs,
        };

        await profile.save();

        return res.json({
          success: true,
          profile,
        });
      }

      /* ================= PAST QUALIFICATION (FIX) ================= */
/* ================= PAST QUALIFICATION (FINAL & SIMPLE) ================= */
if (section === "qualificationRecords") {
  profile.qualificationRecords = {
    ...(profile.qualificationRecords || {}),
    ...data,
    marksheet:
      data.marksheet ||
      profile.qualificationRecords?.marksheet ||
      null,
    gapCertificate:
      data.gapCertificate ||
      profile.qualificationRecords?.gapCertificate ||
      null,
  };

  await profile.save();

  return res.json({
    success: true,
    profile,
  });

  await profile.save();

  return res.json({
    success: true,
    profile,
  });
}

      /* ================= ALL OTHER SECTIONS ================= */
      profile[section] = data;

      await profile.save();

      return res.json({
        success: true,
        profile,
      });
    } catch (err) {
      console.error("❌ SAVE SECTION ERROR:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  }
);

/**
 * GET STUDENT PROFILE (FOR PREFILL)
 */
router.get("/", auth, async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userId || req.user?._id;

    if (!studentId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    }

    const profile = await StudentProfile.findOne({ studentId });

    res.json({
      success: true,
      profile: profile || null,
    });
  } catch (err) {
    console.error("❌ FETCH PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * PROFILE SUMMARY (FOR AVAILABLE SCHEMES)
 * Returns ONLY eligibility-related data
 */
router.get("/profile-summary", auth, async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userId || req.user?._id;

    if (!studentId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    }

    const profile = await StudentProfile.findOne({ studentId });

    if (!profile) {
      return res.json({
        success: true,
        student: null,
      });
    }

    /* -------------------------
       BUILD uploaded_documents ARRAY
    ------------------------- */
    const uploaded_documents = [];

    // Personal documents
    if (profile.personal?.incomeCertificate)
      uploaded_documents.push("incomeCertificate");

    if (profile.personal?.domicileCertificate)
      uploaded_documents.push("domicileCertificate");

    // Education
    if (profile.education?.marksheet)
      uploaded_documents.push("marksheet");

    // Gap certificate
    if (profile.education?.gapCertificate)
      uploaded_documents.push("gapCertificate");

    // College
    if (profile.college?.collegeQR)
      uploaded_documents.push("collegeQR");

    // Other documents (count as generic doc)
    if (
      Array.isArray(profile.personal?.otherDocuments) &&
      profile.personal.otherDocuments.length > 0
    ) {
      uploaded_documents.push("otherDocument");
    }

    /* -------------------------
       SEND MINIMAL STUDENT DATA
    ------------------------- */
    res.json({
      success: true,
      student: {
        name: profile.personal?.fullName || "",
        age: profile.personal?.age || null,
        department: profile.education?.department || "",
        gender: profile.personal?.gender || "",
        family_income: profile.personal?.familyIncome || 0,
        percentile: profile.education?.percentile || 0,
        uploaded_documents,
      },
    });
  } catch (err) {
    console.error("❌ PROFILE SUMMARY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete(
  "/delete-other-document/:docId",
  auth,
  async (req, res) => {
    try {
      const studentId = req.user?.id || req.user?.userId || req.user?._id;
      const { docId } = req.params;

      const profile = await StudentProfile.findOne({ studentId });

      if (!profile || !profile.personal?.otherDocuments) {
        return res.status(404).json({ success: false });
      }

      const index = profile.personal.otherDocuments.findIndex(
        (d) => d._id.toString() === docId
      );

      if (index === -1) {
        return res.status(404).json({ success: false });
      }

      const fileName = profile.personal.otherDocuments[index].file;

      profile.personal.otherDocuments.splice(index, 1);
      await profile.save();

      if (fileName) {
        const filePath = path.join(__dirname, "..", "uploads", fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      res.json({ success: true });
    } catch (err) {
      console.error("DELETE OTHER DOC ERROR:", err);
      res.status(500).json({ success: false });
    }
  }
);

// ================= ADMIN VIEW STUDENT PROFILE =================
router.get("/admin-view/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: restrict to admin only
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Access denied" });
    // }

    const profile = await StudentProfile.findOne({
  studentId: new mongoose.Types.ObjectId(id),
});

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    console.error("ADMIN VIEW PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


module.exports = router;


