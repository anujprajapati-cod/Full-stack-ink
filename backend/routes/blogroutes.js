const express = require("express");
const route=express.Router();
const { getBlog, createBlog, deleteBlog, updateBlog, getBlogbyid, likeBlog, saveBlog, commentBlog, getComments } = require("../controllers/blogcontroller");
const verifyuser = require("../middleware/auth");
const optionalVerifyUser = verifyuser.optionalVerifyUser;
const upload = require("../utils/multer");
route.post("/blogs", verifyuser, upload.single("image"), createBlog);
route.get("/blogs", getBlog );
route.get("/blogs/:id", optionalVerifyUser, getBlogbyid)
route.delete("/blogs/:id",verifyuser, deleteBlog );
route.patch("/blogs/:id", verifyuser, upload.single("image"), updateBlog );
route.patch("/blogs/like/:id", verifyuser, likeBlog);
route.patch("/blogs/save/:id", verifyuser, saveBlog);
route.post("/blogs/:id", verifyuser,commentBlog);
route.get("/blogs/:id/comments", optionalVerifyUser, getComments);
module.exports=route;
