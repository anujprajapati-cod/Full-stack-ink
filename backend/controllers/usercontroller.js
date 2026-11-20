const fs = require("fs");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateJWT, verifytoken } = require("../utils/generatetoken");
const uploadimmage = require("../utils/uploadimg");
const  transporter  = require("../utils/transporter");
require("dotenv").config();

async function createUser(req, res) {
    const { name, email, password } = req.body;
    let createdUserId;

    try {
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter your name"
            });
        }

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email"
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Please enter a password"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const check = await User.findOne({ email: normalizedEmail });
        if (check) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });
        createdUserId = user._id;
        const verificationtoken = await generateJWT({ email: user.email, id: user._id });
        // const newUser = {
        //     _id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     avatar: user.avatar,
        //     token
        // };
        await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.AUTH_USER,
        to:user.email,
        subject:"email verifiction",
        text:"pls verify your email",
        html:`<h1>click on the link to verify your email</h1>
        <a href="${(process.env.CLIENT_URL ).replace(/\/$/, "")}/verify-email/${encodeURIComponent(verificationtoken)}">verify Your email</a>`
        })

        return res.status(201).json({
            success: true,
            message: "Check your email to verify your account",
        });

    } catch (err) {
        if (createdUserId) {
            await User.findByIdAndDelete(createdUserId).catch(() => {});
        }
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: err.message
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const payload = await verifytoken(req.params.token);
        if (!payload?.id || !payload.email) {
            return res.status(400).json({ success: false, message: "Verification link is invalid or expired" });
        }

        const user = await User.findOne({ _id: payload.id, email: payload.email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.verify = true;
        await user.save();

        const token = await generateJWT({ id: user._id, email: user.email });
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Email verification failed" });
    }
}

async function forgotPassword(req, res) {
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
        return res.status(400).json({ success: false, message: "Please enter your email" });
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
            const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.AUTH_USER,
                    to: user.email,
                    subject: "Reset your Ink password",
                    text: `Reset your password using this link (valid for 15 minutes): ${resetUrl}`,
                    html: `<p>Use the link below to reset your Ink password. It expires in 15 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`
                });
            } catch (mailError) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                throw mailError;
            }
        }

        return res.status(200).json({
            success: true,
            message: "If an account exists for that email, a password reset link has been sent."
        });
    } catch (error) {
        console.error("Password reset email failed:", error.message);
        return res.status(500).json({ success: false, message: "Could not send the reset email. Please try again." });
    }
}

async function resetPassword(req, res) {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Reset link is invalid or expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const token = await generateJWT({ id: user._id, email: user.email });
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Password reset failed" });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "enter email for login"
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "enter password"
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const findemail = await User.findOne({ email: normalizedEmail });

        if (!findemail) {
            return res.status(400).json({
                success: false,
                message: "user not exist"
            });
        }

        if (!findemail.verify) {
            return res.status(403).json({ success: false, message: "Please verify your email before signing in" });
        }

        const isMatch = await bcrypt.compare(password, findemail.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "wrong password"
            });
        }

        
        const token = await generateJWT({
            email: findemail.email,
            id: findemail._id
        });

        const user = {
            _id: findemail._id,
            name: findemail.name,
            email: findemail.email,
            avatar: findemail.avatar,
            token: token
        };

        return res.status(200).json({
            success: true,
            message: "user login successfully",
            user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate({
                path: "blogs",
                select: "blogId title description imageurl createdAt draft"
            })
            .populate({
                path: "savedBlogs",
                select: "blogId title description imageurl createdAt creator",
                populate: {
                    path: "creator",
                    select: "name avatar"
                }
            });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        const changes = {};

        if (req.body.name !== undefined) {
            if (!req.body.name.trim()) {
                return res.status(400).json({ success: false, message: "Name is required" });
            }
            changes.name = req.body.name.trim();
        }

        if (req.file) {
            changes.avatar = await uploadimmage(req.file.path);
            fs.unlink(req.file.path, () => {});
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            changes,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        if (req.file?.path) fs.unlink(req.file.path, () => {});
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    login,
    getProfile,
    updateProfile
};
