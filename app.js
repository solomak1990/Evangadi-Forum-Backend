// const express = require('express')
// const app = express();
// const port = 5500

// const db = require("./db/dbConfig"); // already promise-based

// async function testQuery() {
//   try {
//     const [rows] = await db.query("SELECT 'test' AS test");
//     console.log(rows); // [ { test: 'test' } ]
//   } catch (err) {
//     console.error("Database query failed:", err.message);
//   }
// }

// testQuery();


// //do connection
// const dbConnection = require("./db/dbConfig");

// // authotication middlewar
// const authMiddleware = require("./middleware/authMiddleware");

// //user routes middleware file.file.
// const UserRoutes = require("./routes/userRoute");

// //do questions middleware
// const questionsRoutes = require("./routes/questionRoute");

// const answersRoutes = require("./routes/answerRoute");

// //json middleware to extract json
// app.use(express.json());


// app.get("/", (req, res) => {
//   res.send("Evangadi Forum Backend is running");
// });
// //user routes middleware
// app.use("/api/user", UserRoutes);

// //questions routes middleware
// app.use("/api/question", authMiddleware, questionsRoutes);

// // app.use("/api/question", questionsRoutes);

// //answer routes middleware
// app.use("/api/answer", answersRoutes);
// // app.use("/api/answers", answersRoutes);




// async function start() {
//   try {
//     const [result] = await dbConnection
//       .promise()
//       .query("SELECT 'test' AS test");
//     console.log(result); // Output: [ { test: 'test' } ]

//     app.listen(port, () => {
//       console.log("Database connection established");
//       console.log(`Listening on http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// start();



// app.listen(5500, (err) => {
//   if (err) {
//     console.log(err.message);

//   } else {
//     console.log(`listening on ${port}`)
//   }
// })




























require("dotenv").config(); // load .env
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5500;



const db = require("./db/dbConfig"); // already promise-based
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    credentials: true, // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
const authMiddleware = require("./middleware/authMiddleware");
const UserRoutes = require("./routes/userRoute");
const questionsRoutes = require("./routes/questionRoute");
const answersRoutes = require("./routes/answerRoute");



app.use(express.json());

app.get("/", (req, res) => {
  res.send("Evangadi Forum Backend is running");
});

app.use("/api/user", UserRoutes);
// app.use("/api/questions", questionsRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/answer", answersRoutes);


// Test DB connection
async function start() {
  try {
    const [result] = await db.query("SELECT 'test' AS test");
    console.log(result); // [ { test: 'test' } ]

    app.listen(PORT, () => {
      console.log("✅ Database connection established");
      console.log(`🚀 Listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

start();
