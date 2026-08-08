const { Message, User } = require('../models/Schemas');

// Store online users
const onlineUsers = new Map(); // socket.id -> { userId, username }

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join Global Chat room
    socket.join('global');

    // Register User
    socket.on('register_user', async ({ userId, username }) => {
      if (!userId || !username) return;
      
      onlineUsers.set(socket.id, { userId, username });
      console.log(`[Socket.IO] Registered: ${username} (${socket.id})`);

      // Broadcast active user list
      io.emit('online_users', Array.from(onlineUsers.values()));
    });

    // Send Message
    socket.on('send_message', async (data) => {
      const { senderId, content } = data;
      if (!senderId || !content) return;

      try {
        const user = await User.findById(senderId);
        if (!user) return;

        // Save to DB
        const savedMsg = await Message.create({
          sender: senderId,
          content,
          recipient: null, // null = Global Chat
          type: 'global'
        });

        // Broadcast to all clients
        io.emit('receive_message', {
          _id: savedMsg._id,
          content: savedMsg.content,
          timestamp: savedMsg.timestamp,
          sender: {
            _id: user._id,
            username: user.username,
            email: user.email
          }
        });
      } catch (error) {
        console.error('[Socket.IO Chat Error]', error);
      }
    });

    // Typing status
    socket.on('typing', ({ username, isTyping }) => {
      socket.to('global').emit('typing_status', { username, isTyping });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userInfo = onlineUsers.get(socket.id);
      if (userInfo) {
        console.log(`[Socket.IO] Disconnected: ${userInfo.username}`);
        onlineUsers.delete(socket.id);
        io.emit('online_users', Array.from(onlineUsers.values()));
      }
    });
  });
};
