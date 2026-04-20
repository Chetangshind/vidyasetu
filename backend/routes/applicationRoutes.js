const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const {
  applyScheme,
  getMyApplications,
  getDonorApplications,
  getApprovedApplications,
  updateApplicationStatus,
  getApplicationById,
} = require("../controllers/ApplicationController");

const auth = require("../middlewares/authMiddleware");

router.post("/apply", auth, applyScheme);
router.get("/my", auth, getMyApplications);

// donor applications (pending / approved / rejected)
router.get("/donor", auth, getDonorApplications);

// only approved applications
router.get("/donor/approved", auth, getApprovedApplications);

// ✅ MUST be before /:id — otherwise Express treats "document" as an id
router.get("/document/signed-url", auth, async (req, res) => {
  try {
    const { publicId } = req.query;

    if (!publicId) {
      return res.status(400).json({ message: "publicId is required" });
    }

    const signedUrl = cloudinary.url(publicId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300, // 5 min
      resource_type: "auto",
    });

    res.json({ url: signedUrl });
  } catch (err) {
    console.error("Signed URL error:", err);
    res.status(500).json({ message: "Failed to generate URL" });
  }
});

// /:id routes MUST be after all specific routes
router.get("/:id", auth, getApplicationById);
router.patch("/:id/status", auth, updateApplicationStatus);

module.exports = router;