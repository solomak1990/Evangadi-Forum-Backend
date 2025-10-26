const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../middleware/authMiddleware");

// User authentication routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/checkUser", auth, userController.checker);

// Password reset routes
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
