import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomTopic, setRoomTopic] = useState('');
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream }
  const [localStream, setLocalStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const screenTrackRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    // In dev with Vite proxy, connecting to origin connects to localhost:5173 which proxies /socket.io to :5000
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      console.log('[SocketContext] Connected to PlaceMentor signaling server:', s.id);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Handle WebRTC Peer Connection helpers
  const createPeerConnection = (targetSocketId, s) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[targetSocketId] = pc;

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        s.emit('ice-candidate', {
          to: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    // Handle incoming remote media stream
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track from ${targetSocketId}`);
      const stream = event.streams[0] || new MediaStream([event.track]);
      setRemoteStreams((prev) => ({
        ...prev,
        [targetSocketId]: stream,
      }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log(`[WebRTC] Connection with ${targetSocketId} ended.`);
      }
    };

    return pc;
  };

  // Socket event listeners for signaling
  useEffect(() => {
    if (!socket) return;

    // Received initial room users
    socket.on('room-users', async ({ roomId, topic, participants: existingPeers }) => {
      setRoomTopic(topic);
      setParticipants(existingPeers);

      // Create WebRTC Offer for each existing peer in the room
      for (const peer of existingPeers) {
        const pc = createPeerConnection(peer.socketId, socket);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal-offer', {
            to: peer.socketId,
            offer,
          });
        } catch (err) {
          console.error('[WebRTC] Error initiating offer:', err);
        }
      }
    });

    // A new user joined the room
    socket.on('user-joined', ({ participant }) => {
      setParticipants((prev) => [...prev.filter((p) => p.socketId !== participant.socketId), participant]);
    });

    // Received Offer from a peer
    socket.on('signal-offer', async ({ from, offer }) => {
      console.log(`[WebRTC] Received offer from ${from}`);
      const pc = createPeerConnection(from, socket);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal-answer', {
          to: from,
          answer,
        });
      } catch (err) {
        console.error('[WebRTC] Error processing offer:', err);
      }
    });

    // Received Answer from a peer
    socket.on('signal-answer', async ({ from, answer }) => {
      console.log(`[WebRTC] Received answer from ${from}`);
      const pc = peersRef.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('[WebRTC] Error setting remote description:', err);
        }
      }
    });

    // Received ICE candidate
    socket.on('ice-candidate', async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[WebRTC] Error adding ICE candidate:', err);
        }
      }
    });

    // Peer disconnected / left
    socket.on('user-left', ({ socketId, userName }) => {
      console.log(`[WebRTC] Peer ${userName} left`);
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    // In-room chat message
    socket.on('room-chat-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Peer toggled audio/video/hand
    socket.on('participant-audio-toggled', ({ socketId, isAudioOn }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isAudioOn } : p))
      );
    });

    socket.on('participant-video-toggled', ({ socketId, isVideoOn }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOn } : p))
      );
    });

    socket.on('participant-hand-toggled', ({ socketId, isHandRaised }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised } : p))
      );
    });

    return () => {
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('signal-offer');
      socket.off('signal-answer');
      socket.off('ice-candidate');
      socket.off('user-left');
      socket.off('room-chat-message');
      socket.off('participant-audio-toggled');
      socket.off('participant-video-toggled');
      socket.off('participant-hand-toggled');
    };
  }, [socket]);

  // Join Live GD Room
  const joinLiveRoom = async (roomId, topic) => {
    if (!socket) return;
    try {
      // Capture local webcam & mic with fallback
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaErr) {
        console.warn('Microphone/Camera permission denied or not available; creating audio-only or blank stream:', mediaErr.message);
        // Create canvas audio-visual placeholder stream if camera hardware is unavailable
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#818cf8';
        ctx.font = '24px sans-serif';
        ctx.fillText(user?.name || 'Candidate', 220, 240);
        stream = canvas.captureStream(15);
      }

      setLocalStream(stream);
      localStreamRef.current = stream;

      setCurrentRoomId(roomId);
      setRoomTopic(topic);
      setChatMessages([]);

      socket.emit('join-room', {
        roomId,
        userId: user?.id || user?._id,
        userName: user?.name || 'Candidate',
        avatar: user?.avatar,
        topic,
      });
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  // Leave Live GD Room
  const leaveLiveRoom = () => {
    if (socket && currentRoomId) {
      socket.emit('leave-room');
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);

    // Close all peer connections
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    setRemoteStreams({});
    setParticipants([]);
    setCurrentRoomId(null);
    setChatMessages([]);
    setIsHandRaised(false);
    setIsAudioMuted(false);
    setIsVideoOff(false);
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsAudioMuted(!nextState);
        if (socket && currentRoomId) {
          socket.emit('toggle-audio', { roomId: currentRoomId, isAudioOn: nextState });
        }
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks[0].enabled = nextState;
        setIsVideoOff(!nextState);
        if (socket && currentRoomId) {
          socket.emit('toggle-video', { roomId: currentRoomId, isVideoOn: nextState });
        }
      }
    }
  };

  // Toggle Hand Raise
  const toggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (socket && currentRoomId) {
      socket.emit('toggle-hand', { roomId: currentRoomId, isHandRaised: nextState });
    }
  };

  // Send In-Room Chat Message
  const sendRoomMessage = (messageText) => {
    if (!socket || !currentRoomId || !messageText.trim()) return;
    socket.emit('send-room-chat', {
      roomId: currentRoomId,
      message: messageText.trim(),
      userName: user?.name || 'Candidate',
      avatar: user?.avatar,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        currentRoomId,
        roomTopic,
        participants,
        localStream,
        remoteStreams,
        chatMessages,
        isAudioMuted,
        isVideoOff,
        isHandRaised,
        isScreenSharing,
        joinLiveRoom,
        leaveLiveRoom,
        toggleAudio,
        toggleVideo,
        toggleHandRaise,
        sendRoomMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
