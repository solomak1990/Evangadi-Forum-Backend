
// module.exports = router

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');

// Create a new question (protected)
router.post('/createquestion', authMiddleware, (req, res) => {
    
    res.json({ message: "Question created successfully" });
});

// Get all questions (protected)
router.get('/allquestion', authMiddleware, (req, res) => {
   
    res.json({ message: "List of all questions" });
});

// Get a single question by ID (protected)
router.get('/singlequestion/:id', authMiddleware, (req, res) => {
    const { id } = req.params; 
  
    res.json({ message: `Details of question with ID: ${id}` });
});

module.exports = router;