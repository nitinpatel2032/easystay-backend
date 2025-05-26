// src/config/db.js

const sql = require("mssql");

// Validate required environment variables
["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_NAME", "DB_PORT"].forEach(key => {
    if (!process.env[key]) {
        console.error(`Missing environment variable: ${key}`);
        process.exit(1);
    }
});

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: true, // Set true for Azure or public access
        trustServerCertificate: true, // use false in production with verified cert
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool;

const getConnection = async () => {
    try {
        if (!pool || !pool.connected) {
            pool = await sql.connect(config);
            console.log("DB Connected");
        }
        return pool;
    } catch (err) {
        console.error("DB connection failed:", err);
        throw err;
    }
};

const closeConnection = async () => {
    if (pool && pool.connected) {
        await pool.close();
        console.log("DB Connection closed.");
    }
};

module.exports = { sql, getConnection, closeConnection };