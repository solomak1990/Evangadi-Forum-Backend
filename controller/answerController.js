const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// POST — Submit an answer for a question
async function postAnswer(req, res) {
  const { questionid, question_id, answer } = req.body;
  const { userid } = req.user;
  const finalQuestionId = question_id || questionid;

  if (!finalQuestionId || !answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide a question ID and an answer.",
    });
  }

  if (answer.length > 400) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Answer must be less than 400 characters.",
    });
  }

  try {
    // Check if question exists
    const [questionRows] = await dbConnection.query(
      "SELECT question_id FROM questions WHERE question_id = ?",
      [finalQuestionId]
    );
    if (questionRows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    // Insert answer
    await dbConnection.query(
      "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
      [userid, finalQuestionId, answer]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
    });
  } catch (error) {
    console.error("❌ Error posting answer:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: error.sqlMessage || "An unexpected error occurred.",
    });
  }
}

// GET — Retrieve all answers for a specific question
async function getAnswersForQuestion(req, res) {
  const { question_id } = req.params;

  try {
    // Ensure question exists
    const [questionRows] = await dbConnection.query(
      "SELECT question_id FROM questions WHERE question_id = ?",
      [question_id]
    );
    if (questionRows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    // Fetch answers (order by answer_id descending = newest first)
    const [answers] = await dbConnection.query(
      `SELECT a.answer_id, a.answer AS content, a.user_id, u.user_name
       FROM answers a
       JOIN users u ON a.user_id = u.user_id
       WHERE a.question_id = ?
       ORDER BY a.answer_id DESC`,
      [question_id]
    );

    return res.status(StatusCodes.OK).json({ answers });
  } catch (error) {
    console.error("❌ Error fetching answers:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred while fetching answers.",
    });
  }
}

// PUT — Update an existing answer
async function updateAnswer(req, res) {
  const { answer_id } = req.params;
  const { answer } = req.body;
  const { userid } = req.user;

  if (!answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Answer content is required.",
    });
  }

  if (answer.length > 400) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Answer must be less than 400 characters.",
    });
  }

  try {
    const [answerRows] = await dbConnection.query(
      "SELECT user_id FROM answers WHERE answer_id = ?",
      [answer_id]
    );

    if (answerRows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "Answer not found.",
      });
    }

    if (answerRows[0].user_id !== userid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden",
        message: "You can only edit your own answers.",
      });
    }

    await dbConnection.query(
      "UPDATE answers SET answer = ? WHERE answer_id = ?",
      [answer, answer_id]
    );

    return res.status(StatusCodes.OK).json({
      message: "Answer updated successfully.",
    });
  } catch (error) {
    console.error("❌ Error updating answer:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: error.sqlMessage || "An unexpected error occurred.",
    });
  }
}

// DELETE — Delete an existing answer
async function deleteAnswer(req, res) {
  const { answer_id } = req.params;
  const { userid } = req.user;

  try {
    const [answerRows] = await dbConnection.query(
      "SELECT user_id FROM answers WHERE answer_id = ?",
      [answer_id]
    );

    if (answerRows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "Answer not found.",
      });
    }

    if (answerRows[0].user_id !== userid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden",
        message: "You can only delete your own answers.",
      });
    }

    await dbConnection.query("DELETE FROM answers WHERE answer_id = ?", [answer_id]);

    return res.status(StatusCodes.OK).json({
      message: "Answer deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting answer:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: error.sqlMessage || "An unexpected error occurred.",
    });
  }
}

module.exports = {
  postAnswer,
  getAnswersForQuestion,
  updateAnswer,
  deleteAnswer,
};
