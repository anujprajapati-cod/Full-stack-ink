const fs = require("fs");
const mongoose = require("mongoose");
const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const Comment = require("../models/commentSchema");
const uploadimmage = require("../utils/uploadimg");

async function createBlog(req, res) {
    try {

        const { title, description, draft } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "title is required"
            });
        }

        if (!description?.trim()) {
            return res.status(400).json({
                success: false,
                message: "description is required"
            });
        }

        const creator = req.user.id;

        
        const blogId =
            title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
            "-" +
            Date.now();

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "image is required"
            });
        }

        const user = await User.findById(creator);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "You are not a valid user"
            });
        }

        const url = await uploadimmage(req.file.path);
        fs.unlink(req.file.path, () => {});

        const blog = await Blog.create({
            blogId,
            title: title.trim(),
            description: description.trim(),
            draft: draft === true || draft === "true",
            creator,
            imageurl: url
        });

        await User.findByIdAndUpdate(
            creator,
            {
                $push: {
                    blogs: blog._id
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: "blog created successfully",
            blog
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
 async function getBlog(req,res) {
    try{
         const blog=await Blog.find({draft:false}).populate({path:"creator",select:"name email"});
         return res.status(200).json({
            success:true,
            message:"blogs are fetched succesfully",
            blog
         })
    }
    catch(error){
          return res.status(500).json({
            message:error.message
          })
    }
 }
 async function getBlogbyid(req, res) {
    try {
        const { id } = req.params;

        const query = mongoose.isObjectIdOrHexString(id) ? { _id: id } : { blogId: id };
        const blog = await Blog.findOne(query).populate("creator", "name email");

        if (!blog) {
            return res.status(400).json({
                success: false,
                message: "Blog are not present"
            });
        }

        if (blog.draft && blog.creator._id.toString() !== req.user?.id?.toString()) {
            return res.status(404).json({ success: false, message: "Blog is not present" });
        }

        return res.status(200).json({
            success: true,
            message: "blog fetched successfully",
            blog
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}
async function updateBlog(req, res) {

    try {

        const { id } = req.params;

        const { title, description, draft } = req.body;

        
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog is not present"
            });
        }

       
        if (blog.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this blog"
            });
        }

       
        const changes = {};
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ success: false, message: "title is required" });
            }
            changes.title = title.trim();
        }
        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({ success: false, message: "description is required" });
            }
            changes.description = description.trim();
        }
        if (draft !== undefined) changes.draft = draft === true || draft === "true";

        if (req.file) {
            const imageUrl = await uploadimmage(req.file.path);
            changes.imageurl = imageUrl;
            fs.unlink(req.file.path, () => {});
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            changes,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: updatedBlog
        });

    } catch (error) {
        // Remove a locally uploaded file if Cloudinary upload/update fails.
        if (req.file?.path) fs.unlink(req.file.path, () => {});
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
async function deleteBlog(req, res) {

    try {

        const { id } = req.params;

        
        const query = mongoose.isObjectIdOrHexString(id) ? { _id: id } : { blogId: id };
        const blog = await Blog.findOne(query);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog is not present"
            });
        }

       
        if (blog.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this blog"
            });
        }

        const blogMongoId = blog._id;

       
        await Promise.all([
            Blog.findByIdAndDelete(blogMongoId),
            User.findByIdAndUpdate(req.user.id, { $pull: { blogs: blogMongoId } }),
            Comment.deleteMany({ blog: blogMongoId })
        ]);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}
async function likeBlog(req, res) {

    try {

        const { id } = req.params;

        
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog is not present"
            });
        }

        if (blog.draft && blog.creator.toString() !== req.user.id.toString()) {
            return res.status(404).json({ success: false, message: "Blog is not present" });
        }

        
        const userId = req.user.id;

        
        const alreadyLiked = blog.likes.some(
            (user) => user.toString() === userId.toString()
        );

        if (alreadyLiked) {

            
            blog.likes = blog.likes.filter(
                (user) => user.toString() !== userId.toString()
            );

            await blog.save();

            return res.status(200).json({
                success: true,
                message: "Blog unliked successfully",
                blog
            });

        } else {

            
            blog.likes.push(userId);

            await blog.save();

            return res.status(200).json({
                success: true,
                message: "Blog liked successfully",
                blog
            });
        }

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}
async function saveBlog(req, res) {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog is not present" });
        }

        if (blog.draft && blog.creator.toString() !== req.user.id.toString()) {
            return res.status(404).json({ success: false, message: "Blog is not present" });
        }

        const user = await User.findById(req.user.id);
        const alreadySaved = user.savedBlogs.some(
            (blogId) => blogId.toString() === blog._id.toString()
        );

        if (alreadySaved) {
            user.savedBlogs = user.savedBlogs.filter(
                (blogId) => blogId.toString() !== blog._id.toString()
            );
        } else {
            user.savedBlogs.push(blog._id);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: alreadySaved ? "Blog removed from saved list" : "Blog saved successfully",
            saved: !alreadySaved,
            savedBlogs: user.savedBlogs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
async function commentBlog(req, res) {
    try {

        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog is not present"
            });
        }

        if (blog.draft && blog.creator.toString() !== req.user.id.toString()) {
            return res.status(404).json({ success: false, message: "Blog is not present" });
        }

        const comment = await Comment.create({
            content: content.trim(),
            author: req.user.id,
            blog: req.params.id
        });

        const populatedComment = await Comment.findById(comment._id).populate(
            "author",
            "name"
        );

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}
async function getComments(req, res) {
    try {

        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog || (blog.draft && blog.creator.toString() !== req.user?.id?.toString())) {
            return res.status(404).json({ success: false, message: "Blog is not present" });
        }

        const comments = await Comment.find({
            blog: id
        })
            .populate("author", "name")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            comments
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}
  
module.exports={createBlog,getBlog,getBlogbyid,updateBlog,deleteBlog,likeBlog,saveBlog,commentBlog, getComments}
