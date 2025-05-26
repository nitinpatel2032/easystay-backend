// src/controllers/userController.js 

const userModels = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Add user
exports.addUser = catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return next(new AppError("username, email and password are required", 400));
    }

    const { message, user } = await userModels.createUser({ username, email, password });

    if (!user) {
        return next(new AppError(message || "User already exists", 400));
    }

    res.status(201).json({
        status: "success",
        message,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});

// Get all users
exports.getUser = catchAsync(async (req, res, next) => {
    const users = await userModels.getUser();

    res.status(200).json({
        status: "success",
        message: "Fetched users successfully",
        users
    });
});

// User login
exports.userLogin = catchAsync(async (req, res, next) => {
    const { email, password, googleId, username } = req.body;

    const loginResult = await userModels.login({ email, password, googleId, username });

    if (!loginResult.success) {
        return next(new AppError(loginResult.message, 401));
    }

    const { token, user } = loginResult;

    // Set token as HTTP-only secure cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: true, //process.env.NODE_ENV === 'production',
        sameSite: 'None', // use 'Lax' if frontend/backend are same-site
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    res.status(200).json({
        status: "success",
        message: loginResult.message,
        user
    });
});

// Get Me
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await userModels.getUserById(req.user.id);

    if (!user) return next(new AppError("User not found", 404));

    res.status(200).json({
        status: "success",
        user
    });
});

// Logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true, //process.env.NODE_ENV === 'production',
        sameSite: 'None'
    });

    res.status(200).json({ message: 'Logged out successfully' });
});