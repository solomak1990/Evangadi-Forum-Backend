// routes/answerRoute.js
const express = require("express");
const router = express.Router();
const answerController = require("../controller/answerController");
const auth = require("../middleware/authMiddleware");

router.get("/:question_id", answerController.getAnswersForQuestion);
router.post("/", auth, answerController.postAnswer);
router.put("/:answer_id", auth, answerController.updateAnswer);
router.delete("/:answer_id", auth, answerController.deleteAnswer);


module.exports = router;


