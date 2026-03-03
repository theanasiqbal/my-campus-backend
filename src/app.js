const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const counsellorRoutes = require('./routes/counsellorRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your frontend domain
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: '*', // In production, specify your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/conversations', messageRoutes); // We mounts message endpoints relative to conversationId
app.use('/api/conversations', chatRoutes);    // Mount inbox paths
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join_chat', (conversationId) => {
    socket.join(conversationId);
    console.log(`👤 User ${socket.id} joined room: ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    const { conversationId, senderId, senderType, message } = data;

    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      const { data: savedMessage, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          message,
          read: false
        }])
        .select('*')
        .single();

      if (error) throw error;

      console.log('💬 Message saved:', savedMessage.id);

      io.to(conversationId).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('❌ Socket send message error:', error);
      socket.emit('message_error', { error: error.message });
    }
  });

  // New event: Mark messages as read
  socket.on('mark_as_read', async (data) => {
    const { conversationId, userId } = data;

    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);

      // Notify others in the room that messages were read
      socket.to(conversationId).emit('messages_read', { conversationId });
    } catch (error) {
      console.error('❌ Mark as read error:', error);
    }
  });

  socket.on('typing', (data) => {
    const { conversationId, senderId, senderType } = data;
    socket.to(conversationId).emit('user_typing', { senderId, senderType });
  });

  socket.on('stop_typing', (data) => {
    const { conversationId } = data;
    socket.to(conversationId).emit('user_stopped_typing');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Export both app and server
module.exports = { app, server, io };