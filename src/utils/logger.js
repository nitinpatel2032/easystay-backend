// src/utils/logger.js

const { createLogger, format, transports } = require("winston");
const path = require("path");

// Define log format
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Capture error stack trace
    format.splat(),
    format.json()
);

// Create logger
const logger = createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new transports.File({ filename: path.join("logs", "error.log"), level: "error" }),
        new transports.File({ filename: path.join("logs", "all.log") })
    ],
});

// In development, log to console with colorized output
if (process.env.NODE_ENV === "development") {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp, stack }) => {
                return `${timestamp} ${level}: ${stack || message}`;
            })
        )
    }));
}

// Optional: For production, enable daily rotation (commented)
/*
const DailyRotateFile = require('winston-daily-rotate-file');
logger.add(new DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
}));
*/

module.exports = logger;