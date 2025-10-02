
const express = require("express")
const router = express = express.Router()
router.post("/answer", (req, res) => {
   res.send ('Answer submitted successfully')
})
router.get("/:allanswers", (req, res) => {
   res.send(`List of answers for question ID:${req.params.questionId}`)
})
router.put('/save', (req, res) => {
   res.send("Answer saved")
})
 module.exports = router