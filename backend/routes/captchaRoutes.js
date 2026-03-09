const express = require("express");
const router = express.Router();
const svgCaptcha = require("svg-captcha");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
 const captcha = svgCaptcha.create({
  size: 6,               // BIGGER TEXT
  noise: 1,              // LESS NOISE = CLEAR
  color: false,          // DISABLE RANDOM COLORS
  fontSize: 58,          // LARGE FONT
  width: 220,            // WIDE CAPTCHA
  height: 60,            // TALL
  charPreset: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", // NO confusing chars
  background: "#eef3ff", // LIGHT BLUE BACKGROUND
});

  const token = jwt.sign(
    { text: captcha.text },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  const svg = captcha.data.replace(
  /stroke="[^"]+"/g,
  'stroke="#2563eb"'
);

res.json({
  image: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  token,
});
});

module.exports = router;
