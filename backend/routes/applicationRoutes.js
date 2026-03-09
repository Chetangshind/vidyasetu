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

module.exports = router;