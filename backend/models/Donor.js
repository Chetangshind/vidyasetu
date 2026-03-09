const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, unique: true, required: true },

    password: { type: String, required: true },

    // ✅ NEW FIELDS FOR ADMIN MONITORING

    status: {
      type: String,
      enum: [
        "Active",
        "Under Review",
        "Warning Issued",
        "Suspended",
        "Blacklisted",
      ],
      default: "Active",
    },

    warningCount: {
      type: Number,
      default: 0,
    },

    // Optional (for future investigation log)
    reviewNotes: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Donor", donorSchema, "donor.users");