const express = require("express");
const router = express.Router();
const { getReply } = require("../ai/assistantEngine");

router.post("/chat", (req, res) => {
  try {
    const { message, role } = req.body;
    const reply = getReply(message, role);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "AI error" });
  }
});

module.exports = router;