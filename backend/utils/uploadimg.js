const cloudinary = require("cloudinary").v2;

async function uploadimmage(imagepath) {
    const result = await cloudinary.uploader.upload(imagepath, {
        folder: "blog-app",
        timeout: 20000
    });
    return result.secure_url;
}

module.exports = uploadimmage;
