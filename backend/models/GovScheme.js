const mongoose = require("mongoose");

const govSchemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    website: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GovScheme", govSchemeSchema);