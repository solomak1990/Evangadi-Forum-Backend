// // routes/questionRoute.js
// const express = require("express");
// const router = express.Router();
// const {
//   askQuestion,
//   allQuestions,
//   singleQuestion,
//   editQuestion,
// } = require("../controller/questionController");
// const authMiddleware = require("../middleware/authMiddleware");

// // Public route - get all questions
// router.get("/", allQuestions);

// // Public route - get single question by id
// router.get("/:question_id", singleQuestion);

// // Protected route - ask (create) a new question
// router.post("/", authMiddleware, askQuestion);

// // Protected route - edit question (only owner)
// router.put("/:question_id", authMiddleware, editQuestion);

// module.exports = router;


// routes/questionRoute.js
const express = require("express");
const router = express.Router();

// Import controller functions
const {
  askQuestion,
  allQuestions,
  singleQuestion,
  editQuestion,
  deleteQuestion,
} = require("../controller/questionController"); // ✅ Make sure the folder is named 'controllers'

// Import authentication middleware
const authMiddleware = require("../middleware/authMiddleware");

// 🟢 Public route - Get all questions
router.get("/", allQuestions);

// 🟢 Public route - Get a single question by ID
router.get("/:id", singleQuestion); // ✅ Must match frontend's useParams()

// 🔒 Protected route - Ask (create) a new question
router.post("/", authMiddleware, askQuestion);

// 🔒 Protected route - Edit question (only by the owner)
router.put("/:id", authMiddleware, editQuestion);

// 🔒 Protected route - Delete question (only by the owner)
router.delete("/:id", authMiddleware, deleteQuestion);


// Protected route - delete question (only owner)
const { deleteQuestion } = require("../controller/questionController");

// Add this route at the end
router.delete("/:question_id", authMiddleware, deleteQuestion);


module.exports = router;

