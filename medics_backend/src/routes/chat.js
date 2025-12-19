const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All chat routes need authentication
router.use(authenticate);

// Conversations route (Specific route before dynamic param)
router.get('/conversations', chatController.getDoctorConversations);
router.get('/user/conversations', chatController.getUserConversations);

router.get('/:doctorId', chatController.getMessages);
router.post('/:doctorId', chatController.sendMessage);

module.exports = router;
