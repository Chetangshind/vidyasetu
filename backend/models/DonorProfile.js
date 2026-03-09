const mongoose = require("mongoose");

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      index: true,
    },

    // 👤 Personal
    fullName: String,
    phone: String,
    dob: Date,
    gender: String,
    occupation: String,

    // 📍 Address
    city: String,
    state: String,
    country: String,
    location: String,

    // 🏢 Organization
    organization: String,

    // 🪪 Documents
    aadhaar: String,
    pan: String,
    documents: [
      {
        name: String,
        number: String,
        owner: String,
      },
    ],

    // 🔥 ADMIN CONTROL FIELDS (ADD THIS)
    status: {
      type: String,
      default: "Active",
    },

    warningCount: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("DonorProfile", donorProfileSchema);