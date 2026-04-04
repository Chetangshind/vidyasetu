const express = require("express");
console.log("🔒 authRoutes.js loaded");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");

const DonorProfile = require("../models/DonorProfile");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= GOOGLE LOGIN =================
router.post("/google-login", async (req, res) => {
  try {
    const { credential, role } = req.body;
    console.log("🟡 Google login attempt for role:", role);

    if (!credential || !role) {
      console.log("❌ Missing credential or role");
      return res.status(400).json({ msg: "Missing data" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("❌ GOOGLE_CLIENT_ID is not defined in backend .env");
      return res.status(500).json({ msg: "Server misconfiguration: Google Client ID missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    console.log("✅ Google token verified for email:", email);

    const collectionName = `${role}.users`;
    const collection = mongoose.connection.collection(collectionName);

    let user = await collection.findOne({ email });

    if (!user) {
      console.log("🟡 Creating new user for:", email);
      const insertResult = await collection.insertOne({
        name,
        email,
        role,
        status: role === "donor" ? "Active" : "active",
        warnings: 0,
        suspendedUntil: null,
        createdAt: new Date(),
      });
      user = { _id: insertResult.insertedId, name, email, role, status: role === "donor" ? "Active" : "active" };

      if (role === "donor") {
        try {
          await DonorProfile.create({
            userId: user._id,
            email,
            fullName: name,
            organization: "Self / Independent",
            documents: [],
            status: "Active",
            warningCount: 0,
          });
        } catch (profileErr) {
          console.error("⚠️ DonorProfile creation failed during Google login:", profileErr.message);
        }
      }
    }

    // Standardized status check (case insensitive)
    const status = user.status ? user.status.toLowerCase() : "active";

    if (status === "blacklisted") {
      return res.status(403).json({ msg: "Your account has been permanently banned." });
    }

    if (status === "suspended") {
      if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
        await collection.updateOne(
          { _id: user._id },
          { $set: { status: role === "donor" ? "Active" : "active", suspendedUntil: null, warnings: 0 } }
        );
      } else {
        return res.status(403).json({ msg: "Your account is suspended." });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Google login successful for:", email);
    return res.json({
      msg: "Login successful",
      token,
      role: user.role || role,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Google Login error:", err);
    return res.status(500).json({ msg: "Google login failed: " + (err.message || "Internal server error") });
  }
});


// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ BASIC VALIDATION
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!["student", "donor"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }

    // ❌ ADMIN CANNOT SIGNUP
    if (role === "admin") {
      return res.status(403).json({ msg: "Admin cannot signup" });
    }

    const collectionName = `${role}.users`;
    const collection = mongoose.connection.collection(collectionName);

    const existing = await collection.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const insertResult = await collection.insertOne({
      name,
      email,
      password: hash,
      role,
      status: "active",
      warnings: 0,
      suspendedUntil: null,
      createdAt: new Date(),
    });

    const user = {
      _id: insertResult.insertedId,
      name,
      email,
      role,
    };

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 SAFE DONOR PROFILE CREATION
    if (role === "donor") {
      try {
        const exists = await DonorProfile.findOne({ userId: user._id });

        if (!exists) {
          await DonorProfile.create({
            userId: user._id,
            email: user.email,
            fullName: user.name,
            organization: "Self / Independent",
            documents: [],
            status: "Active",
            warningCount: 0,
          });
        }
      } catch (err) {
        console.error("⚠️ DonorProfile creation failed:", err.message);
      }
    }

    return res.json({
      msg: "Signup successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ================= CHANGE PASSWORD =================
router.put("/change-password", async (req, res) => {
  try {
    const { userId, role, currentPassword, newPassword } = req.body;

    const collectionName = `${role}.users`;
    const collection = mongoose.connection.collection(collectionName);

    const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Current password incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await collection.updateOne(
      { _id: user._id },
      { $set: { password: hash } }
    );

    return res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.error("❌ Change password error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE ACCOUNT =================
router.delete("/delete-account", async (req, res) => {
  try {
    const { userId, role, password } = req.body;

    const collectionName = `${role}.users`;
    const collection = mongoose.connection.collection(collectionName);

    const user = await collection.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    await collection.deleteOne({
      _id: user._id,
    });

    return res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Delete account error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password, role, captchaText, captchaToken } = req.body;

    // 🟡 CAPTCHA REQUIRED
    if (!captchaText || !captchaToken) {
      return res.status(400).json({ msg: "Required Captcha." });
    }

    let decoded;
    try {
      decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ msg: "Error: captcha is not valid." });
    }

    if (decoded.text.toLowerCase() !== captchaText.toLowerCase()) {
      return res.status(400).json({ msg: "Error: captcha is not valid." });
    }

    if (!email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const collectionName = `${role}.users`;
    const collection = mongoose.connection.collection(collectionName);

    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    // 🚫 Block Blacklisted
if (user.status === "blacklisted") {
  return res.status(403).json({
    msg: "Your account has been permanently banned.",
  });
}

// 🚫 Handle Suspension
if (user.status === "suspended") {
  // ⏳ If suspension expired → auto restore
  if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          status: "active",
          suspendedUntil: null,
          warnings: 0,
        },
      }
    );
  } else {
    const remainingMs =
      new Date(user.suspendedUntil) - new Date();
    const remainingDays = Math.ceil(
      remainingMs / (1000 * 60 * 60 * 24)
    );

    return res.status(403).json({
      msg:
        user.warnings >= 3
          ? `You received 3 warnings and did not correct the issues. Your account is suspended for ${remainingDays} more day(s).`
          : `Your account is suspended. Try again in ${remainingDays} day(s).`,
    });
  }
}

    // 🚨 CHECK DONOR PROFILE STATUS
    if (role === "donor") {
      const donorProfile = await DonorProfile.findOne({
        userId: user._id,
      });

      if (donorProfile) {
        if (donorProfile.status === "Suspended") {
          return res.status(403).json({
            msg: "Your account has been suspended by admin.",
          });
        }
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      msg: "Login successful",
      token,
      role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;