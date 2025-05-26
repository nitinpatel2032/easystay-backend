// src/routes/userRoute.js

const express = require("express");
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/add", userController.addUser);
router.post("/login", userController.userLogin);
router.get("/me", verifyToken, userController.getMe);
router.post("/logout", verifyToken, userController.logout);
router.get("/user-list", verifyToken, userController.getUser);

module.exports = router;