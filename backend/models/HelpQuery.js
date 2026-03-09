const mongoose = require("mongoose");

const helpQuerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "donor"],
      required: true,
    },

    // ✅ ADD THESE TWO
    subject: {
      type: String,
      required: true,
    },
    applicationId: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpQuery", helpQuerySchema);