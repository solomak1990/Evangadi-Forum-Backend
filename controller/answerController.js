const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// Post an answer for a question
async function postAnswer(req, res) {
  const { questionid, answer } = req.body;
  const { userid } = req.user;

  // Validate required fields
  if (!questionid || !answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide question ID and answer",
    });
  }

  if (answer.length > 400) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Answer must be less than 400 characters",
    });
  }

  try {
    // Check if the question exists
    const [question] = await dbConnection.execute(
      "SELECT question_id FROM questions WHERE question_id = ?",
      [questionid]
    );

    if (question.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    // Insert the answer into the database
    await dbConnection.execute(
      "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
      [userid, questionid, answer]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// Get all answers for a specific question
async function getAnswersForQuestion(req, res) {
  const question_id = req.params.question_id;

  try {
    // Check if the question exists
    const [question] = await dbConnection.execute(
      "SELECT question_id FROM questions WHERE question_id = ?",
      [question_id]
    );

    if (question.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    // Get answers with user information
    const [answers] = await dbConnection.execute(
      `SELECT 
        a.answer_id, 
        a.answer AS content, 
        u.user_name, 
        a.created_at 
       FROM answers a 
       JOIN users u ON a.user_id = u.user_id 
       WHERE a.question_id = ? 
       ORDER BY a.created_at DESC`,
      [question_id]
    );

    return res.status(StatusCodes.OK).json({
      answers: answers,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = {
  postAnswer,
  getAnswersForQuestion,
};
