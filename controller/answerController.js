const db = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// POST — Submit an answer for a question
async function postAnswer(req, res) {
  const { question_id, answer } = req.body;
  const { userid } = req.user;

  console.log("User ID:", userid);
  console.log("Question ID:", question_id);
  console.log("Answer:", answer);

  if (!userid) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized",
      message: "User not found in token",
    });
  }

  if (!question_id || !answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide a question ID and an answer.",
    });
  }

  try {
    // Check if question exists
    const [questionRows] = await db.query(
      "SELECT id FROM questions WHERE id = ?",
      [Number(question_id)]
    );

    if (questionRows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    // Insert answer
    await db.query(
      "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
      [userid, Number(question_id), answer]
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Answer submitted successfully!",
    });
  } catch (err) {
    console.error("Error posting answer:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: err.sqlMessage || err.message || "An unexpected error occurred.",
    });
  }
}
async function getAnswersForQuestion(req, res) {
  const { id } = req.params; // question ID from URL
  const questionId = Number(id);

  try {
    // Optional: log for debugging
    console.log("Fetching answers for question ID:", questionId);

    // Check if question exists
    const [questionRows] = await db.query(
      "SELECT id FROM questions WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Fetch answers
    const [answers] = await db.query(
      `SELECT a.answer_id, a.answer AS content, u.user_name
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.user_id
       WHERE a.question_id = ?
       ORDER BY a.answer_id DESC`,
      [questionId]
    );

    return res.status(200).json({ answers });
  } catch (err) {
    console.error("Error fetching answers:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.sqlMessage || err.message || "An unexpected error occurred.",
    });
  }
}


module.exports = { postAnswer, getAnswersForQuestion };
























































// const db = require("../db/dbConfig");
// const { StatusCodes } = require("http-status-codes");

// // POST — Submit an answer for a question
// async function postAnswer(req, res) {
//   const { question_id, answer } = req.body;
//   const { userid } = req.user;

//   if (!question_id || !answer) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       error: "Bad Request",
//       message: "Please provide a question ID and an answer.",
      
//     });
//   }

//   try {
//     // Check if question exists
//     const [questionRows] = await db.query(
//       "SELECT question_id FROM questions WHERE question_id = ?",
//       [question_id]
//     );

//     if (questionRows.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }

//     // Insert answer
//     await db.query(
//       "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
//       [userid, question_id, answer]
//     );

//     return res.status(StatusCodes.CREATED).json({
//       message: "Answer posted successfully",
//     });
//   } catch (err) {
//     console.error("Error posting answer:", err);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Internal Server Error",
//       message: err.sqlMessage || "An unexpected error occurred.",
//     });
//   }
// }

// // GET — Retrieve all answers for a specific question
// async function getAnswersForQuestion(req, res) {
//   const {id } = req.params;

//   try {
//     // Check if question exists
//     const [questionRows] = await db.query(
//       "SELECT id FROM questions WHERE id = ?",
//       [question_id]
//     );

//     if (questionRows.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }

//     // Fetch answers
//     const [answers] = await db.query(
//       `SELECT a.answer_id, a.answer AS content, u.user_name
//        FROM answers a
//        JOIN users u ON a.user_id = u.user_id
//        WHERE a.question_id = ?
//        ORDER BY a.answer_id DESC`,
//       [Number(question_id)]
//     );

//     return res.status(StatusCodes.OK).json({ answers });
//   } catch (err) {
//     console.error("Error fetching answers:", err);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Internal Server Error",
//       message: "An unexpected error occurred.",
//     });
//   }
// }

// module.exports = { postAnswer, getAnswersForQuestion };
















// async function postAnswer(req, res) {
//   const { question_id, answer } = req.body;
//   const { userid } = req.user;

//   console.log("User ID:", userid);
//   console.log("Question ID:", question_id);
//   console.log("Answer:", answer);

//   if (!userid) {
//     return res.status(401).json({ error: "Unauthorized", message: "User not found in token" });
//   }

//   if (!question_id || !answer) {
//     return res.status(400).json({
//       error: "Bad Request",
//       message: "Please provide a question ID and an answer.",
//     });
//   }

//   try {
//     await db.query(
//       "INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)",
//       [userid, question_id, answer]
//     );
//     res.status(201).json({ success: true, message: "Answer submitted successfully!" });
//   } catch (err) {
//     console.error("Error inserting answer:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// }
