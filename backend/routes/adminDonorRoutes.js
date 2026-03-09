const express = require("express");
const router = express.Router();
const DonorProfile = require("../models/DonorProfile");
const DonorNotification = require("../models/DonorNotification");


// ================= GET ALL DONORS =================
router.get("/", async (req, res) => {
  try {
    const donors = await DonorProfile.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donors" });
  }
});


// ================= GET SINGLE DONOR =================
router.get("/:id", async (req, res) => {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Donor not found" });
    res.json(donor);
  } catch (err) {
    res.status(500).json({ message: "Error fetching donor" });
  }
});


// ================= RESTORE TO ACTIVE =================
router.patch("/:id/active", async (req, res) => {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Not found" });

    donor.status = "Active";
    donor.warningCount = 0;
    await donor.save();

    await DonorNotification.create({
      donorId: donor.userId,
      entity: "account",
      title: "Account Restored",
      message: "Your account has been restored to Active.",
      reason: req.body.reason,
      type: "restored",
    });

    res.json(donor);
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});


// ================= UNDER REVIEW =================
router.patch("/:id/review", async (req, res) => {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Not found" });

    donor.status = "Under Review";
    await donor.save();

    await DonorNotification.create({
      donorId: donor.userId,
      entity: "account",
      title: "Account Under Review",
      message:
        "Your account has been moved to Under Review. You cannot make changes until it is reviewed.",
      reason: req.body.reason,
      type: "review",
    });

    res.json(donor);
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});


// ================= ISSUE WARNING =================
router.patch("/:id/warn", async (req, res) => {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Not found" });

    if (donor.warningCount >= 3) {
      return res.status(400).json({ message: "Already 3 warnings issued" });
    }

    donor.warningCount += 1;

    if (donor.warningCount >= 3) {
      donor.status = "Suspended";

      await DonorNotification.create({
        donorId: donor.userId,
        entity: "account",
        title: "Account Suspended",
        message:
          "Your account has been suspended after receiving 3 warnings.",
        reason: req.body.reason,
        type: "suspended",
      });

    } else {
      donor.status = "Warning Issued";

      await DonorNotification.create({
        donorId: donor.userId,
        entity: "account",
        title: "Warning Issued on Your Account",
        message:
          "You have received a warning. Please review the reason below.",
        reason: req.body.reason,
        type: "warning",
      });
    }

    await donor.save();
    res.json(donor);

  } catch (err) {
    res.status(500).json({ message: "Warning failed" });
  }
});


// ================= DIRECT SUSPEND =================
router.patch("/:id/suspend", async (req, res) => {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Not found" });

    donor.status = "Suspended";
    await donor.save();

    await DonorNotification.create({
      donorId: donor.userId,
      entity: "account",
      title: "Account Suspended by Admin",
      message:
        "Your account has been suspended by the administrator.",
      reason: req.body.reason,
      type: "suspended",
    });

    res.json(donor);
  } catch (err) {
    res.status(500).json({ message: "Suspend failed" });
  }
});

module.exports = router;