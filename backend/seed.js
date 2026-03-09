const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const adminCollection = mongoose.connection.collection("admin.users");

  const email = "xyz";
  const password = "xyz";

  const existing = await adminCollection.findOne({ email });

  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await adminCollection.insertOne({
      name: "Admin",
      email,
      password: hash,
      role: "admin",
    });

    console.log("🌱 Admin created");
  } else {
    console.log("🔁 Admin already exists");
  }

  console.log("✔ Done");
  process.exit();
}

seed();
