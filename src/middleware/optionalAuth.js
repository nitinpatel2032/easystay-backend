// src/middleware/optionalAuth.js
const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return next(); // Proceed unauthenticated

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // { id }
    } catch (err) {
        req.user = undefined; // as guest
    }

    next();
};