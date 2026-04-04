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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://vidyasetu-pi.vercel.app",
  "https://vidyasetu-k9b6.onrender.com"
];

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

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

// ---------------- SCHEME ROUTES ----------------
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

// ---------------- STUDENT NOTIFICATIONS ----------------
const studentNotificationRoutes = require("./routes/studentNotificationRoutes");
app.use("/api/student-notifications", studentNotificationRoutes);

// ---------------- APPLICATION ROUTES ----------------
const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/applications", applicationRoutes);

// ---------------- MEETING ROUTES ----------------
const meetingRoutes = require("./routes/meetingRoutes");
app.use("/api/meetings", meetingRoutes);

// ---------------- ADMIN ROUTES ----------------
const adminDonorRoutes = require("./routes/adminDonorRoutes");
app.use("/api/admin/donors", adminDonorRoutes);

const adminStudentRoutes = require("./routes/adminStudentRoutes");
app.use("/api/admin/students", adminStudentRoutes);

const adminSchemeRoutes = require("./routes/adminSchemeRoutes");
app.use("/api/admin/schemes", adminSchemeRoutes);

const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
app.use("/api/admin/dashboard", adminDashboardRoutes);

// ---------------- ADMIN REPORTS ----------------
app.use("/api", require("./routes/reportRoutes"));

app.use("/uploads", express.static("uploads"));

// ---------------- AI ROUTES ----------------
app.use("/api/ai", require("./routes/aiRoutes"));

// ---------------- VEDA CHAT ROUTE ----------------
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

// ---------------- AUTO EXPIRE SCHEMES ----------------
const { autoExpireSchemes } = require("./controllers/schemeController");
setInterval(() => {
  autoExpireSchemes();
}, 1000 * 60);

// ---------------- DEBUG ----------------
app.get("/api/admin/debug", async (req, res) => {
  try {
    const Student = require("./models/Student");
    const Donor = require("./models/Donor");
    const Scheme = require("./models/Scheme");

    const students = await Student.countDocuments({});
    const donors = await Donor.countDocuments({});
    const schemes = await Scheme.countDocuments({});

    res.json({ students, donors, schemes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- KEEP ALIVE ----------------
const https = require("https");
setInterval(() => {
  https.get("https://vidyasetu-k9b6.onrender.com/", (res) => {
    console.log("🔄 Keep-alive ping:", res.statusCode);
  }).on("error", (err) => {
    console.log("⚠️ Keep-alive error:", err.message);
  });
}, 1000 * 60 * 10); // ping every 10 minutes

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🔥 Server started on port ${PORT}`);
});