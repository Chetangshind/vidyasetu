const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } // This creates createdAt automatically
);

module.exports = mongoose.model("Donation", donationSchema);