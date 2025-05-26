// src/middleware/verifyToken.js

const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // e.g., { id, email }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};