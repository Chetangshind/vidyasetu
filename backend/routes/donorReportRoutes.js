const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const donorReportController = require("../controllers/donorReportController");

// GET /api/donor/report
router.get("/report", auth, donorReportController.getDonorReport);

module.exports = router;
