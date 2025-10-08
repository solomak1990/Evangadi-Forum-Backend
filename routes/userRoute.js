// routes/userRoute.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/checkUser", auth, userController.checker);

module.exports = router;
