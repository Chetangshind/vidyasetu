const express = require("express");
const router = express.Router();

const {
  applyScheme,
  getMyApplications,
  getDonorApplications,
  getApprovedApplications,
  updateApplicationStatus,
  getApplicationById,   // ✅ ADD THIS
} = require("../controllers/ApplicationController");

const auth = require("../middlewares/authMiddleware");

router.post("/apply", auth, applyScheme);
router.get("/my", auth, getMyApplications);

// ✅ NEW — donor applications (pending / approved / rejected)
router.get("/donor", auth, getDonorApplications);

// ✅ NEW — only approved applications (added from friend)
router.get("/donor/approved", auth, getApprovedApplications);

router.get("/:id", auth, getApplicationById);

// ✅ NEW — approve / reject by donor
router.patch("/:id/status", auth, updateApplicationStatus);

const cloudinary = require("cloudinary").v2;

// Signed URL for secure document viewing
router.get("/document/signed-url", auth, async (req, res) => {
  try {
    const { publicId } = req.query;

    if (!publicId) {
      return res.status(400).json({ message: "publicId is required" });
    }

    const signedUrl = cloudinary.url(publicId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300, // 5 min
      resource_type: "raw",
    });

    res.json({ url: signedUrl });
  } catch (err) {
    console.error("Signed URL error:", err);
    res.status(500).json({ message: "Failed to generate URL" });
  }
});

module.exports = router;