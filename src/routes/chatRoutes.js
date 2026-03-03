const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Routes for Unified Conversational Inbox
router.get('/student/:studentId', chatController.getStudentInbox);
router.get('/counsellor/:counsellorId', chatController.getCounsellorInbox);

module.exports = router;
