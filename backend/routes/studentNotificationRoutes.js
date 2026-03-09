const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middlewares/authMiddleware");
const StudentNotification = require("../models/StudentNotification");

/**
 * GET /api/notifications
 * Fetch notifications for the logged-in user (student or admin)
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const notifications = await StudentNotification.find({
      recipientId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for this user
 */
router.patch("/read-all", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    await StudentNotification.updateMany(
      { recipientId: userId, read: false },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await StudentNotification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/notifications/:id/respond
 * Student clicks "I have corrected it"
 * → marks notification as responded
 * → creates a new notification for admin
 */
router.post("/:id/respond", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const notif = await StudentNotification.findById(req.params.id);

    if (!notif) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (notif.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (notif.adminAction?.responded) {
      return res
        .status(400)
        .json({ success: false, message: "Already responded" });
    }

    // Mark as responded
    notif.adminAction.responded = true;
    notif.adminAction.respondedAt = new Date();
    notif.read = true;
    await notif.save();

    // Find admin (just use a fixed admin ID or find from admin collection)
    // We'll use the senderId stored on the notification (the admin who took action)
    const adminId = notif.senderId;

    if (adminId) {
      // Get student name from student.users collection
      const studentCollection = mongoose.connection.collection("student.users");
      const student = await studentCollection.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });

      const studentName = student?.name || "A student";

      // Create notification for admin
      await StudentNotification.create({
        recipientId: adminId,
        recipientRole: "admin",
        senderId: userId,
        senderRole: "student",
        senderName: studentName,
        type: "student_corrected",
        title: "Student Responded to Action",
        body: `${studentName} has reviewed your action and clicked "I have corrected it". Please verify and update their account status.`,
        adminAction: {
          canRespond: false,
          responded: false,
        },
      });
    }

    res.json({ success: true, message: "Response recorded" });
  } catch (err) {
    console.error("RESPOND NOTIFICATION ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread count for bell icon
 */
router.get("/unread-count", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const count = await StudentNotification.countDocuments({
      recipientId: userId,
      read: false,
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
