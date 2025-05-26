// src/models/userModel.js 

const { getConnection, sql } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create user 
exports.createUser = async ({ username, email, password }) => {
    const pool = await getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.request()
        .input("username", sql.VarChar, username)
        .input("email", sql.VarChar, email)
        .input("password", sql.NVarChar, hashedPassword)
        .output("response", sql.VarChar(100))
        .execute("createUser");

    const message = result.output.response;
    const user = result.recordset?.[0];

    return {
        success: !!user,
        message,
        user: user ? { id: user.id, username: user.username, email: user.email } : null
    };
};

// Get all users 
exports.getUser = async () => {
    const pool = await getConnection();
    const result = await pool.request().execute("getAllUsers");
    return result.recordset;
};

// Login 
exports.login = async ({ email, password, googleId, username }) => {
    const pool = await getConnection();

    const result = await pool.request()
        .input("email", sql.VarChar, email || null)
        .input("password", sql.VarChar, password || null)
        .input("googleId", sql.VarChar, googleId || null)
        .input("username", sql.VarChar, username || null)
        .output("response", sql.VarChar(1000))
        .execute("login");

    const userRecord = result.recordset?.[0];
    const responseMsg = result.output.response;

    if (email && password) {
        if (!userRecord || !userRecord.password) {
            return { success: false, message: responseMsg || "Invalid credentials", user: null };
        }

        const isMatch = await bcrypt.compare(password, userRecord.password);
        if (!isMatch) {
            return { success: false, message: "Incorrect password", user: null };
        }

        const token = jwt.sign({ id: userRecord.id, email: userRecord.email }, process.env.JWT_SECRET_KEY, { expiresIn: "8h" });

        return {
            success: true,
            message: "Login successful",
            token,
            user: {
                id: userRecord.id,
                username: userRecord.username || null,
                email: userRecord.email
            }
        };
    }

    if (email && googleId) {
        if (!userRecord) {
            return { success: false, message: responseMsg || "Login failed", user: null };
        }

        const token = jwt.sign({ id: userRecord.id, email: userRecord.email }, process.env.JWT_SECRET_KEY, { expiresIn: "8h" });

        return {
            success: true,
            message: responseMsg,
            token,
            user: {
                id: userRecord.id,
                username: userRecord.username,
                email: userRecord.email,
                googleId: userRecord.googleId
            }
        };
    }

    return { success: false, message: "Unsupported login action", user: null };
};

exports.getUserById = async (id) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .execute("getUserById");

    const user = result.recordset?.[0];

    return user ? {
        id: user.id,
        username: user.username,
        email: user.email
    } : null;
};