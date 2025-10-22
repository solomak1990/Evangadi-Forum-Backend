const dbConnection = require("../db/dbConfig.js");
const { StatusCodes } = require("http-status-codes");
const { randomUUID } = require("crypto");

// POST QUESTION
const askQuestion = async (req, res) => {
  const { title, description } = req.body;
  const user_id = req.user.userid;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    const question_id = randomUUID();
    await dbConnection.query(
      "INSERT INTO questions (question_id, user_id, title, description) VALUES (?, ?, ?, ?)",
      [question_id, user_id, title, description]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
      question_id,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// GET ALL QUESTIONS
const allQuestions = async (req, res) => {
  try {
    const [rows] = await dbConnection.query(`
      SELECT 
        q.question_id,
        q.title,
        q.description AS content,
        u.user_name
      FROM questions q
      JOIN users u ON q.user_id = u.user_id
      ORDER BY q.id DESC
    `);

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }

    return res.status(StatusCodes.OK).json({ questions: rows });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// GET SINGLE QUESTION
const singleQuestion = async (req, res) => {
  const { question_id } = req.params;
  console.log("Looking for question:", question_id);

  try {
    const [rows] = await dbConnection.query(
      "SELECT question_id, title, description AS content, user_id FROM questions WHERE question_id = ?",
      [question_id]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    return res.status(StatusCodes.OK).json({ question: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// EDIT QUESTION
const editQuestion = async (req, res) => {
  const user_id = req.user.userid;
  const { question_id } = req.params;
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "At least title or description is required",
    });
  }

  try {
    const [questionResult] = await dbConnection.query(
      "SELECT user_id FROM questions WHERE question_id = ?",
      [question_id]
    );

    if (questionResult.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: `No question found with id ${question_id}`,
      });
    }

    if (questionResult[0].user_id !== user_id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden",
        message: "You are not authorized to edit this question",
      });
    }

    const fields = [];
    const values = [];
    if (title) {
      fields.push("title = ?");
      values.push(title);
    }
    if (description) {
      fields.push("description = ?");
      values.push(description);
    }

    values.push(question_id);

    const updateQuery = `UPDATE questions SET ${fields.join(", ")} WHERE question_id = ?`;
    await dbConnection.query(updateQuery, values);

    return res.status(StatusCodes.OK).json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "Could not update the question.",
    });
  }
};

// DELETE QUESTION
const deleteQuestion = async (req, res) => {
  const user_id = req.user.userid; // logged-in user
  const { question_id } = req.params;

  try {
    // check if question exists
    const [questionResult] = await dbConnection.query(
      "SELECT user_id FROM questions WHERE question_id = ?",
      [question_id]
    );

    if (questionResult.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: `No question found with id ${question_id}`,
      });
    }

    // check if current user owns the question
    if (questionResult[0].user_id !== user_id) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not authorized to delete this question",
      });
    }

    // delete question
    await dbConnection.query("DELETE FROM questions WHERE question_id = ?", [
      question_id,
    ]);

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Error deleting question:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Could not delete the question",
    });
  }
};


module.exports = { askQuestion, allQuestions, singleQuestion, editQuestion,  deleteQuestion,};
