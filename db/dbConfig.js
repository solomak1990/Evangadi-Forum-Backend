const mysql2 = require("mysql2")
const dbConnection = mysql2.createPool({
    user: "forum-Admin",
    database:"evangadi-db",
    host: "localhost",
    password:"1234",
    connectionLimit: 11
})
