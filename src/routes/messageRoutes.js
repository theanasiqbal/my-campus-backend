const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  getLastMessage
} = require('../controllers/messageController');

router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
router.patch('/:conversationId/messages/read', markMessagesAsRead);
router.get('/:conversationId/messages/unread-count', getUnreadCount);
router.get('/:conversationId/messages/last', getLastMessage);

module.exports = router;