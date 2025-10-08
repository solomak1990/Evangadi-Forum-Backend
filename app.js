require("dotenv").config();
const express = require("express");
const app = express();
const port = 2025;
const cors = require("cors");
app.use(cors());

//do connection
const dbConnection = require("./db/dbConfig");

// authotication middlewar
const authMiddleware = require("./middleware/authMiddleware");

//user routes middleware file.file.
const UserRoutes = require("./routes/userRoute");

//do questions middleware
const questionsRoutes = require("./routes/questionRoute");

const answersRoutes = require("./routes/answerRoute");

//json middleware to extract json
app.use(express.json());

// Root route for browser check
app.get("/", (req, res) => {
  res.send("Evangadi Forum Backend is running");
});


//user routes middleware
app.use("/api/user", UserRoutes);

//questions routes middleware
app.use("/api/question", authMiddleware, questionsRoutes);

// app.use("/api/question", questionsRoutes);

//answer routes middleware
app.use("/api/answer", answersRoutes);
// app.use("/api/answers", answersRoutes);
async function start() {
  try {
    const result = await dbConnection.execute("select'test' ");
    app.listen(port);
    console.log("database connection established");
    console.log(`listening on port  http://localhost:${port}`);
  } catch (error) {
    console.log(error.message);
  }
}
start();
