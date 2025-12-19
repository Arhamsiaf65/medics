
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth'); // Corrected import


// removed temp authenticate middleware to protect the route
router.post('/chat', authenticate,aiController.chatWithAI);


module.exports = router;
