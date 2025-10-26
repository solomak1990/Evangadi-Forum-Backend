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





// const router = require("express").Router();
// const db = require("../db/dbConfig");

// Get all questions
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM questions");
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error", message: err.message });
//   }
// });

// Get question by id
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const [rows] = await db.query("SELECT * FROM questions WHERE id = ?", [id]);
//     if (rows.length === 0) {
//       return res.status(404).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Server error", message: err.message });
//   }
// });



// Get question by id
// router.get("/:question_id", async (req, res) => {
//   const { question_id } = req.params; // match the route param
//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM questions WHERE question_id = ?", // match your DB column
//       [question_id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Server error", message: err.message });
//   }
// });



// module.exports = router;









// const authMiddleware = require("../middleware/authMiddleware");

// router.get("/:question_id", authMiddleware, async (req, res) => {
//   const { question_id } = req.params;
//   try {
//     const [rows] = await db.query("SELECT * FROM questions WHERE id = ?", [
//       question_id,
//     ]);
//     if (rows.length === 0) {
//       return res.status(404).json({
//         error: "Not Found",
//         message: "The requested question could not be found.",
//       });
//     }
//     res.json({ question: rows[0] }); // ✅ nested
//   } catch (err) {
//     res.status(500).json({ error: "Server error", message: err.message });
//   }
// });

// module.exports = router;







const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db/dbConfig"); // your DB connection

// GET all questions with username
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT q.id, q.title, q.description, q.user_id, u.user_name
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.user_id
      ORDER BY q.id DESC
    `);

    res.json({
      success: true,
      questions: rows, // always an array
    });
  } catch (err) {
    console.error("Error fetching questions:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// GET single question by ID with username
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT q.id, q.title, q.description, q.user_id, u.user_name
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.user_id
       WHERE q.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Keep it consistent: always return an array in "questions"
    res.json({ success: true, questions: rows });
  } catch (err) {
    console.error("Error fetching question:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// POST a new question
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const user_id = req.user.userid; // from auth middleware

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description required",
      });
    }

    const [result] = await db.query(
      "INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)",
      [title, description, user_id]
    );

    // Return the full question after creation
    const [newQuestionRows] = await db.query(
      `SELECT q.id, q.title, q.description, q.user_id, u.user_name
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.user_id
       WHERE q.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      question: newQuestionRows[0],
    });
  } catch (err) {
    console.error("Error posting question:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;


















