const mongoose = require("mongoose");
const User = require("./userSchema");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },
        blogId:{
        type:String,
        required:true,
        unique:true,
        },
        imageurl: {
            type: String,
            required: true
        },
       

        draft: {
            type: Boolean,
            default: false
        },

        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likes: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
]
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;