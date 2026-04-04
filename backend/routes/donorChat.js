const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const hasImage = messages.some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some((part) => part.type === "image_url")
  );

  const model = hasImage
    ? "meta-llama/llama-4-scout-17b-16e-instruct"
    : "llama-3.3-70b-versatile";

  const sanitizedMessages = messages.map((m) => {
    if (Array.isArray(m.content)) {
      return {
        role: m.role,
        content: m.content.map((part) => {
          if (part.type === "image_url") {
            return {
              type: "image_url",
              image_url: { url: part.image_url.url },
            };
          }
          return part;
        }),
      };
    }
    return m;
  });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `You are Veda, a friendly AI assistant built into the VidyaSetu donor portal.
VidyaSetu is a platform where donors create scholarship schemes and fund deserving students.

You help donors with:
- Creating schemes: Create My Scheme tab in the sidebar → fill in scheme details → submit
- Viewing schemes: My Schemes page shows all Active, Draft, and Closed schemes
- Managing applications: Applications page shows Pending, Approved, and Rejected student applications
- Pending application: pincode filter for filtering students near donor (pincode) area or can donate from any pinocde wise area
- Reviewing students: Click on any application to view the student's profile and documents
- Approving or rejecting applications: Open the application → review details → Approve or Reject
- Meetings: Applications → Approved section shows all scheduled meetings with date, time, and student details
- Editing schemes: My Schemes → click on a scheme → Edit option to update details or close the scheme
- Scheme status:
    * Active = scheme is live and accepting applications
    * Draft = scheme is saved but not yet published
    * Closed = scheme is no longer accepting applications
- Donor profile: Update your personal and organization details from the Profile section
- Settings: Choose language preference and appearance mode, update password and delete account permanantly
- Support: Help & Support section in the donor dashboard to contact admin

If the donor sends a screenshot or image:
- Describe what you see clearly
- Identify any VidyaSetu donor portal pages, forms, application lists, scheme details, or error messages visible
- Give step-by-step guidance based on what is shown in the image

Keep answers short, warm, and step-by-step. Never make up scheme names, amounts, or eligibility rules.
If you do not know something specific about the donor's account, guide them to the right page instead.`,
          },
          ...sanitizedMessages,
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq API error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Donor chat route error:", err.message);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

module.exports = router;