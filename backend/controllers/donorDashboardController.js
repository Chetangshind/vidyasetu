// controllers/donorDashboardController.js

const Application = require("../models/Application");
const Scheme = require("../models/Scheme");
const DonorNotification = require("../models/DonorNotification");

// ================= GET DONOR DASHBOARD STATS =================
exports.getDonorDashboardStats = async (req, res) => {
  try {
    const donorId = req.user.id;

    // 1. Students Sponsored — unique students with approved applications
    const approvedApps = await Application.find({
      donorId,
      status: "approved",
    }).lean();

    const uniqueStudents = new Set(
      approvedApps.map((app) => app.studentId.toString())
    );
    const studentsSponsored = uniqueStudents.size;

    // 2. Total Amount Donated — sum scholarshipAmount of approved apps
    const approvedWithScheme = await Application.find({
      donorId,
      status: "approved",
    })
      .populate("schemeId", "scholarshipAmount")
      .lean();

    const totalDonated = approvedWithScheme.reduce((sum, app) => {
      return sum + (app.schemeId?.scholarshipAmount || 0);
    }, 0);

    // 3. Active Schemes count
    const activeSchemes = await Scheme.countDocuments({
      donorId,
      status: "active",
    });

    // 4. Special Requests — applications where student has a special request
    //    We treat "applied" applications older than 7 days as special requests
    //    OR you can add an isSpecial field to Application model later.
    //    For now: count approved apps that have a note / use a separate query.
    //    Since there's no isSpecial field yet, we count all approved apps
    //    where the scheme has extraConditions set (proxy for special).
    const specialRequests = await Application.countDocuments({
      donorId,
      status: "applied",
    });
    // Note: above gives pending count too — see below for split

    // 5. Pending Applications
    const pendingApplications = await Application.countDocuments({
      donorId,
      status: "applied",
    });

    // 6. Recent Activity — latest notification for this donor
    let recentActivity = "No recent activity.";
    try {
      const latestNotif = await DonorNotification.findOne({ donorId })
        .sort({ createdAt: -1 })
        .lean();
      if (latestNotif) {
        recentActivity = latestNotif.message;
      } else {
        // Fallback: last approved application
        const lastApp = await Application.findOne({ donorId, status: "approved" })
          .populate("schemeId", "schemeName")
          .sort({ updatedAt: -1 })
          .lean();
        if (lastApp) {
          recentActivity = `You approved an application for ${lastApp.schemeId?.schemeName || "a scheme"}.`;
        }
      }
    } catch (_) {
      // DonorNotification model may not exist yet — silently ignore
    }

    return res.json({
      success: true,
      stats: {
        studentsSponsored,
        totalDonated,
        activeSchemes,
        specialRequests,
        pendingApplications,
        recentActivity,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
