const express = require("express");
const router = express.Router();

const {
  sendQuery,
  getAllQueries,
  replyToQuery,
  getMyQueries,
} = require("../controllers/helpController");

// Student / Donor send query
router.post("/send", sendQuery);

// Admin get all queries
router.get("/all", getAllQueries);

// Admin reply
router.put("/reply/:id", replyToQuery);

// Student / Donor get their queries
router.get("/my-queries/:email", getMyQueries);

module.exports = router;