const express = require("express");
const router = express.Router();
const GovScheme = require("../models/GovScheme");

// GET all schemes
router.get("/", async (req, res) => {
  const schemes = await GovScheme.find().sort({ createdAt: -1 });
  res.json(schemes);
});

// ADD new scheme
router.post("/", async (req, res) => {
  const newScheme = new GovScheme(req.body);
  await newScheme.save();
  res.json(newScheme);
});

// UPDATE scheme
router.put("/:id", async (req, res) => {
  const updated = await GovScheme.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE scheme
router.delete("/:id", async (req, res) => {
  await GovScheme.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;