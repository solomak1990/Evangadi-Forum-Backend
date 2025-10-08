
const dbConnection = require("../db/dbConfig"); 
const { StatusCodes } = require("http-status-codes");

//  POST — Submit an answer for a question
async function postAnswer(req, res) {
  // Allow questionid or question_id from the body
  const { questionid, question_id, answer } = req.body;
  const { userid } = req.user;

  // Determine the final question ID to use
  const finalQuestionId = question_id || questionid;

  //  Validate input
  if (!finalQuestionId || !answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide a question ID and an answer.",
    });
  }

  //  Validate answer length
  if (answer.length > 400) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Answer must be less than 400 characters.",
    });
  }

  try {
    // 1. Check if question exists
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

    // 2. Insert answer into the database.
    // The created_at field will be automatically populated by the DB trigger/default.
    await dbConnection.query(
      "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
      [userid, finalQuestionId, answer]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
    });
  } catch (error) {
    console.error(" Error posting answer:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      // Include the SQL error message if available for better debugging
      message: error.sqlMessage || "An unexpected error occurred.",
    });
  }
}



// GET — Retrieve all answers for a specific question
async function getAnswersForQuestion(req, res) {
  const { question_id } = req.params;

  try {
    // Ensure the question exists
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

    // Discover the timestamp column name in answers table
    const candidateColumns = [
      "created_at",
      "createdAt",
      "created_on",
      "createdOn",
      "answer_date",
      "date_added",
      "timestamp",
    ];

    const [existingCols] = await dbConnection.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_schema = DATABASE() AND table_name = 'answers' 
       AND column_name IN (${candidateColumns.map(() => "?").join(", ")})`,
      candidateColumns
    );

    const existingSet = new Set(existingCols.map((r) => r.column_name));
    const chosenTsCol = candidateColumns.find((c) => existingSet.has(c));

    // Build SQL using discovered timestamp column if available
    const tsSelect = chosenTsCol ? `a.${chosenTsCol} AS created_at` : `NULL AS created_at`;
    const orderBy = chosenTsCol ? `ORDER BY a.${chosenTsCol} DESC` : `ORDER BY a.answer_id DESC`;

    const sql = `
      SELECT
        a.answer_id AS answer_id,
        a.answer    AS content,
        u.user_name AS user_name,
        ${tsSelect}
      FROM answers a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.question_id = ?
      ${orderBy}
    `;

    const [answers] = await dbConnection.query(sql, [question_id]);

    return res.status(StatusCodes.OK).json({
      answers,
    });
  } catch (error) {
    console.error("❌ Error fetching answers:", error);
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
