const Application = require("../models/Application");
const Scheme = require("../models/Scheme");
const StudentProfile = require("../models/StudentProfile");

/* ======================================================
   APPLY TO SCHEME
====================================================== */
exports.applyScheme = async (req, res) => {
  try {
   const { schemeId } = req.body;
    const studentId = req.user.id;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // 🔎 Find latest application (any scheme)
    const existingApplication = await Application.findOne({
      studentId,
      status: { $in: ["applied", "approved"] },
    }).sort({ createdAt: -1 });

    if (existingApplication) {
      const appliedDate = new Date(existingApplication.createdAt);
      const now = new Date();

      const diffTime = now - appliedDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      // ⛔ Block if within 7 days
      if (diffDays < 7) {
        return res.status(400).json({
          message:
            "You can apply only one scheme at a time. Wait 7 days or until rejected.",
        });
      }
    }

// 🔹 Generate current academic year (calendar based)
const year = new Date().getFullYear();
const academicYear = `${year}-${(year + 1)
  .toString()
  .slice(-2)}`;

// 🔹 Fetch full student profile
const studentProfile = await StudentProfile.findOne({ studentId });

// ✅ Create new application with form snapshot
const application = new Application({
  studentId,
  schemeId,
  donorId: scheme.donorId,
  academicYear,
  formSnapshot: studentProfile,  // ✅ SAVE FORM DATA HERE
});

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ======================================================
   GET MY APPLIED SCHEMES (STUDENT)
====================================================== */
const Meeting = require("../models/Meeting");

exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, academicYear } = req.query;

    const filter = { studentId };
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const applications = await Application.find(filter)
      .populate("schemeId")
      .lean();

    const applicationIds = applications.map(app => app._id);

    const meetings = await Meeting.find({
      applicationId: { $in: applicationIds }
    }).lean();

    const meetingMap = {};
    meetings.forEach(m => {
      meetingMap[m.applicationId.toString()] = m;
    });

    const finalData = applications.map(app => ({
      ...app,
      meeting: meetingMap[app._id.toString()] || null
    }));

    res.json({
      success: true,
      applications: finalData,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET APPROVED APPLICATIONS (DONOR)
====================================================== */
exports.getApprovedApplications = async (req, res) => {
  try {
    const donorId = req.user.id;

    const applications = await Application.find({
      donorId,
      status: "approved",
    })
      .populate("schemeId", "schemeName")
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = applications.map(app => app.studentId);

    const profiles = await StudentProfile.find({
      studentId: { $in: studentIds }
    }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.studentId.toString()] = p;
    });

    // ✅ GET MEETINGS FOR THESE APPLICATIONS
    const applicationIds = applications.map(app => app._id);

    const meetings = await Meeting.find({
      applicationId: { $in: applicationIds }
    }).lean();

    const meetingMap = {};
    meetings.forEach(m => {
      meetingMap[m.applicationId.toString()] = m;
    });

    const finalApplications = applications.map(app => ({
      ...app,
      studentProfile: profileMap[app.studentId?.toString()] || null,
      meeting: meetingMap[app._id.toString()] || null   // ✅ attach meeting
    }));

    res.json(finalApplications);

  } catch (error) {
    console.error("GET APPROVED APPLICATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   GET DONOR APPLICATIONS (PENDING / APPROVED / REJECTED)
====================================================== */
exports.getDonorApplications = async (req, res) => {
  try {
    const donorId = req.user.id;
const { status, academicYear } = req.query;

const filter = { donorId };

if (status) filter.status = status;
if (academicYear) filter.academicYear = academicYear;

    // ✅ Populate scheme + studentId (User model)
    const applications = await Application.find(filter)
      .populate("schemeId")
      .populate({
        path: "studentId",
        select: "phone address"
      })
      .lean();

    // 🔹 Still attach studentProfile (for name etc)
    const studentIds = applications.map(app => app.studentId?._id);

    const profiles = await StudentProfile.find({
      studentId: { $in: studentIds }
    }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.studentId.toString()] = p;
    });

    const finalApplications = applications.map(app => ({
      ...app,
      studentProfile: profileMap[app.studentId?._id?.toString()] || null,
    }));

    res.json(finalApplications);

  } catch (err) {
    console.error("GET DONOR APPLICATIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
/* ======================================================
   DONOR APPROVE / REJECT APPLICATION
====================================================== */
exports.updateApplicationStatus = async (req, res) => {
  try {
const {
  status,
  rejectionReason,
  meetingDate,
  meetingType,
  meetingLink,
  meetingAddress,
} = req.body;

const updateData = { status };

if (status === "rejected") {
  updateData.rejectionReason = rejectionReason || "Not specified";
}

// ✅ When approved, save meeting details
if (status === "approved") {
  updateData.meetingDate = meetingDate;
  updateData.meetingType = meetingType;

  if (meetingType === "online") {
    updateData.meetingLink = meetingLink;
    updateData.meetingAddress = "";
  }

  if (meetingType === "physical") {
    updateData.meetingAddress = meetingAddress;
    updateData.meetingLink = "";
  }
}

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      application,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.checkEligibilityBeforeApply = async (req, res) => {
  try {
    const { schemeId } = req.body;
    const studentId = req.user.id;

    const existingApplication = await Application.findOne({
      studentId,
      status: { $in: ["applied", "approved"] },
    }).sort({ createdAt: -1 });

    if (existingApplication) {
      const appliedDate = new Date(existingApplication.createdAt);
      const now = new Date();
      const diffDays =
        (now - appliedDate) / (1000 * 60 * 60 * 24);

      if (diffDays < 7) {
        return res.status(400).json({
          message:
            "You can apply only one scheme at a time. Wait 7 days or until rejected.",
        });
      }
    }

    return res.json({
      allowed: true,
      message: "Eligible to apply",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET APPLICATION BY ID (STUDENT VIEW FORM)
====================================================== */
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("schemeId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};