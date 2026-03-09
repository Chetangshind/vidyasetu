const express = require("express");
const router = express.Router();
const DonorNotification = require("../models/DonorNotification");

// ✅ GET unread notification count
router.get("/unread/count/:donorId", async (req, res) => {
  try {
    const count = await DonorNotification.countDocuments({
      donorId: req.params.donorId,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ MARK ALL AS READ
router.patch("/read-all/:donorId", async (req, res) => {
  try {
    await DonorNotification.updateMany(
      { donorId: req.params.donorId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET notifications for donor
router.get("/:donorId", async (req, res) => {
  try {
    const notifications = await DonorNotification.find({
      donorId: req.params.donorId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Fetch notification error:", err);
    res.status(500).json({ message: err.message });
  }
});

// MARK AS READ
router.patch("/read/:id", async (req, res) => {
  try {
    const notif = await DonorNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;