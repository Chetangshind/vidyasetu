const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const donorApplicationController = require("../controllers/donorApplicationController");

/* ======================================================
   DONOR APPLICATION ROUTES
====================================================== */

// Pending applications
router.get(
  "/pending",
  auth,
  donorApplicationController.getPendingApplications
);

// View full application
router.get(
  "/:id",
  auth,
  donorApplicationController.getApplicationDetails
);

// Approve application
router.patch(
  "/:id/approve",
  auth,
  donorApplicationController.approveApplication
);

// Reject application
router.patch(
  "/:id/reject",
  auth,
  donorApplicationController.rejectApplication
);

module.exports = router;
