require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL ,
  credentials: true,
}));
app.use(express.json());

const dbconnect = require("./config/dbconnect");
const userRoute = require("./routes/userroutes");
const blogRoute = require("./routes/blogroutes");
const cloudinaryConfig = require("./utils/cloudinary");

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Ink Backend API is running" });
});


app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute);

const PORT = process.env.PORT ;

async function startServer() {
  const requiredEnv = ["MONGO_URI", "JWT_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLIENT_URL", "HOST", "AUTH_USER", "AUTH_PASS"];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (missingEnv.length) throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);

  await dbconnect();
  cloudinaryConfig();
  app.listen(PORT, () => console.log(`server started on port ${PORT}`));
}

startServer().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
