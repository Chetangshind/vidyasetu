const mongoose = require("mongoose");
const StudentProfile = require("../models/StudentProfile");
const Notification = require("../models/StudentNotification");
const Application = require("../models/Application");

const ACTION_TITLES = {
  under_review: "Your Account is Under Review",
  warning: "Warning Issued on Your Account",
  suspended: "Your Account Has Been Suspended",
  blacklisted: "Your Account Has Been Blacklisted",
  active: "Your Account Has Been Restored",
};

const ACTION_BODIES = {
  under_review:
    "Admin has placed your account under review. You can still login but cannot apply to new schemes during this period.",
  warning:
    "You have received a warning on your account. Please review the reason below and take corrective action.",
  suspended:
    "You got three warnings and didn't correct it so your account got suspended.",
  blacklisted: "Your account has been permanently banned from VidyaSetu.",
  active:
    "Your account has been restored to active status. You can now use all features normally.",
};

const CAN_RESPOND = ["warning", "under_review", "suspended"];

const getAllStudents = async (req, res) => {
  try {
    const collection = mongoose.connection.collection("student.users");

    const students = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();

    const profiles = await StudentProfile.find({}).lean();

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.studentId.toString()] = p;
    });

    const combined = await Promise.all(
      students.map(async (student) => {
        const profile = profileMap[student._id.toString()] || null;

        const latestApplication = await Application.findOne({
          studentId: student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          mobile: profile?.personal?.mobile || null,
          gender: profile?.personal?.gender || null,
          casteCategory: profile?.personal?.casteCategory || null,
          disability: profile?.personal?.disability || null,
          familyIncome: profile?.personal?.income || null,
          incomeCertificate: profile?.personal?.incomeCertificate || null,
          domicileCertificate: profile?.personal?.domicileCertificate || null,
          college: profile?.qualificationRecords?.collegeName || null,
          course: profile?.qualificationRecords?.courseName || null,
          year: profile?.qualificationRecords?.currentYear || null,
          percentile: profile?.qualificationRecords?.percentile || null,
          profileComplete: !!profile,
          hasIncomeCert: !!profile?.personal?.incomeCertificate,
          hasDomicileCert: !!profile?.personal?.domicileCertificate,
          status: student.status || "active",
          warnings: student.warnings || 0,
          suspiciousFlags: student.suspiciousFlags || [],
          applicationId: latestApplication?._id || null,
        };
      })
    );

    res.json({ success: true, students: combined });

  } catch (err) {
    console.error("❌ GET ALL STUDENTS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateStudentStatus = async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!action || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Action and reason are required" });
    }

    const collection = mongoose.connection.collection("student.users");
    const studentId = new mongoose.Types.ObjectId(req.params.id);
    const student = await collection.findOne({ _id: studentId });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    let newStatus = student.status || "active";
    let newWarnings = student.warnings || 0;
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const adminId = req.user?.id || req.user?.userId;
    const logEntry = { action, reason, adminId, timestamp: new Date() };
    const investigationLog = Array.isArray(student.investigationLog)
      ? [...student.investigationLog, logEntry]
      : [logEntry];

    if (action === "warning") {
      // Increment warning, auto-suspend if reaches 3
      newWarnings = Math.min((newWarnings || 0) + 1, 3);
      if (newWarnings >= 3) {
        newStatus = "suspended";
        await collection.updateOne(
          { _id: studentId },
          {
            $set: {
              status: "suspended",
              warnings: newWarnings,
              suspendedUntil: threeDaysLater,
              investigationLog,
            },
          },
        );
      } else {
        newStatus = "warning_issued";
        await collection.updateOne(
          { _id: studentId },
          {
            $set: {
              status: newStatus,
              warnings: newWarnings,
              investigationLog,
            },
          },
        );
      }
    } else if (action === "suspended") {
      // Direct suspend: set warnings=3, suspend for 3 days
      newWarnings = 3;
      newStatus = "suspended";
      await collection.updateOne(
        { _id: studentId },
        {
          $set: {
            status: "suspended",
            warnings: 3,
            suspendedUntil: threeDaysLater,
            investigationLog,
          },
        },
      );
    } else if (action === "active") {
      newWarnings = 0;
      newStatus = "active";
      await collection.updateOne(
        { _id: studentId },
        {
          $set: {
            status: "active",
            warnings: 0,
            suspendedUntil: null,
            investigationLog,
          },
        },
      );
    } else {
      // Other actions (under_review, blacklisted)
      newStatus = action;
      await collection.updateOne(
        { _id: studentId },
        {
          $set: {
            status: newStatus,
            investigationLog,
          },
        },
      );
    }

    // Always create notification after update
    await Notification.create({
      recipientId: studentId,
      recipientRole: "student",
      senderId: adminId ? new mongoose.Types.ObjectId(adminId) : null,
      senderRole: "admin",
      senderName: "Admin",
      type: "admin_action",
      title: ACTION_TITLES[action] || "Account Update",
      body: `${ACTION_BODIES[action] || ""}\n\nReason: ${reason}`,
      adminAction: {
        action,
        reason,
        canRespond: CAN_RESPOND.includes(action),
        responded: false,
      },
    });

    res.json({
      success: true,
      updated: { status: newStatus, warnings: newWarnings },
    });
  } catch (err) {
    console.error("❌ UPDATE STUDENT STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getStudentById = async (req, res) => {
  try {
    const collection = mongoose.connection.collection("student.users");
    const studentId = new mongoose.Types.ObjectId(req.params.id);

    const student = await collection.findOne(
      { _id: studentId },
      { projection: { password: 0 } }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const profile = await StudentProfile.findOne({
      studentId: studentId,
    }).lean();

    const applications = await Application.find({
      studentId: studentId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      student,
      profile,
      applications,
    });

  } catch (err) {
    console.error("❌ GET STUDENT BY ID ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudentStatus,
};
