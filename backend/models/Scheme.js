const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    schemeName: {
      type: String,
      required: true,
    },

    description: String,
    scholarshipAmount: Number,

    incomeLimit: Number,
educationLevel: String,
ageLimit: String,
    category: String,
    gender: String,
    deadline: Date,

    documents: {
      type: [String],
      default: [],
    },

    documentsList: {
      type: [String],
      default: [],
    },

    extraConditions: String,

    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },

    // ✅ ADDED (DO NOT REMOVE)
    moderationStatus: {
      type: String,
      default: null,
    },

    warningCount: {
      type: Number,
      default: 0,
    },

    warningReasons: [
      {
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],

    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Scheme || mongoose.model("Scheme", schemeSchema);