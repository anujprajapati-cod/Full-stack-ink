const { verifytoken } = require("../utils/generatetoken");

const verifyuser = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Please sign in"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please sign in"
            });
        }

        const user = await verifytoken(token);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.user = user;

        console.log("User verified:", user);

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

const optionalVerifyUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ success: false, message: "Invalid authorization header" });
    }

    const user = await verifytoken(token);
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = user;
    return next();
};

module.exports = verifyuser;
module.exports.optionalVerifyUser = optionalVerifyUser;
