const mongoose = require("mongoose");
require("dotenv").config();
async function dbconnect() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI must be configured in the environment");
    await mongoose.connect(uri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
}

module.exports = dbconnect;
