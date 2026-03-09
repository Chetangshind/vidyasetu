const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
} = require("../controllers/Admindashboardcontroller");
// const { protect, isAdmin } = require("../middlewares/authMiddleware"); // ← uncomment if you want auth guard

// GET /api/admin/dashboard/stats
router.get("/stats", /* protect, isAdmin, */ getDashboardStats);

module.exports = router;
