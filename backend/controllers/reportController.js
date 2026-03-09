const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const Scheme = require("../models/Scheme");


exports.getReportsData = async (req, res) => {
  try {
    // =============================
    // OVERVIEW
    // =============================
    const totalStudents = await StudentProfile.countDocuments();
    const totalApplications = await Application.countDocuments();
    const approved = await Application.countDocuments({ status: "approved" });
    const pending = await Application.countDocuments({ status: "pending" });
    const rejected = await Application.countDocuments({ status: "rejected" });
    const totalSchemes = await Scheme.countDocuments();

    // =============================
    // GENDER ANALYTICS
    // =============================
   const genderData = await StudentProfile.aggregate([
  { $match: { "personal.gender": { $ne: null } } },
  { $group: { _id: "$personal.gender", value: { $sum: 1 } } },
  { $project: { name: "$_id", value: 1, _id: 0 } }
]);
    // =============================
    // CATEGORY ANALYTICS
    // =============================
   const rawCategoryData = await StudentProfile.aggregate([
  {
    $group: {
      _id: "$personal.casteCategory",
      count: { $sum: 1 }
    }
  }
]);

// Default categories
const allCategories = ["SC", "ST", "OBC", "GEN", "EWS"];

// Convert aggregation result to object
const categoryMap = {};
rawCategoryData.forEach(item => {
  categoryMap[item._id] = item.count;
});

// Final formatted array (including 0 values)
const categoryData = allCategories.map(cat => ({
  category: cat,
  count: categoryMap[cat] || 0
}));

    // =============================
    // SCHEME APPLICATIONS
    // =============================
    const schemeApplications = await Application.aggregate([
      {
        $lookup: {
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "scheme"
        }
      },
      { $unwind: "$scheme" },
      {
        $group: {
          _id: "$scheme.schemeName",
          applications: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          applications: 1,
          _id: 0
        }
      }
    ]);

    // =============================
    // MONTHLY APPLICATION TREND
    // =============================
    const applicationTrend = await Application.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    // =============================
    // SPECIAL vs NORMAL STUDENTS
    // =============================
    const specialCount = await StudentProfile.countDocuments({ specialRequest: true });
    const normalCount = await StudentProfile.countDocuments({ specialRequest: false });

    const studentTypeData = [
      { name: "Normal Students", value: normalCount },
      { name: "Special Request Students", value: specialCount }
    ];

    // =============================
    // DELAY ANALYTICS
    // =============================
    const delayStatusData = [
      { name: "Approved", value: approved },
      { name: "Pending", value: pending }
    ];

    // =============================
    // PROCESSING TIME (DUMMY SIMPLE)
    // =============================
   const processingTimeRaw = await Application.aggregate([
  {
    $match: { status: "approved" }
  },
  {
    $addFields: {
      processingDays: {
        $divide: [
          { $subtract: ["$updatedAt", "$createdAt"] },
          1000 * 60 * 60 * 24
        ]
      },
      dayOfWeek: { $dayOfWeek: "$createdAt" }
    }
  },
  {
    $group: {
      _id: "$dayOfWeek",
      avgDays: { $avg: "$processingDays" }
    }
  }
]);

// Convert MongoDB day number to weekday name
const weekMap = {
  1: "Sun",
  2: "Mon",
  3: "Tue",
  4: "Wed",
  5: "Thu",
  6: "Fri",
  7: "Sat"
};

const processingTimeData = Object.values(weekMap).map(day => ({
  scheme: day,
  days: 0
}));

processingTimeRaw.forEach(item => {
  const dayName = weekMap[item._id];
  const index = processingTimeData.findIndex(d => d.scheme === dayName);
  if (index !== -1) {
    processingTimeData[index].days = Math.round(item.avgDays);
  }
});

    // =============================
    // FINAL RESPONSE
    // =============================
    res.json({
      overview: {
        totalStudents,
        totalApplications,
        approved,
        pending,
        rejected,
        totalSchemes
      },
      genderData,
      categoryData,
      schemeApplications,
      applicationTrend,
      processingTimeData,
      delayStatusData,
      studentTypeData
    });

  } catch (error) {
    console.error("Reports Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};