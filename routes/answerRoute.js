// routes/answerRoute.js
const express = require("express");
const router = express.Router();
const answerController = require("../controller/answerController");
const auth = require("../middleware/authMiddleware");

router.get("/:question_id", answerController.getAnswersForQuestion);
router.post("/", auth, answerController.postAnswer);

module.exports = router;
