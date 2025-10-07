// routes/questionRoute.js
const express = require("express");
const router = express.Router();
const {
  askQuestion,
  allQuestions,
  singleQuestion,
  editQuestion,
} = require("../controller/questionController");
const authMiddleware = require("../middleware/authMiddleware");

// Public route - get all questions
router.get("/", allQuestions);

// Public route - get single question by id
router.get("/:question_id", singleQuestion);

// Protected route - ask (create) a new question
router.post("/", authMiddleware, askQuestion);

// Protected route - edit question (only owner)
router.put("/:question_id", authMiddleware, editQuestion);

module.exports = router;
