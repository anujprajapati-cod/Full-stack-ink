const nodemailer = require("nodemailer");
require("dotenv").config();

const port = Number(process.env.TRANS_PORT || 465);
const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
        user: process.env.AUTH_USER,
        pass: process.env.AUTH_PASS
    }
});

module.exports = transporter;
