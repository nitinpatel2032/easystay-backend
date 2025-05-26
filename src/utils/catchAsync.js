// src/utils/catchAsync.js

/**
 * Wraps an async route handler and forwards errors to Express error middleware.
 * @param {Function} fn - Async Express route handler
 * @returns {Function} Middleware-safe handler
 */
module.exports = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};