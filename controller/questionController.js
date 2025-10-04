const dbConnection = require("../db/dbConfig.js");
const { StatusCodes } = require("http-status-codes");

// ** POST QUESTION Handler **
const askQuestion = async (req, res) => {
  const { title, description } = req.body;
  const userid = req.user.userid;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    await dbConnection.query(
      "INSERT INTO questions (userid, title, description) VALUES (?, ?, ?)",
      [userid, title, description]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// ** GET ALL QUESTIONS Handler **
const allQuestions = async (req, res) => {
  try {
    const query = `
      SELECT q.*, u.username, u.email 
      FROM questions q
      JOIN users u ON q.userid = u.userid
      ORDER BY q.questionid DESC;

    
    `;
    const [rows] = await dbConnection.query(query);

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }

    return res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "Could not fetch questions.",
    });
  }
};

// ** GET SINGLE QUESTION Handler **
const singleQuestion = async (req, res) => {
  const { questionid } = req.params;

  try {
    const [rows] = await dbConnection.query(
      "SELECT * FROM questions WHERE questionid = ?",
      [questionid]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: `No question found with id ${questionid}`,
      });
    }

    return res.status(StatusCodes.OK).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "Could not fetch the question.",
    });
  }
};

// ** EDIT QUESTION Handler **
const editQuestion = async (req, res) => {
  const userid = req.user.userid;
  const { questionid } = req.params;
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "At least title or description is required",
    });
  }

  try {
    const [questionResult] = await dbConnection.query(
      "SELECT userid FROM questions WHERE questionid = ?",
      [questionid]
    );
    if (questionResult.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: `No question found with id ${questionid}`,
      });
    }
    if (questionResult[0].userid !== userid) {
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

    values.push(questionid);

    const updateQuery = `UPDATE questions SET ${fields.join(
      ", "
    )} WHERE questionid = ?`;

    const [updateResult] = await dbConnection.query(updateQuery, values);

    if (updateResult.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: `No question found with id ${questionid}`,
      });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Question updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "Could not update the question.",
    });
  }
};

module.exports = {
  askQuestion,
  allQuestions,
  singleQuestion,
  editQuestion,
};
