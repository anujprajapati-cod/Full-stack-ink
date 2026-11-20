const cloudinary = require("cloudinary").v2;
require("dotenv").config();
function cloudinaryConfig() {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
      api_key: process.env.CLOUDINARY_API_KEY ,
      api_secret: process.env.CLOUDINARY_API_SECRET ,
    });
    console.log("cloudinary connected");
  } catch (error) {
    console.log("cloudinary config error", error.message);
  }
}

module.exports = cloudinaryConfig;
