const express = require("express");
const router = express.Router();
const Scheme = require("../models/Scheme");
const DonorNotification = require("../models/DonorNotification");

// =======================================================
// GET ALL SCHEMES (ADMIN)
// =======================================================
router.get("/", async (req, res) => {
  try {
    const schemes = await Scheme.find()
      .populate("donorId", "fullName email organization")
      .sort({ createdAt: -1 });

    res.json(schemes);
  } catch (err) {
    console.error("Fetch all schemes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// GET SINGLE SCHEME (ADMIN)
// =======================================================
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id)
      .populate("donorId", "fullName email organization");

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json(scheme);
  } catch (err) {
    console.error("Fetch single scheme error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// SET ACTIVE
// =======================================================
router.patch("/:id/active", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    scheme.status = "active";
    scheme.warningCount = 0;
    scheme.moderationStatus = null;
    await scheme.save();

 await DonorNotification.create({
  donorId: scheme.donorId,
  entity: "scheme",
  title: "Scheme Activated",
  message: `Your scheme "${scheme.schemeName}" has been activated.`,
  reason: req.body.reason,
  type: "approved",
});

    res.json(scheme);
  } catch (err) {
    console.error("Active update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// SET UNDER REVIEW
// =======================================================
router.patch("/:id/review", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    scheme.moderationStatus = "Under Review";
    await scheme.save();

    await DonorNotification.create({
      donorId: scheme.donorId,
      entity: "scheme",
      title: "Scheme Under Review",
      message: `Your scheme "${scheme.schemeName}" is under review.`,
      reason: req.body.reason,
      type: "review",
    });

    res.json(scheme);
  } catch (err) {
    console.error("Review update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// ISSUE WARNING
// =======================================================
router.patch("/:id/warn", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme)
      return res.status(404).json({ message: "Scheme not found" });

    if (scheme.warningCount >= 3) {
      return res.status(400).json({
        message: "Scheme already closed due to 3 warnings",
      });
    }

    // Increase warning
    scheme.warningCount = (scheme.warningCount || 0) + 1;

    // Add reason if provided
    if (req.body.reason) {
      scheme.warningReasons = scheme.warningReasons || [];
      scheme.warningReasons.push({
        reason: req.body.reason,
      });
    }

    // Moderation Logic
    if (scheme.warningCount === 1) {
      scheme.moderationStatus = "warning_issued";
      scheme.status = "draft";
    }

    if (scheme.warningCount === 2) {
      scheme.moderationStatus = "under_review";
      scheme.status = "draft";
    }

    if (scheme.warningCount >= 3) {
      scheme.moderationStatus = null;
      scheme.status = "closed";
    }

    await scheme.save();

    // ================== UPDATE DONOR ==================
    const Donor = require("../models/Donor");
    const donor = await Donor.findById(scheme.donorId);

    if (donor) {
      donor.warningCount = (donor.warningCount || 0) + 1;

      if (donor.warningCount === 1) donor.status = "Warning Issued";
      if (donor.warningCount === 2) donor.status = "Under Review";
      if (donor.warningCount >= 3) donor.status = "Suspended";

      await donor.save();
    }

    // Keep existing notification model (IMPORTANT)
    await DonorNotification.create({
      donorId: scheme.donorId,
      entity: "scheme",
      title:
        scheme.warningCount >= 3
          ? "Scheme Closed After 3 Warnings"
          : "Warning Issued on Your Scheme",
      message:
        scheme.warningCount >= 3
          ? `Your scheme "${scheme.schemeName}" has been closed after 3 warnings.`
          : `Warning issued for your scheme "${scheme.schemeName}".`,
      reason: req.body.reason,
      type: scheme.warningCount >= 3 ? "closed" : "warning",
    });

    res.json(scheme);
  } catch (err) {
    console.error("Warning error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// CLOSE SCHEME MANUALLY
// =======================================================
router.patch("/:id/close", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    scheme.status = "closed";
    scheme.moderationStatus = null;
    await scheme.save();

    await DonorNotification.create({
      donorId: scheme.donorId,
      entity: "scheme",
      title: "Scheme Permanently Closed",
      message: `Your scheme "${scheme.schemeName}" has been permanently closed.`,
      reason: req.body.reason,
      type: "closed",
    });

    res.json(scheme);
  } catch (err) {
    console.error("Close error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;