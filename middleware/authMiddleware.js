// const { StatusCodes } = require("http-status-codes");
// const jwt = require("jsonwebtoken");
// async function authMiddleware(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer")) {
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ error: "Unauthorized", message: "Authentication invalid" });
//   }
//   const token = authHeader.split(" ")[1];
//   console.log(authHeader);
//   console.log(token);

//   try {
//     const { username, userid } = jwt.verify(token, JWT_SECRET);
//     req.user = { username, userid };
//     next();
//   } catch (error) {
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ error: "Unauthorized", message: "Authentication invalid" });
//   }
// }

// module.exports = authMiddleware;










// const express = require("express");
// const app = express();

// app.use(express.json()); // MUST be BEFORE routes




// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Authentication invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "1willusegeneretorkeynexttime"
    );

    // ✅ Handle all possible JWT key names
    req.user = {
      userid: payload.user_id || payload.id || payload.userid,
      username: payload.user_name || payload.username,
    };

    if (!req.user.userid) {
      return res
        .status(400)
        .json({ error: "Invalid token payload", message: "User ID missing" });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Authentication invalid" });
  }
};

module.exports = authMiddleware;
