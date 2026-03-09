const express = require("express");
const router = express.Router();
const schemeController = require("../controllers/schemeController");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createScheme,
  saveDraft,
  getMySchemes,
  updateScheme,
} = require("../controllers/schemeController");

const {
  getAvailableSchemesForStudents,
} = require("../controllers/schemeController");

// STUDENT – available schemes (public)
router.get("/available", getAvailableSchemesForStudents);

router.post("/", authMiddleware, createScheme);
router.post("/draft", authMiddleware, saveDraft);
router.get("/my", authMiddleware, getMySchemes);
router.get("/:id", authMiddleware, schemeController.getSingleScheme);

router.put("/:id", authMiddleware, updateScheme);
router.put("/:id/cancel", authMiddleware, schemeController.cancelScheme);
router.delete("/:id", authMiddleware, schemeController.deleteScheme);

module.exports = router;
