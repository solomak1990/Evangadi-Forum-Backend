const mysql2 = require("mysql2")
const dbConnection = mysql2.createPool({
    user: "E-forumG4",
    database:"evangadi-db",
    host: "91.204.209.21",
    password:"&+cD*Gge{809L(oF",
    connectionLimit: 11
})
module.exports= dbConnection.promise()