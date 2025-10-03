const express = require("express")
const app = express();
const port = 3000

const dbConnection = require("./db/dbConfig")

//question routes middleware file
const questionRoutes = require("./routes/questionRoute");

const userRoutes = require("./routes/userRoute")
app.use("/api/users", userRoutes)

//question routes middleware
app.use("/api/questions", questionRoutes);

async function start(){
    try{
       const result = await dbConnection.execute("select, 'test'")    
    app.listen(port)
    console.log("database connection established");
    console.log(`listening on ${port}`);
    }catch(error){
        console.log(error.message);
    }
}
start()
