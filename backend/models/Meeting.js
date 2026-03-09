const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meetingType: {
      type: String,
      enum: ["physical", "digital"],
      required: true,
    },

    locationType: {
      type: String,
      enum: ["student_home", "donor_home"],
    },

    digitalType: {
      type: String,
      enum: ["voice", "video"],
    },

    address: String,
    phone: String,

     meetingLink: {
  type: String,
},

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);