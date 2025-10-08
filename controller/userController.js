//intial test
const dbConnection = require("../db/dbConfig");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  const { username, first_name, last_name, email, password } = req.body;
  if (!username || !first_name || !last_name || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Bad Request", message: "Please provide all required fields" });
  }
  try {
    const [user] = await dbConnection.query(
      "SELECT user_name AS username, user_id AS userid FROM users WHERE user_name = ? OR email = ?",
      [username, email]
    );
    if (user.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ error: "Conflict", message: "User already existed" });
    }
    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Bad Request", message: "Password must be at least 8 characters" });
    }
    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await dbConnection.query(
      "INSERT INTO users (user_name, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, first_name, last_name, email, hashedPassword]
    );
    return res.status(StatusCodes.CREATED).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error", message: "An unexpected error occurred." });
  }
}
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Bad Request", message: "Please provide all required fields" });
  }
  try {
    const [user] = await dbConnection.query(
      "SELECT user_name AS username, user_id AS userid, password FROM users WHERE email = ?",
      [email]
    );
    // Check if the credentials are valid
    if (user.length === 0) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized", message: "Invalid username or password" });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized", message: "Invalid username or password" });
    }
    const username = user[0].username;
    const userid = user[0].userid;
    const token = jwt.sign(
      { username, userid },
      "MkZLgWzdY4i4Hz6KMKixrtKeX0UTom7Q6yyy76r",
      { expiresIn: "2d" }
    );
    return res
      .status(StatusCodes.OK)
      .json({ message: "User login successful", token });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error", message: "An unexpected error occurred." });
  }
}
async function checker(req, res) {
  const username = req.user.username;
  const userid = req.user.userid;
  res.status(StatusCodes.OK).json({ message: "Valid user", username, userid });
}
module.exports = { register, login, checker };
