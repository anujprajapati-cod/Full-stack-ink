const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in the environment");
}
async function generateJWT(payload, expiresIn = "7d") {
  let token = await jwt.sign(payload, JWT_SECRET, { expiresIn });
  return token;
}

async function verifytoken(token) {
  try {
    let isvalid = await jwt.verify(token, JWT_SECRET);
    return isvalid;
  } catch (err) {
    return false;
  }
}

module.exports = { generateJWT, verifytoken };
