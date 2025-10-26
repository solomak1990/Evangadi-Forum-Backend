//  const mysql2 = require("mysql2");
 require("dotenv").config();

// // const dbConnection = mysql2.createPool({
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASSWORD,
// //   host: "localhost",
// //   database: process.env.DB_NAME,
// //   port: process.env.DB_PORT,
// //   connectionLimit: 11,
// // });



// // module.exports = dbConnection.promise();




// // const mysql2 = require("mysql2");

// // // do connection
// // const dbConnection = mysql2.createPool({
// //   user: "evangadi-admin",
// //   database: "evangadi-db",
// //   host: "localhost",
// // //   password: "123456",
// // //   connectionLimit: 2,
// // // });

// // // module.exports = dbConnection;




// // const mysql2 = require("mysql2");

// // const dbConnection = mysql2.createPool({
// //   user: process.env.USER,
// //   database: process.env.DATABASE,
// //   host: "localhost",
// //   password: process.env.PASSWORD,
// //   connectionLimit: 10,
// // });




// const mysql2 = require("mysql2");

// const dbConnection = mysql2.createPool({
//   user: process.env.USER,
//   database: process.env.DATABASE,
//   host: "localhost",
//   password: process.env.PASSWORD,
//   connectionLimit: 10,
// });

// // ✅ Export the promise-based version
// module.exports = dbConnection.promise();


const mysql2 = require("mysql2");

const db = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
});

module.exports = db.promise(); // export the promise-based pool

// Optional: move test query to your main app.js instea

