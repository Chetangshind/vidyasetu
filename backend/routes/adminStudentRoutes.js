const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  getAllStudents,
  getStudentById,
  updateStudentStatus,
} = require("../controllers/AdminStudentController");

// GET all students (admin only)
router.get("/", auth, getAllStudents);

// GET single student + full profile
router.get("/:id", auth, getStudentById);

// PATCH student status (under_review / warning / suspended / blacklisted / active)
router.patch("/:id/status", auth, updateStudentStatus);

module.exports = router;
