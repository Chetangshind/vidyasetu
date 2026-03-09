const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // ── Admin Monitoring Fields ──────────────────────────────────
    status: {
      type: String,
      enum: [
        "active",
        "under_review",
        "warning_issued",
        "suspended",
        "blacklisted",
      ],
      default: "active",
    },
    warnings: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    suspiciousFlags: {
      type: [String],
      default: [],
    },
    investigationLog: {
      type: [
        {
          action: String,
          reason: String,
          adminId: mongoose.Schema.Types.ObjectId,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema, "student.users");
