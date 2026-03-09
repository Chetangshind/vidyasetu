const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ["student", "admin"],
      required: true,
    },

    // Who triggered it
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    senderRole: {
      type: String,
      enum: ["student", "admin", "system"],
      default: "system",
    },
    senderName: {
      type: String,
      default: "System",
    },

    // Notification content
    type: {
      type: String,
      enum: [
        "approved", // application approved
        "upload", // upload required / doc rejected
        "new", // new scheme
        "admin_action", // admin changed status/warned/suspended
        "student_corrected", // student clicked "I have corrected it"
        "general",
      ],
      default: "general",
    },
    title: { type: String, required: true },
    body: { type: String, required: true },

    // Admin action details (only for admin_action type)
    adminAction: {
      action: { type: String, default: null }, // under_review / warning / suspended / blacklisted / active
      reason: { type: String, default: null },
      canRespond: { type: Boolean, default: false }, // show "I have corrected it" button
      responded: { type: Boolean, default: false }, // student clicked the button
      respondedAt: { type: Date, default: null },
    },

    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
