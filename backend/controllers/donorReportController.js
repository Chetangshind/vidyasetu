const Scheme = require("../models/Scheme");
const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");
const Meeting = require("../models/Meeting");

exports.getDonorReport = async (req, res) => {
  try {
    const donorId = req.user.id;
    const { scheme } = req.query;

    // Filter by scheme if provided, and exclude closed schemes
    let schemeFilter = { 
      donorId, 
      status: { $ne: "closed" } // 🔥 Exclude closed schemes
    };
    if (scheme && scheme !== "All Schemes") {
      schemeFilter.schemeName = scheme;
    }

    // 1. Fetch Schemes
    const schemes = await Scheme.find(schemeFilter).lean();
    const schemeIds = schemes.map(s => s._id);

    // 2. Fetch Applications for these schemes
    const applications = await Application.find({ schemeId: { $in: schemeIds } }).lean();

    // 3. Calculate Summary Stats
    const totalSchemes = schemes.length;
    const activeSchemes = schemes.filter(s => s.status?.toLowerCase() === 'active').length;
    const totalApplications = applications.length;
    const totalApproved = applications.filter(a => a.status === 'approved').length;

    // 4. Meeting Analytics from Meeting collection
    const allMeetings = await Meeting.find({ donorId, status: { $ne: "cancelled" } }).lean();
    
    // Filter meetings related to selected schemes (if filtering)
    let filteredMeetings = allMeetings;
    if (scheme && scheme !== "All Schemes") {
        // Find applications for this specific scheme to filter meetings
        const schemeApps = applications.map(a => a._id.toString());
        filteredMeetings = allMeetings.filter(m => schemeApps.includes(m.applicationId.toString()));
    }

    const totalMeetings = filteredMeetings.length;
    
    const now = new Date();
    // Parse meeting dates (assuming stored as YYYY-MM-DD string in model)
    const upcomingMeetings = filteredMeetings.filter(m => {
        const mDate = new Date(m.date);
        return mDate >= new Date(now.setHours(0,0,0,0));
    }).length;

    // Meeting Type Distribution
    const onlineMeetings = filteredMeetings.filter(m => m.meetingType === 'digital').length;
    const physicalMeetings = filteredMeetings.filter(m => m.meetingType === 'physical').length;
    const meetingTypes = [
      { name: "Online", value: onlineMeetings },
      { name: "Physical", value: physicalMeetings }
    ];

    // Upcoming Meetings List
    const rawUpcomingList = filteredMeetings
      .filter(m => new Date(m.date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);

    // Fetch student names for upcoming list
    const studentIds = rawUpcomingList.map(m => m.studentId);
    const profiles = await StudentProfile.find({ studentId: { $in: studentIds } }).lean();
    const profileMap = {};
    profiles.forEach(p => profileMap[p.studentId.toString()] = p.personal?.name || "—");

    const upcomingMeetingsList = rawUpcomingList.map(m => {
      // Find the specific application to get scheme name
      const app = applications.find(a => a._id.toString() === m.applicationId.toString());
      const sch = app ? schemes.find(s => s._id.toString() === app.schemeId.toString()) : null;
      
      return {
        studentName: profileMap[m.studentId.toString()] || "—",
        scheme: sch ? sch.schemeName : "—",
        meetingType: m.digitalType || "General",
        date: m.date,
        mode: m.meetingType === 'physical' ? 'Physical' : 'Online'
      };
    });

    // 5. Scheme Wise Report Data
    const schemeWiseReport = schemes.map(s => {
      const apps = applications.filter(a => a.schemeId.toString() === s._id.toString());
      return {
        schemeName: s.schemeName,
        applications: apps.length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        status: s.status || 'Active',
        createdDate: s.createdAt ? s.createdAt.toISOString().split('T')[0] : '—'
      };
    });

    // 6. Chart Data (Applications per Scheme)
    const chartData = schemeWiseReport.map(s => ({
      name: s.schemeName,
      applications: s.applications
    }));

    // 7. Status Data (Pie Chart)
    const statusData = [
      { name: "Approved", value: applications.filter(a => a.status === 'approved').length },
      { name: "Pending", value: applications.filter(a => a.status === 'applied').length },
      { name: "Rejected", value: applications.filter(a => a.status === 'rejected').length }
    ];

    // 8. Top Performing Scheme
    let topScheme = null;
    if (schemeWiseReport.length > 0) {
      topScheme = [...schemeWiseReport].sort((a, b) => b.applications - a.applications)[0];
      topScheme = {
        name: topScheme.schemeName,
        applications: topScheme.applications,
        approved: topScheme.approved,
        successRate: topScheme.applications > 0 ? Math.round((topScheme.approved / topScheme.applications) * 100) : 0
      };
    }

    res.json({
      success: true,
      data: {
        totalSchemes,
        activeSchemes,
        totalApplications,
        totalApproved,
        totalMeetings,
        upcomingMeetings,
        meetingTypes,
        upcomingMeetingsList,
        topScheme,
        schemes: schemeWiseReport,
        chartData,
        statusData
      }
    });
  } catch (error) {
    console.error("GET DONOR REPORT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
