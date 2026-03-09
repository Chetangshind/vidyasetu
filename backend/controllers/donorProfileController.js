const DonorProfile = require("../models/DonorProfile");

// ================= GET PROFILE =================
exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await DonorProfile.findOne({ userId: req.user.id });

    res.json({
      ...(donor ? donor.toObject() : {}),
      email: req.user.email,
    });
  } catch (err) {
    console.error("❌ Get donor profile error", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= SAVE / UPDATE PROFILE =================
exports.saveDonorProfile = async (req, res) => {
  try {
    const donor = await DonorProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          fullName: req.body.fullName,
          phone: req.body.phone,
          dob: req.body.dob,
          gender: req.body.gender,
          occupation: req.body.occupation,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          location: req.body.location,
          organization: req.body.organization,
          aadhaar: req.body.aadhaar,
          pan: req.body.pan,
          documents: req.body.documents,
          email: req.user.email,
        },
        $setOnInsert: {
          userId: req.user.id,
        },
      },
      { new: true, upsert: true }
    );

    res.json(donor);
  } catch (err) {
    console.error("❌ Save donor profile error", err);
    res.status(500).json({ message: err.message });
  }
};
