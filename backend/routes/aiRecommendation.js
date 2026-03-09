const express = require("express");
const router = express.Router();
const Scheme = require("../models/Scheme");
const Student = require("../models/Student");
const authMiddleware = require("../middlewares/authMiddleware");

/* ------------------------------
   AI Score Function
--------------------------------*/
function calculateAIScore(student, scheme) {
  let score = 0;

  const income =
    student.personal?.familyIncome ||
    student.family_income ||
    0;

  const education =
    student.academic?.educationLevel ||
    student.educationLevel ||
    "";

  const category =
    student.personal?.category ||
    student.category ||
    "";

  const gender =
    student.personal?.gender ||
    student.gender ||
    "";

  const age =
    student.personal?.age ||
    student.age ||
    0;

  // 💰 Income (30)
  if (scheme.incomeLimit != null && income <= scheme.incomeLimit) {
    score += 30;
  }

  // 🎓 Education (20)
  if (
    scheme.educationLevel &&
    scheme.educationLevel !== "Any" &&
    education === scheme.educationLevel
  ) {
    score += 20;
  }

  // 🏷 Category (15)
  if (scheme.category && category === scheme.category) {
    score += 15;
  }

  // 👩 Gender (10)
  if (scheme.gender && gender === scheme.gender) {
    score += 10;
  }

  // 🎂 Age (10)
  if (scheme.ageLimit && age <= Number(scheme.ageLimit)) {
    score += 10;
  }

  return score;
}

/* ------------------------------
   Route
--------------------------------*/
router.get("/all-with-ai", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const schemes = await Scheme.find({});

    const scoredSchemes = schemes.map((scheme) => {
      const aiScore = calculateAIScore(student, scheme);

      return {
        ...scheme.toObject(),
        aiScore,
        matchPercentage: Math.min(aiScore, 100),
      };
    });

    res.json({
      success: true,
      total: scoredSchemes.length,
      schemes: scoredSchemes,
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI scoring failed" });
  }
});

module.exports = router;