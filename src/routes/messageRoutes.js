const express = require('express');
const router = express.Router();
const { 
  getMessages, 
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  getLastMessage
} = require('../controllers/messageController');

router.get('/:appointmentId/messages', getMessages);
router.post('/:appointmentId/messages', sendMessage);
router.patch('/:appointmentId/messages/read', markMessagesAsRead);
router.get('/:appointmentId/messages/unread-count', getUnreadCount);
router.get('/:appointmentId/messages/last', getLastMessage);

module.exports = router;