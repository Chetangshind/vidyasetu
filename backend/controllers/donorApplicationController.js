const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");

exports.getPendingApplications = async (req, res) => {
  try {
    const donorId = req.user.id;

    const applications = await Application.find({
      donorId,
      status: "applied",
    })
      .populate("schemeId", "schemeName")
      .sort({ createdAt: -1 })
      .lean();

    // 🔥 attach student profile name manually
    const studentIds = applications.map(app => app.studentId);

    const profiles = await StudentProfile.find({
      studentId: { $in: studentIds }
    }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.studentId.toString()] = p;
    });

   const finalApplications = applications.map(app => {
  const profile = profileMap[app.studentId?.toString()] || null;

  return {
    ...app,
    studentProfile: profile,
    studentName: profile?.personal?.name || "—",
  };
});

    res.json({
      success: true,
      applications: finalApplications,
    });
  } catch (error) {
    console.error("GET PENDING APPLICATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   GET APPLICATION DETAILS
====================================================== */
exports.getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate("schemeId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const studentProfile = await StudentProfile.findOne({
      studentId: application.studentId._id || application.studentId,
    });

    if (!studentProfile) {
      return res
        .status(404)
        .json({ message: "Student profile not found for this application" });
    }

    res.json({
      success: true,
      application,
      studentProfile,
    });
  } catch (error) {
    console.error("GET APPLICATION DETAILS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   APPROVE APPLICATION
====================================================== */
exports.approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "approved";
    await application.save();

    res.json({ success: true, message: "Application approved" });
  } catch (error) {
    console.error("APPROVE APPLICATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   REJECT APPLICATION
====================================================== */
exports.rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "rejected";
    await application.save();

    res.json({ success: true, message: "Application rejected" });
  } catch (error) {
    console.error("REJECT APPLICATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
