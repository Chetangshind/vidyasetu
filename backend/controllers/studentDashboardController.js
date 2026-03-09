const Student = require("../models/Student");
const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const StudentNotification = require("../models/StudentNotification");

/* ================= DASHBOARD SUMMARY ================= */
exports.getDashboardSummary = async (req, res) => {
  try {
    const studentId =
      req.user?.id || req.user?.userId || req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated",
      });
    }

    /* ================= FETCH STUDENT ================= */
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    /* ================= FETCH PROFILE ================= */
    const profile = await StudentProfile.findOne({ studentId });

    /* ================= VERIFICATION STATUS ================= */
    const statusMap = {
      active: "Verified",
      under_review: "Under Review",
      warning_issued: "Warning Issued",
      suspended: "Suspended",
      blacklisted: "Blacklisted",
    };

    const verificationStatus =
      statusMap[student.status] || "Unknown";

    /* ================= PROFILE COMPLETION ================= */
    const sections = [
      "personal",
      "address",
      "other",
      "courseList",
      "qualificationRecords",
      "collegeBank",
      "hostelRecords",
    ];

    let completedCount = 0;

    if (profile) {
      sections.forEach((key) => {
        if (profile[key] && Object.keys(profile[key]).length > 0) {
          completedCount++;
        }
      });
    }

    const profileCompletion =
      sections.length > 0
        ? Math.round((completedCount / sections.length) * 100)
        : 0;

    /* ================= APPLICATION STATS ================= */

    const totalApplied = await Application.countDocuments({
      studentId,
    });

    const approved = await Application.countDocuments({
      studentId,
      status: "approved",
    });

    const pending = await Application.countDocuments({
      studentId,
      status: "applied",
    });

    const rejected = await Application.countDocuments({
      studentId,
      status: "rejected",
    });

    /* ================= REAL NOTIFICATION COUNT ================= */

    const unreadNotifications =
      await StudentNotification.countDocuments({
        recipientId: studentId,
        read: false,
      });

    const stats = {
      totalApplied,
      approved,
      pending,
      rejected,
      unreadNotifications,
    };

    /* ================= RECENT ACTIVITY ================= */

    const recentApplications = await Application.find({
      studentId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("schemeId", "title");

    const recentActivity = recentApplications.map((app) => {
      const schemeTitle =
        app.schemeId?.title || "a scheme";

      const statusText =
        app.status === "approved"
          ? "Approved"
          : app.status === "rejected"
          ? "Rejected"
          : "Under Scrutiny";

      return `Application for "${schemeTitle}" is ${statusText}`;
    });

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      studentName: student.name,
      verificationStatus,
      profileCompletion,
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};