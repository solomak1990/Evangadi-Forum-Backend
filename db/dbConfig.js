const mysql2 = require("mysql2");
require("dotenv").config();

const dbConnection = mysql2.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 11,
});
(async () => {
  try {
    const [rows] = await dbConnection
      .promise()
      .query("SELECT DATABASE() AS db;");
    console.log("✅ Connected to database:", rows[0].db);

    const [cols] = await dbConnection
      .promise()
      .query("SHOW COLUMNS FROM questions;");
    console.log("🧱 Columns in questions table:");
    console.table(cols.map((c) => ({ Field: c.Field, Type: c.Type })));
  } catch (err) {
    console.error("DB check failed:", err.message);
  }
})();



module.exports = dbConnection.promise();
