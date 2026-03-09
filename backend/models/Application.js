const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },
    academicYear: {
  type: String,
  required: true,
},
formSnapshot: {
  type: Object,
},
    status: {
      type: String,
      enum: ["applied", "approved", "rejected"],
      default: "applied",
    },

    // ✅ NEW — only used when status = "rejected"
    rejectionReason: {
      type: String,
      default: "",
    },

    meetingDate: {
  type: Date,
},

meetingType: {
  type: String,
  enum: ["online", "physical"],
},

meetingAddress: {
  type: String,
},

meetingLink: {
  type: String,
},

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
