const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const dashboardController = require("../controllers/studentDashboardController");

router.get(
  "/dashboard-summary",
  auth,
  dashboardController.getDashboardSummary
);

module.exports = router;