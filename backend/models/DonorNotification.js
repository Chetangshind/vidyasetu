const mongoose = require("mongoose");

const donorNotificationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonorProfile",
      required: true,
    },

  entity: {
  type: String,
  enum: ["account", "scheme", "query"], // ✅ added query
  required: true,
},

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
    },

type: {
  type: String,
  enum: [
    "warning",
    "review",
    "approved",
    "closed",
    "restored",
    "suspended",
    "general",

    // ✅ ADD THESE
    "query_raised",
    "query_resolved",
  ],
  default: "general",
},

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.DonorNotification ||
  mongoose.model("DonorNotification", donorNotificationSchema);