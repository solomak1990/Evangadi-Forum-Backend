const express = require("express");
const router = express.Router();

// register route
router.post("/register", (req, res) => {
  res.send("register user");
   
});

router.post("/login", (req, res) => {
  res.send("login user");
 
});

router.get("/checkUser", (req, res) => {
  res.send("check user");
 
});



module.exports = router;
