// routes/donorDashboardRoutes.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { getDonorDashboardStats } = require("../controllers/donorDashboardController");

// GET /api/donor/dashboard-stats
router.get("/dashboard-stats", auth, getDonorDashboardStats);

module.exports = router;
