const HelpQuery = require("../models/HelpQuery");
const DonorNotification = require("../models/DonorNotification");
const DonorProfile = require("../models/DonorProfile");

// 1️⃣ Send Query
exports.sendQuery = async (req, res) => {
  try {
    const { name, email, role, subject, applicationId, message } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const newQuery = new HelpQuery({
      name,
      email: normalizedEmail,
      role: role?.toLowerCase(),
      subject,
      applicationId,
      message,
    });

    await newQuery.save();

    // 🔔 Create notification only for donor
if (role?.toLowerCase() === "donor") {

  console.log("Looking for donor with email:", normalizedEmail);

  const donor = await DonorProfile.findOne({
    email: normalizedEmail,
  });

  console.log("Donor found:", donor);

  if (!donor) {
    console.log("❌ Donor not found for email:", normalizedEmail);
  }

  if (donor) {
  await DonorNotification.create({
  donorId: donor.userId,
  entity: "query",
  type: "query_raised",
  title: "Query Raised",
  message: `Your support request "${subject}" has been submitted successfully.`,
  reason: "Status: Pending", // 👈 this will show in box
});

    console.log("✅ Query Raised Notification Created");
  }
}

    res.status(201).json({ message: "Query sent successfully" });

  } catch (error) {
    console.error("Send Query Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2️⃣ Get All Queries (Admin)
exports.getAllQueries = async (req, res) => {
  try {
    const queries = await HelpQuery.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3️⃣ Reply to Query
exports.replyToQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const updatedQuery = await HelpQuery.findByIdAndUpdate(
      id,
      {
        reply,
        status: "resolved",
      },
      { new: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }

    console.log("Updated Query Role:", updatedQuery.role);

    // 🔔 Only for donor queries
    if (updatedQuery.role?.toLowerCase() === "donor") {

      const normalizedEmail = updatedQuery.email.trim().toLowerCase();

      console.log("Looking for donor with email:", normalizedEmail);

      const donor = await DonorProfile.findOne({
        email: normalizedEmail,
      });

      console.log("Donor found:", donor);

      if (!donor) {
        console.log("❌ Donor not found while replying");
      }

      if (donor) {
        await DonorNotification.create({
          donorId: donor.userId,
          entity: "query",
          type: "query_resolved",
          title: "Query Resolved",
          message: `Your support request "${updatedQuery.subject}" has been resolved.`,
          reason: reply,
        });

        console.log("✅ Query Resolved Notification Created");
      }
    }

    res.status(200).json(updatedQuery);

  } catch (error) {
    console.error("Reply Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4️⃣ Get Queries by Email
exports.getMyQueries = async (req, res) => {
  try {
    const { email } = req.params;
    const queries = await HelpQuery.find({ email }).sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};