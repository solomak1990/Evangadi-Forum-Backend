// const mysql2 = require("mysql2");
// const dbConnection = mysql2.createPool({
//   user: process.env.USER,
//   database: process.env.DATABASE,
//   host: process.env.HOST,
//   password: process.env.PASSWORD,
//   connectionLimit: 11,
// });
// module.exports = dbConnection.promise();

const mysql2 = require("mysql2");
const dbConnection = mysql2.createPool({
  user: "forum-Admin",
  database: "evangadi-db",
  host: "localhost",
  password: "1234",
  connectionLimit: 11,
});
module.exports = dbConnection.promise();
