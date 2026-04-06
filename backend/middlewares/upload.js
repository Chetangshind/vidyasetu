// middlewares/upload.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
params: async (req, file) => ({
  folder: "vidyasetu",
  allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  resource_type: "auto",
  public_id: file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_"),
}),
});

module.exports = multer({ storage });