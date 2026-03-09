const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  getDonorProfile,
  saveDonorProfile,
} = require("../controllers/donorProfileController");

router.get("/", auth, getDonorProfile);
router.post("/", auth, saveDonorProfile);

module.exports = router;
