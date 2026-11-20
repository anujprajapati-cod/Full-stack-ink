const express = require("express");
const route=express.Router()
const {
  createUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  login,
  getProfile,
  updateProfile
} = require("../controllers/usercontroller");
const verifyuser = require("../middleware/auth");
const upload = require("../utils/multer");
route.post("/signup", createUser);
route.get("/verify-email/:token", verifyEmail);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password/:token", resetPassword);
route.post("/signin", login);
route.get("/profile", verifyuser, getProfile);
route.patch("/profile", verifyuser, upload.single("avatar"), updateProfile);
module.exports=route;
