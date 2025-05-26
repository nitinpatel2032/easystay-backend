// app.js

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const userRoutes = require("./src/routes/userRoute");
const sellerRoutes = require("./src/routes/sellerRoute");
const AppError = require("./src/utils/AppError");
const logger = require("./src/utils/logger");
const { getConnection } = require("./src/config/db");
const optionalAuth = require("./src/middleware/optionalAuth");

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(helmet());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(optionalAuth);

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

// Request logger (after parsing JSON/body)
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.originalUrl,
        user: req.user?.id || 'Guest',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        time: new Date().toISOString(),
    });
    next();
});

// ----------------------
// Routes
// ----------------------
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1//sellers", sellerRoutes);

app.get("/health", async (req, res) => {
    try {
        await getConnection();
        res.status(200).send("Healthy");
    } catch {
        res.status(500).send("Unhealthy");
    }
});

// ----------------------
// 404 Handler
// ----------------------
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ----------------------
// Global Error Handler
// ----------------------
app.use((err, req, res, next) => {
    console.error("Error: ", err);
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Internal Server Error";

    res.status(statusCode).json({
        status: err.status || "error",
        message,
    });
});

module.exports = app;