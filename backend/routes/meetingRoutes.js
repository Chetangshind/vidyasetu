const express = require("express");
const router = express.Router();

const Meeting = require("../models/Meeting");
const Application = require("../models/Application");
const authMiddleware = require("../middlewares/authMiddleware");
const StudentProfile = require("../models/StudentProfile");

/* =====================================================
   1️⃣ CREATE MEETING (DONOR SCHEDULES)
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      applicationId,
      meetingType,
      locationType,
      digitalType,
      address,
      date,
      time,
      meetingLink,
    } = req.body;

    if (!applicationId || !meetingType || !date || !time) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    if (req.user.role.toLowerCase() !== "donor") {
      return res.status(403).json({
        message: "Only donors can schedule meetings",
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const existingMeeting = await Meeting.findOne({
      applicationId,
      status: "scheduled",
    });

    if (existingMeeting) {
      return res.status(400).json({
        message: "Meeting already scheduled for this application",
      });
    }

    // ✅ Get student phone
    const studentProfile = await StudentProfile.findOne({
      studentId: application.studentId,
    });

    const meeting = new Meeting({
      applicationId,
      studentId: application.studentId,
      donorId: req.user.id,
      meetingType,

      locationType:
        meetingType === "physical" ? locationType : undefined,

digitalType:
  meetingType === "digital" && digitalType
    ? digitalType
    : undefined,

   meetingLink:
  meetingType === "digital" && meetingLink
    ? meetingLink
    : undefined,

      phone:
        meetingType === "digital" && digitalType === "voice"
          ? studentProfile?.personal?.mobile
          : undefined,

      address:
        meetingType === "physical" ? address : undefined,

      date,
      time,
    });

    await meeting.save();

    res.status(201).json({
      message: "Meeting scheduled successfully",
      meeting,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while scheduling meeting",
    });
  }
});

/* =====================================================
   2️⃣ GET STUDENT MEETINGS
===================================================== */
router.get("/student", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const meetings = await Meeting.find({
      studentId: req.user.id,
    })
      .populate("applicationId")
      .sort({ createdAt: -1 });

    res.json({ meetings });
  } catch (err) {
    res.status(500).json({
      message: "Server error fetching meetings",
    });
  }
});

/* =====================================================
   3️⃣ GET DONOR MEETINGS
===================================================== */
router.get("/donor", authMiddleware, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "donor") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const meetings = await Meeting.find({
      donorId: req.user.id,
    })
      .populate("applicationId")
      .sort({ createdAt: -1 });

    res.json({ meetings });
  } catch (err) {
    res.status(500).json({
      message: "Server error fetching meetings",
    });
  }
});

/* =====================================================
   4️⃣ CANCEL MEETING (STUDENT OR DONOR)
===================================================== */
router.put("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    /* Allow only related student or donor */
    if (
      meeting.studentId.toString() !== req.user.id &&
      meeting.donorId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to cancel this meeting",
      });
    }

    meeting.status = "cancelled";
    await meeting.save();

    res.json({
      message: "Meeting cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error cancelling meeting",
    });
  }
});

/* =====================================================
   5️⃣ MARK MEETING COMPLETED (DONOR ONLY)
===================================================== */
router.put("/complete/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "donor") {
      return res.status(403).json({
        message: "Only donor can mark as completed",
      });
    }

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    meeting.status = "completed";
    await meeting.save();

    res.json({
      message: "Meeting marked as completed",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error updating meeting",
    });
  }
});

module.exports = router;