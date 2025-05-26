// server.js

require("dotenv").config();
const app = require("./app");
const { getConnection } = require("./src/config/db");

// Handle uncaught exceptions (e.g., undefined variables)
process.on("uncaughtException", err => {
    console.error("UNCAUGHT EXCEPTION! Shutting down...");
    console.error(err.name, err.message);
    process.exit(1);
});

const PORT = process.env.PORT || 8080;

// Connect to DB first, then start server
getConnection()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server running at: http://localhost:${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", err => {
            console.error("UNHANDLED REJECTION! Shutting down...");
            console.error(err.name, err.message);
            server.close(() => process.exit(1));
        });

        // Graceful shutdown on termination
        process.on("SIGTERM", () => {
            console.log("SIGTERM RECEIVED. Shutting down gracefully");
            server.close(() => {
                console.log("Process terminated!");
            });
        });
    })
    .catch(err => {
        console.error("Failed to connect to DB. Exiting...");
        console.error(err);
        process.exit(1);
    });