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

// Forgot Password - Send reset email
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Email address is required.",
    });
  }

  try {
    // Check if user exists
    const [user] = await dbConnection.query(
      "SELECT user_id, user_name, email FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      // For security, don't reveal if email exists or not
      return res.status(StatusCodes.OK).json({
        message: "If your email is registered, you'll receive a password reset link shortly.",
      });
    }

    // Generate reset token (simple implementation - in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await dbConnection.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [resetToken, resetExpires, email]
    );

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return res.status(StatusCodes.OK).json({
      message: "If your email is registered, you'll receive a password reset link shortly.",
      // Remove this in production - only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error("❌ Error in forgot password:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// Reset Password - Update password with token
async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Reset token and new password are required.",
    });
  }

  if (password.length < 8) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Password must be at least 8 characters.",
    });
  }

  try {
    // Find user with valid reset token
    const [user] = await dbConnection.query(
      "SELECT user_id, reset_expires FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Bad Request",
        message: "Invalid or expired reset token.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    await dbConnection.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE user_id = ?",
      [hashedPassword, user[0].user_id]
    );

    return res.status(StatusCodes.OK).json({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = { register, login, checker, forgotPassword, resetPassword };
