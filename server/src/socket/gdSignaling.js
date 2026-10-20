export const setupGDSignaling = (io) => {
  // In-memory room tracking: { [roomId]: { topic, participants: { [socketId]: { userId, userName, avatar, mic, video, raisedHand } } } }
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join GD Room
    socket.on('join-room', ({ roomId, userId, userName, avatar, topic }) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          topic: topic || 'Open Campus Placement Discussion',
          participants: new Map()
        });
      }

      const room = rooms.get(roomId);
      const participant = {
        socketId: socket.id,
        userId: userId || socket.id,
        userName: userName || 'Candidate',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        isAudioOn: true,
        isVideoOn: true,
        isHandRaised: false,
        isSpeaking: false,
        joinedAt: new Date().toISOString()
      };

      room.participants.set(socket.id, participant);

      // Existing participants in the room (excluding joining user)
      const existingParticipants = Array.from(room.participants.values()).filter(p => p.socketId !== socket.id);

      // Send current participants list to the new peer
      socket.emit('room-users', {
        roomId,
        topic: room.topic,
        participants: existingParticipants
      });

      // Notify others in the room that a new peer joined
      socket.to(roomId).emit('user-joined', {
        participant
      });

      console.log(`[Socket.IO] ${userName} (${socket.id}) joined room ${roomId}. Total: ${room.participants.size}`);
    });

    // WebRTC: Forward SDP Offer
    socket.on('signal-offer', ({ to, offer }) => {
      io.to(to).emit('signal-offer', {
        from: socket.id,
        offer
      });
    });

    // WebRTC: Forward SDP Answer
    socket.on('signal-answer', ({ to, answer }) => {
      io.to(to).emit('signal-answer', {
        from: socket.id,
        answer
      });
    });

    // WebRTC: Forward ICE Candidate
    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', {
        from: socket.id,
        candidate
      });
    });

    // In-room chat messaging
    socket.on('send-room-chat', ({ roomId, message, userName, avatar }) => {
      const chatItem = {
        id: `${socket.id}-${Date.now()}`,
        senderSocketId: socket.id,
        userName: userName || 'Peer',
        avatar,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      io.in(roomId).emit('room-chat-message', chatItem);
    });

    // Toggle Audio status broadcast
    socket.on('toggle-audio', ({ roomId, isAudioOn }) => {
      const room = rooms.get(roomId);
      if (room && room.participants.has(socket.id)) {
        room.participants.get(socket.id).isAudioOn = isAudioOn;
      }
      socket.to(roomId).emit('participant-audio-toggled', {
        socketId: socket.id,
        isAudioOn
      });
    });

    // Toggle Video status broadcast
    socket.on('toggle-video', ({ roomId, isVideoOn }) => {
      const room = rooms.get(roomId);
      if (room && room.participants.has(socket.id)) {
        room.participants.get(socket.id).isVideoOn = isVideoOn;
      }
      socket.to(roomId).emit('participant-video-toggled', {
        socketId: socket.id,
        isVideoOn
      });
    });

    // Raise / Lower Hand
    socket.on('toggle-hand', ({ roomId, isHandRaised }) => {
      const room = rooms.get(roomId);
      if (room && room.participants.has(socket.id)) {
        room.participants.get(socket.id).isHandRaised = isHandRaised;
      }
      io.in(roomId).emit('participant-hand-toggled', {
        socketId: socket.id,
        isHandRaised
      });
    });

    // Speaking state notification (for visual voice glow)
    socket.on('speaking-state', ({ roomId, isSpeaking }) => {
      socket.to(roomId).emit('participant-speaking-state', {
        socketId: socket.id,
        isSpeaking
      });
    });

    // Leave / Disconnect
    const handleLeave = () => {
      for (const [roomId, room] of rooms.entries()) {
        if (room.participants.has(socket.id)) {
          const leavingUser = room.participants.get(socket.id);
          room.participants.delete(socket.id);

          socket.to(roomId).emit('user-left', {
            socketId: socket.id,
            userName: leavingUser.userName
          });

          console.log(`[Socket.IO] ${leavingUser.userName} (${socket.id}) left room ${roomId}. Remaining: ${room.participants.size}`);

          if (room.participants.size === 0) {
            rooms.delete(roomId);
          }
        }
      }
    };

    socket.on('leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};
