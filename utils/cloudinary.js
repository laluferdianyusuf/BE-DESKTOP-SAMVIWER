require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dnzvc4ivd",
  api_key: "936321676635275",
  api_secret: "QVclFt1K3jNnTwb4JYnTHTuTFQ4",
  secure: true,
});

module.exports = cloudinary;
