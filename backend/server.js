const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

require("./models/Student");
require("./models/StudentProfile");
require("./models/DonorProfile");
require("./models/Donor");
require("./models/StudentNotification");
require("./models/Scheme");

console.log("📦 Starting server.js...");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✔ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err.message));

app.get("/", (req, res) => {
  res.send("Vidyasetu backend running");
});

// ---------------- AUTH ROUTES ----------------
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// ---------------- CAPTCHA ROUTES ----------------
const captchaRoutes = require("./routes/captchaRoutes");
app.use("/api/captcha", captchaRoutes);

// ---------------- STUDENT PROFILE ROUTES ----------------
const studentProfileRoutes = require("./routes/studentProfileRoutes");
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/student", studentProfileRoutes);
app.use("/api/student-profile", require("./routes/studentProfileRoutes"));

// ---------------- STUDENT DASHBOARD ROUTES ----------------
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
app.use("/api/student", studentDashboardRoutes);

// ---------------- DONOR APPLICATION ROUTES ----------------
const donorApplicationRoutes = require("./routes/donorApplicationRoutes");
app.use("/api/donor/applications", donorApplicationRoutes);
app.use("/api/donor", require("./routes/donorReportRoutes"));

// ---------------- scheme ROUTES ----------------
const schemeRoutes = require("./routes/schemeRoutes");
app.use("/api/schemes", schemeRoutes);
app.use("/api/ai", require("./routes/aiRecommendation"));

// ---------------- GOV SCHEME ROUTES ----------------
const govSchemeRoutes = require("./routes/govSchemeRoutes");
app.use("/api/gov-schemes", govSchemeRoutes);

// ---------------- DONOR PROFILE ROUTES ----------------
const donorProfileRoutes = require("./routes/donorProfileRoutes");
app.use("/api/donor/profile", donorProfileRoutes);

// ---------------- DONOR NOTIFICATION ROUTES ----------------
const donorNotificationRoutes = require("./routes/donorNotificationRoutes");
app.use("/api/donor-notifications", donorNotificationRoutes);

// ---------------- DONOR DASHBOARD STATS ----------------
const donorDashboardRoutes = require("./routes/donorDashboardRoutes");
app.use("/api/donor", donorDashboardRoutes);

// ---------------- HELP SUPPORT ROUTES ----------------
const helpRoutes = require("./routes/helpRoutes");
app.use("/api/help", helpRoutes);

// ✅ ADDED (if using general notifications route like in screenshot)
const studentNotificationRoutes = require("./routes/studentNotificationRoutes");
app.use("/api/student-notifications", studentNotificationRoutes);

// ---------------- application ROUTES ----------------
const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/applications", applicationRoutes);

// --------------- Meeting --------
const meetingRoutes = require("./routes/meetingRoutes");
app.use("/api/meetings", meetingRoutes);

// --------------- Admin Donor Page --------
const adminDonorRoutes = require("./routes/adminDonorRoutes");
app.use("/api/admin/donors", adminDonorRoutes);

// --------------- Admin Student Page --------
const adminStudentRoutes = require("./routes/adminStudentRoutes");
app.use("/api/admin/students", adminStudentRoutes);

// --------------- Admin Scheme Page --------
const adminSchemeRoutes = require("./routes/adminSchemeRoutes");
app.use("/api/admin/schemes", adminSchemeRoutes);

// --------------- Admin Dashboard Page --------
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
app.use("/api/admin/dashboard", adminDashboardRoutes);

//---------------- Admin Reports--------
app.use("/api", require("./routes/reportRoutes"));

app.use("/uploads", express.static("uploads"));

//--------------- Ai --------------
app.use("/api/ai", require("./routes/aiRoutes"));

const { autoExpireSchemes } = require("./controllers/schemeController");

setInterval(() => {
  autoExpireSchemes();
}, 1000 * 60); // every 1 minute

app.get("/api/admin/debug", async (req, res) => {
  try {
    const Student = require("./models/Student");
    const Donor = require("./models/Donor");
    const Scheme = require("./models/Scheme");

    const students = await Student.countDocuments({});
    const donors = await Donor.countDocuments({});
    const schemes = await Scheme.countDocuments({});

    res.json({
      students,
      donors,
      schemes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🔥 Server started on port ${PORT}`);
});