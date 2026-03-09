const natural = require("natural");
const path = require("path");

const classifier = new natural.BayesClassifier();

/* ================= GREETING ================= */
[
  "hi",
  "hello",
  "hey",
  "good morning",
  "good evening",
  "how are you",
  "hi vidyasetu",
  "hello assistant"
].forEach(text => classifier.addDocument(text, "greeting"));

/* ================= AUTH ================= */
[
  "how to login",
  "login issue",
  "signup problem",
  "create account",
  "register as student",
  "register as donor",
  "forgot password",
  "otp not received"
].forEach(text => classifier.addDocument(text, "auth"));

/* ================= LANDING PAGE ================= */
[
  "what is vidyasetu",
  "about vidyasetu",
  "how vidyasetu works",
  "features of vidyasetu",
  "mission of vidyasetu"
].forEach(text => classifier.addDocument(text, "landing"));

/* ================= STUDENT - SCHEMES ================= */
[
  "available schemes",
  "show schemes",
  "scholarship list",
  "apply scholarship",
  "scheme details",
  "how to apply",
  "application process"
].forEach(text => classifier.addDocument(text, "student_scheme"));

/* ================= STUDENT - APPLICATION STATUS ================= */
[
  "check status",
  "application status",
  "is my application approved",
  "pending application",
  "rejected application"
].forEach(text => classifier.addDocument(text, "student_status"));

/* ================= STUDENT - PROFILE ================= */
[
  "update my profile",
  "profile problem",
  "cannot update my details",
  "my bank details not saving",
  "education details issue",
  "how to change my information",
  "profile not updating",
  "i want to edit my info"
].forEach(text => classifier.addDocument(text, "student_profile"));
/* ================= STUDENT - EXPENSE ================= */
[
  "track expenses",
  "add expenses",
  "expense history",
  "monthly expense report"
].forEach(text => classifier.addDocument(text, "student_expense"));

/* ================= STUDENT - HELP ================= */
[
  "raise support ticket",
  "student help",
  "contact admin",
  "submit complaint"
].forEach(text => classifier.addDocument(text, "student_help"));

/* ================= DONOR - CREATE SCHEME ================= */
[
  "create scheme",
  "add new scheme",
  "start scholarship",
  "donor scheme process"
].forEach(text => classifier.addDocument(text, "donor_create_scheme"));

/* ================= DONOR - DIRECT SUPPORT ================= */
[
  "independent donor",
  "direct support",
  "fund student directly",
  "donate directly"
].forEach(text => classifier.addDocument(text, "donor_direct"));

/* ================= DONOR - APPLICATIONS ================= */
[
  "pending applications",
  "approved applications",
  "rejected applications",
  "special requests",
  "view student form"
].forEach(text => classifier.addDocument(text, "donor_applications"));

/* ================= DONOR - DONATIONS ================= */
[
  "donation history",
  "pending donations",
  "download receipt",
  "donation report"
].forEach(text => classifier.addDocument(text, "donor_donations"));

/* ================= DONOR - PROFILE ================= */
[
  "edit donor profile",
  "update organization details",
  "change donor information"
].forEach(text => classifier.addDocument(text, "donor_profile"));

/* ================= ADMIN ================= */
[
  "admin profile settings",
  "admin account management",
  "update admin account"
].forEach(text => classifier.addDocument(text, "admin_profile"));

/* ================= NOTIFICATIONS ================= */
[
  "view notifications",
  "latest updates",
  "system notifications"
].forEach(text => classifier.addDocument(text, "notifications"));

/* ================= SETTINGS ================= */
[
  "change password",
  "update settings",
  "account settings"
].forEach(text => classifier.addDocument(text, "settings"));

/* ================= TRAIN ================= */
classifier.train();

/* ================= SAVE MODEL ================= */
classifier.save(
  path.join(__dirname, "classifier.json"),
  function () {
    console.log("🔥 Full Website Classifier Trained Successfully!");
  }
);