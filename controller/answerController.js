// const dbConnection = require("../db/dbConfig");
// const { StatusCodes } = require("http-status-codes");

// // Post an answer for a question
// async function postAnswer(req, res) {
//   const { questionid, question_id, answer } = req.body;
//   const { userid } = req.user;

//   // Validate required fields
//   if ((!questionid && !question_id) || !answer) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       error: "Bad Request",
//       message: "Please provide answer",
//     });
//   }

//   if (answer.length > 400) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       error: "Bad Request",
//       message: "Answer must be less than 400 characters",
//     });
//   }

//   try {
//     // Resolve string questionid from either numeric question_id or provided questionid
//     let stringQuestionId = questionid;

//     if (!stringQuestionId && question_id) {
//       // client sent numeric id per docs
//       const [rows] = await dbConnection.execute(
//         "SELECT question_id FROM questions WHERE id = ?",
//         [question_id]
//       );
//       if (rows.length === 0) {
//         return res.status(StatusCodes.NOT_FOUND).json({
//           error: "Not Found",
//           message: "The requested question could not be found.",
//         });
//       }
//       stringQuestionId = rows[0].questionid;
//     }

//     // If provided value looks numeric, treat it as integer PK and translate
//     if (stringQuestionId && /^[0-9]+$/.test(String(stringQuestionId))) {
//       const [rows] = await dbConnection.execute(
//         "SELECT question_id FROM questions WHERE id = ?",
//         [stringQuestionId]
//       );
//       if (rows.length === 0) {
//         return res.status(StatusCodes.NOT_FOUND).json({
//           error: "Not Found",
//           message: "The requested question could not be found.",
//         });
//       }
//       stringQuestionId = rows[0].questionid;
//       console.log("Step 1: received body", req.body);
//       console.log("Step 2: resolved question id", stringQuestionId);

//     }

//     // Ensure question exists by string questionid
//     const [question] = await dbConnection.execute(
//       "SELECT question_id FROM questions WHERE questionid = ?",
//       [stringQuestionId]
//     );
//     if (question.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }

//     // Insert the answer into the database
//     await dbConnection.execute(
//       "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
//       [userid, stringQuestionId, answer]
//     );

//     return res.status(StatusCodes.CREATED).json({
//       message: "Answer posted successfully",
//     });
//   } catch (error) {
//     console.error(error.message);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Internal Server Error",
//       message: "An unexpected error occurred.",
//     });
//   }
// }

// // Get all answers for a specific question
// async function getAnswersForQuestion(req, res) {
//   const question_id = req.params.question_id; // integer id from docs

//   try {
//     // Translate integer id to string questionid
//     const [qRows] = await dbConnection.execute(
//       "SELECT question_id FROM questions WHERE id = ?",
//       [question_id]
//     );
//     if (qRows.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }
//     const stringQuestionId = qRows[0].questionid;

//     // Get answers with user information
//     const [answers] = await dbConnection.execute(
//       `SELECT 
//         a.answerid AS answer_id,
//         a.answer AS content,
//         u.username AS user_name,
//         a.created_at
//        FROM answers a
//        JOIN users u ON a.userid = u.userid
//        WHERE a.questionid = ?
//        ORDER BY a.created_at DESC`,
//       [stringQuestionId]
//     );

//     return res.status(StatusCodes.OK).json({
//       answers: answers,
//     });
//   } catch (error) {
//     console.error(error.message);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Internal Server Error",
//       message: "An unexpected error occurred.",
//     });
//   }
// }

// module.exports = {
//   postAnswer,
//   getAnswersForQuestion,
// };


const dbConnection = require("../db/dbConfig"); // Assumes this exports a mysql2 promise-enabled pool
const { StatusCodes } = require("http-status-codes");

// ✅ POST — Submit an answer for a question
async function postAnswer(req, res) {
  // Allow questionid or question_id from the body
  const { questionid, question_id, answer } = req.body;
  const { userid } = req.user;

  // Determine the final question ID to use
  const finalQuestionId = question_id || questionid;

  // 🧩 Validate input
  if (!finalQuestionId || !answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide a question ID and an answer.",
    });
  }

  // 🧩 Validate answer length
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
    console.error("❌ Error posting answer:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      // Include the SQL error message if available for better debugging
      message: error.sqlMessage || "An unexpected error occurred.",
    });
  }
}



// ✅ GET — Retrieve all answers for a specific question
async function getAnswersForQuestion(req, res) {
  const { question_id } = req.params;

  try {
    // 1. Verify question exists
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

    // 2. Fetch answers with user info and use the correct 'created_at' column
    const [answers] = await dbConnection.query(
      `
        SELECT 
          a.answer_id AS answer_id,
          a.answer AS content,
          u.user_name AS user_name,
          a.created_at  
        FROM answers a
        JOIN users u ON a.user_id = u.userid
        WHERE a.question_id = ?
        ORDER BY a.created_at DESC
        `,
      [question_id]
    );

    // 3. Respond
    return res.status(StatusCodes.OK).json({
      total_answers: answers.length,
      answers,
    });
  } catch (error) {
    console.error("❌ Error fetching answers:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: error.sqlMessage || "An unexpected error occurred.",
    });
  }
}

module.exports = {
  postAnswer,
  getAnswersForQuestion,
};