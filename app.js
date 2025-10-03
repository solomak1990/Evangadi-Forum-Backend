const express = require("express");
const app = express();
const port = 3000;

const dbConnection = require("./db/dbConfig")

const userRoutes = require("./routes/userRoutes")
app.use("/api/users", userRoutes)

const answerRoutes = require("./routes/answerRoute");
app.use("/api/answers", answerRoutes);
async function start() {
  try {
    const result = await dbConnection.execute("select, 'test'")
    app.listen(port);
    console.log("database connection established");
    console.log(`listening on ${port}`);
  } catch (error) {
    console.log(error.message);
  }
}
start();
