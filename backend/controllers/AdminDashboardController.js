const Student = require("../models/Student");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Application = require("../models/Application");
const HelpQuery = require("../models/HelpQuery");
const Scheme = require("../models/Scheme");

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const weekStart = () => new Date(Date.now() - 7 * 864e5);
const monthStart = () => new Date(Date.now() - 30 * 864e5);

exports.getDashboardStats = async (req, res) => {
  try {
    const { range = "today" } = req.query;
    const now = new Date();

    let from;
    if (range === "week") from = weekStart();
    else if (range === "month") from = monthStart();
    else from = todayStart();

    const today = todayStart();
    const tenDaysAgo = new Date(Date.now() - 10 * 864e5);
    const sevenDaysAgo = weekStart();
    const periodLen = now - from;
    const prevFrom = new Date(from - periodLen);

    // ── DEBUG: log what we're querying so you can verify in terminal ─────────
    console.log("📊 Dashboard query —", {
      range,
      from,
      prevFrom,
      // spot-check a donor warning query
      donorWarningQuery: { warningCount: { $gte: 2 } },
      // spot-check scheme moderation query
      schemeReviewQuery: { moderationStatus: { $ne: null } },
    });

    const [
      totalStudents,
      totalDonors,
      studentsHelpedArr,
      donationsAgg,
      todayDonationsAgg,
      scholarshipsDistributed,

      // growth
      studentsInRange,
      prevStudentsInRange,
      applicationsInRange,
      prevApplicationsInRange,
      schemesInRange,

      // ── DONOR ALERTS ─────────────────────────────────────────────────────
      // Donor.status enum: "Active"|"Under Review"|"Warning Issued"|"Suspended"|"Blacklisted"
      donorsWithWarnings, // warningCount >= 2
      donorsSuspended, // status = "Suspended" OR "Blacklisted"
      donorsUnderReview, // status = "Under Review" OR "Warning Issued"
      donorsNearSuspension, // warningCount >= 2 (same as above — near max)

      // ── SCHEME ALERTS ─────────────────────────────────────────────────────
      // Scheme.status enum: "draft"|"active"|"closed"
      // Scheme.moderationStatus: free string set by admin (null = none)
      schemesUnderReview, // moderationStatus is not null
      schemesSuspended, // moderationStatus = "suspended"
      schemesNearClosure, // warningCount >= 2

      // pending
      pendingApplications,
      unresolvedTickets,
      stuckApplications,
      stuckSevenDays,

      // recent activity
      recentStudents,
      recentDonors,
      recentApplications,
      recentHelpQueries,

      // 7-day trend
      weekApplications,

      // communication
      openTickets,
      newTicketsToday,

      // security
      suspiciousStudents,
    ] = await Promise.all([
      Student.countDocuments({}),
      Donor.countDocuments({}),
      Application.distinct("studentId", { status: "approved" }),
      Donation.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Donation.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Application.countDocuments({ status: "approved" }),

      // growth
      Student.countDocuments({ createdAt: { $gte: from } }),
      Student.countDocuments({ createdAt: { $gte: prevFrom, $lt: from } }),
      Application.countDocuments({ createdAt: { $gte: from } }),
      Application.countDocuments({ createdAt: { $gte: prevFrom, $lt: from } }),
      Scheme.countDocuments({ createdAt: { $gte: from } }),

// ── DONOR ALERTS ─────────────────────────

Donor.countDocuments({
  warningCount: { $gte: 1 },
}),

// Suspended donors (Suspended + Blacklisted)
Donor.countDocuments({
  status: { $in: ["Suspended", "Blacklisted"] },
}),

// Donors under review (Under Review + Warning Issued)
Donor.countDocuments({
  status: { $in: ["Under Review", "Warning Issued"] },
}),

// Donors near suspension (exactly 2 warnings)
Donor.countDocuments({
  warningCount: { $gte: 2 },
}),

Scheme.countDocuments({
  moderationStatus: { $regex: /^under review$/i },
}),

// Suspended schemes = closed schemes (as per your Donors.jsx logic)
Scheme.countDocuments({
  status: "closed",
}),

      // pending
      Application.countDocuments({ status: "applied" }),
      HelpQuery.countDocuments({ status: { $in: ["open", "pending"] } }),
      Application.countDocuments({
        status: "applied",
        createdAt: { $lte: tenDaysAgo },
      }),
      Application.countDocuments({
        status: "applied",
        createdAt: { $lte: sevenDaysAgo },
      }),

      // recent
      Student.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt status"),
      Donor.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt status warningCount"),
      Application.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("studentId", "name")
        .populate("schemeId", "schemeName"), // ← Scheme uses "schemeName" not "title"
      HelpQuery.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("subject createdAt status"),

      // 7-day trend
      Application.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // communication (counted twice intentionally — open + today)
      HelpQuery.countDocuments({ status: { $in: ["open", "pending"] } }),
      HelpQuery.countDocuments({ createdAt: { $gte: today } }),

      // security
      Student.countDocuments({
        suspiciousFlags: { $exists: true, $not: { $size: 0 } },
      }),
    ]);

    // ── log raw results so you can verify ─────────────────────────────────
    console.log("📊 Alert counts —", {
      donorsWithWarnings,
      donorsSuspended,
      donorsUnderReview,
      schemesUnderReview,
      schemesSuspended,
      schemesNearClosure,
    });

    const studentsHelped = studentsHelpedArr.length;
    const totalDonated = donationsAgg[0]?.total ?? 0;
    const todayDonated = todayDonationsAgg[0]?.total ?? 0;

    const growth = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const formatINR = (n) => {
      if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
      if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
      if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
      return `₹${n}`;
    };

    const totalAlerts =
      (donorsWithWarnings || 0) +
      (donorsSuspended || 0) +
      (donorsUnderReview || 0) +
      (schemesUnderReview || 0) +
      (schemesSuspended || 0);

    // activity feed — note: scheme populate uses "schemeName"
    const activity = [
      ...recentStudents.map((s) => ({
        type: "student_signup",
        label: `${s.name} registered as student`,
        time: s.createdAt,
        color: "#22c55e",
      })),
      ...recentDonors.map((d) => ({
        type: "donor_signup",
        label: `${d.name} joined as donor${d.warningCount > 0 ? ` ⚠ (${d.warningCount} warning)` : ""}`,
        time: d.createdAt,
        color: d.warningCount >= 2 ? "#ef4444" : "#3b82f6",
      })),
      ...recentApplications.map((a) => ({
        type: "application",
        label: `${a.studentId?.name || "Student"} applied to "${a.schemeId?.schemeName || "scheme"}"`,
        time: a.createdAt,
        color: "#a855f7",
      })),
      ...recentHelpQueries.map((h) => ({
        type: "support",
        label: `Support: "${h.subject || "No subject"}"`,
        time: h.createdAt,
        color: "#f59e0b",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 12);

    // admin tasks — only add if count > 0
    const tasks = [];
    if (pendingApplications > 0)
      tasks.push({
        label: `Review ${pendingApplications} pending applications`,
        priority: "high",
        path: "/admin/students",
      });
    if (unresolvedTickets > 0)
      tasks.push({
        label: `Resolve ${unresolvedTickets} support tickets`,
        priority: "high",
        path: "/admin/support",
      });
    if (donorsUnderReview > 0)
      tasks.push({
        label: `Review ${donorsUnderReview} flagged donors`,
        priority: "medium",
        path: "/admin/donors",
      });
    if (schemesUnderReview > 0)
      tasks.push({
        label: `Review ${schemesUnderReview} schemes flagged`,
        priority: "medium",
        path: "/admin/schemes",
      });
    if (stuckApplications > 0)
      tasks.push({
        label: `Handle ${stuckApplications} stuck apps (10+ days)`,
        priority: "low",
        path: "/admin/students",
      });
    if (donorsWithWarnings > 0)
      tasks.push({
        label: `${donorsWithWarnings} donors have 2+ warnings`,
        priority: "medium",
        path: "/admin/donors",
      });
    if (schemesNearClosure > 0)
      tasks.push({
        label: `${schemesNearClosure} schemes have 2+ warnings`,
        priority: "medium",
        path: "/admin/schemes",
      });

    return res.json({
      success: true,
      data: {
        totalStudents,
        totalDonors,
        studentsHelped,
        totalDonations: formatINR(totalDonated),
        scholarshipsDistributed,
        donationsToday: formatINR(todayDonated),
        totalAlerts,
        growth: {
          students: {
            current: studentsInRange,
            pct: growth(studentsInRange, prevStudentsInRange),
          },
          applications: {
            current: applicationsInRange,
            pct: growth(applicationsInRange, prevApplicationsInRange),
          },
          schemes: { current: schemesInRange },
        },
        alerts: {
          donorsWithWarnings,
          donorsSuspended,
          donorsUnderReview,
          schemesUnderReview,
          schemesSuspended,
          schemesNearClosure,
          donorsNearSuspension,
        },
        smartMonitoring: {
          donorsNearSuspension,
          schemesNearClosure,
          stuckSevenDays,
          suspiciousStudents,
        },
        pending: { pendingApplications, unresolvedTickets, stuckApplications },
        communication: { openTickets, newTicketsToday },
        recentActivity: activity,
        weekTrend: weekApplications,
        adminTasks: tasks,
        range,
      },
    });
  } catch (err) {
    console.error("❌ getDashboardStats:", err.message, err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
};
