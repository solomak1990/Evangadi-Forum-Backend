const express = require("express");
const app = express();
const port = 3000;

// const dbConnection = require("./db/dbConfig")
// middleware for Json parsing 
app.use(express.json());
// user routes middleware file
const userRoutes = require("./routes/userRoute")

app.use("/api/user", userRoutes)

const answerRoutes = require("./routes/answerRoute");
app.use("/api/answers", answerRoutes);
async function start() {
  try {
    const result = await dbConnection.execute("select, 'test'")
    app.listen(port);
    console.log("database connection established");
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.log(error.message);
  }
}
start();

