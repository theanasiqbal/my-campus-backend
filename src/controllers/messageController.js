const supabase  = require('../config/supabase');

// Get all messages for an appointment
exports.getMessages = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { after } = req.query;

    let query = supabase
      .from('messages')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true });

    if (after) {
      query = query.gt('created_at', after);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      messages: data
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { senderId, senderType, message } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        appointment_id: appointmentId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        read: false // New messages are unread by default
      }])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: data
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.body; // The user who is reading the messages

    // Mark all messages in this appointment as read
    // EXCEPT messages sent by the current user (they're already "read" by them)
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('appointment_id', appointmentId)
      .neq('sender_id', userId) // Don't mark own messages as read
      .eq('read', false) // Only update unread messages
      .select('*');

    if (error) throw error;

    console.log(`✅ Marked ${data.length} messages as read in appointment ${appointmentId}`);

    res.status(200).json({
      success: true,
      markedCount: data.length
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get unread count for an appointment
exports.getUnreadCount = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.query; // Current user

    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_id', appointmentId)
      .eq('read', false)
      .neq('sender_id', userId); // Don't count own messages

    if (error) throw error;

    res.status(200).json({
      success: true,
      unreadCount: count || 0
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get last message for an appointment
exports.getLastMessage = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no messages found, return null instead of error
      if (error.code === 'PGRST116') {
        return res.status(200).json({
          success: true,
          message: null
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: data
    });
  } catch (error) {
    console.error('Get last message error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};