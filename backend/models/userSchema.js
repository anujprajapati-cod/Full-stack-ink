const mongoose = require("mongoose");
const Blog = require("./blogSchema");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        avatar: {
            type: String,
            default: ""
        },

        blogs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Blog"
            }
        ],

        savedBlogs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Blog"
            }
        ],
        verify:{
            type:Boolean,
            default:false,
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date
        
    },
    {
        timestamps: true
    }
);
const User = mongoose.model("User", userSchema);
module.exports=User;
