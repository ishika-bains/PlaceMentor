import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  MessageSquare,
  PhoneOff,
  Copy,
  Check,
  Users,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function LiveGroupDiscussion() {
  const { user } = useAuth();
  const {
    currentRoomId,
    roomTopic,
    participants,
    localStream,
    remoteStreams,
    chatMessages,
    isAudioMuted,
    isVideoOff,
    isHandRaised,
    joinLiveRoom,
    leaveLiveRoom,
    toggleAudio,
    toggleVideo,
    toggleHandRaise,
    sendRoomMessage,
  } = useSocket();

  // Room Join Form State
  const [inputRoomId, setInputRoomId] = useState('');
  const [inputTopic, setInputTopic] = useState('Campus Placement Technical Debate');
  const [copiedLink, setCopiedLink] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [typedMessage, setTypedMessage] = useState('');

  // Speech Recognition States (Non-Duplicating Architecture for Live Room Chat)
  const [dictationStatus, setDictationStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'unsupported' | 'denied' | 'error'
  const [dictationErrorNotice, setDictationErrorNotice] = useState('');
  const [interimDictation, setInterimDictation] = useState('');

  const recognitionRef = useRef(null);
  const committedBaseTextRef = useRef('');
  const sessionFinalTextRef = useRef('');
  const latestInterimRef = useRef('');

  const localVideoRef = useRef(null);
  const chatBottomRef = useRef(null);

  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, currentRoomId]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clean up speech recognition on unmount or room leave
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [currentRoomId]);

  // =========================================================================
  // SPEECH-TO-TEXT (ISSUE 3: PREVENT DUPLICATION IN LIVE GD)
  // =========================================================================
  const startDictation = () => {
    if (!isSpeechSupported) {
      setDictationStatus('unsupported');
      setDictationErrorNotice('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Capture manual text as base so existing draft is preserved
      committedBaseTextRef.current = typedMessage.trim();
      sessionFinalTextRef.current = '';
      latestInterimRef.current = '';
      setInterimDictation('');
      setDictationErrorNotice('');

      recognition.onstart = () => {
        setDictationStatus('listening');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let newlyFinalized = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newlyFinalized += segment + ' ';
          } else {
            interim += segment;
          }
        }

        if (newlyFinalized) {
          sessionFinalTextRef.current += newlyFinalized;
        }

        latestInterimRef.current = interim.trim();
        setInterimDictation(interim.trim());

        // Compose stable text: base + all finalized chunks + live interim preview
        const base = committedBaseTextRef.current ? committedBaseTextRef.current + ' ' : '';
        const finalized = sessionFinalTextRef.current;
        const liveInterim = interim ? (finalized || base ? ' ' : '') + interim.trim() : '';
        const combined = (base + finalized + liveInterim).trim();

        setTypedMessage(combined);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice in Live GD:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setDictationStatus('denied');
          setDictationErrorNotice('Microphone access for dictation was denied.');
        } else if (event.error === 'no-speech') {
          // Normal silence, keep listening
        } else if (event.error === 'network') {
          setDictationStatus('error');
          setDictationErrorNotice('Speech recognition network timeout.');
        } else {
          setDictationStatus('error');
          setDictationErrorNotice(`Speech recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setInterimDictation('');
        const base = committedBaseTextRef.current ? committedBaseTextRef.current + ' ' : '';
        let finalized = sessionFinalTextRef.current.trim();
        const trailingInterim = latestInterimRef.current.trim();

        if (trailingInterim && !finalized.endsWith(trailingInterim)) {
          finalized = (finalized ? finalized + ' ' : '') + trailingInterim;
        }

        const combined = (base + (finalized ? finalized + ' ' : '')).trim();
        if (combined) {
          setTypedMessage(combined);
        }
        latestInterimRef.current = '';
        setDictationStatus('idle');
        // Do NOT auto-submit message; user must review before sending
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition in Live GD:', err);
      setDictationStatus('error');
      setDictationErrorNotice('Could not start microphone dictation.');
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      try {
        setDictationStatus('processing');
        recognitionRef.current.stop();
      } catch (e) {
        setDictationStatus('idle');
      }
    } else {
      setDictationStatus('idle');
    }
  };

  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinLiveRoom(randomId, inputTopic || 'Campus Placement Round Table');
  };

  const handleJoinExisting = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    joinLiveRoom(inputRoomId.trim().toUpperCase(), inputTopic || 'Group Discussion');
  };

  const handleCopyRoomId = () => {
    if (currentRoomId) {
      navigator.clipboard.writeText(currentRoomId);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    if (dictationStatus === 'listening') {
      stopDictation();
    }

    sendRoomMessage(typedMessage.trim());
    setTypedMessage('');
    setInterimDictation('');
  };

  const handleLeaveAndCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setDictationStatus('idle');
    setInterimDictation('');
    leaveLiveRoom();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Lobby / Entry View */}
        {!currentRoomId ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            
            {/* Header Banner */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                    <Video className="w-3.5 h-3.5" />
                    <span>Real-Time WebRTC Video Collaboration</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                    Live Peer Group Discussion Rooms
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Practice real mock group discussions with fellow campus placement candidates in real-time rooms. Features mesh WebRTC audio/video, hand-raising, in-room messaging, and turn-taking.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 shrink-0 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>WebRTC Peer-to-Peer</span>
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-300">
                    Low-Latency Audio & Video
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Google Public STUN Signaling
                  </div>
                </div>
              </div>
            </div>

            {/* Room Creation and Join Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Create Instant Room */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Create a New GD Room</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Launch an instant discussion room with a generated 6-character room code and invite your batchmates.
                  </p>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Discussion Topic
                    </label>
                    <input
                      type="text"
                      value={inputTopic}
                      onChange={(e) => setInputTopic(e.target.value)}
                      placeholder="e.g. Remote Work vs Office Culture"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
                >
                  <Video className="w-4 h-4" />
                  <span>Create Instant Room & Start</span>
                </button>
              </div>

              {/* Join Existing Room */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Join by Room ID</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter a room code provided by a classmate or campus placement study group.
                  </p>

                  <form onSubmit={handleJoinExisting} className="pt-2 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        6-Character Room Code
                      </label>
                      <input
                        type="text"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                        maxLength={8}
                        placeholder="e.g. X9F2A1"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center text-base tracking-widest placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!inputRoomId.trim()}
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Join Existing Room</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Placement Tips */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>WebRTC Collaboration Notice:</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Ensure your browser is permitted to access camera and microphone devices. If you are testing locally or solo, PlaceMentor automatically establishes your self video tile, enables full device toggling, hand raising, and room chat!
              </p>
            </div>

          </div>
        ) : (
          /* Active Live GD Room */
          <div className="space-y-4 animate-in fade-in">
            
            {/* Top Room Bar */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-600/30 text-brand-300 border border-brand-500/30 font-mono">
                      ROOM ID: {currentRoomId}
                    </span>
                    <button
                      onClick={handleCopyRoomId}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Copy Room ID"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h2 className="font-extrabold text-sm sm:text-base text-white mt-0.5">
                    {roomTopic}
                  </h2>
                </div>
              </div>

              {/* Right: Participant Count & Hand Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>{participants.length + 1} In Room</span>
                </div>

                <button
                  onClick={handleLeaveAndCleanup}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Leave Room</span>
                </button>
              </div>
            </div>

            {/* Video Stage and Chat Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Video Grid (Col 3) */}
              <div className={`${chatOpen ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4`}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[420px]">
                  
                  {/* Local Video Tile */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg flex items-center justify-center min-h-[220px]">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover transform -scale-x-100 ${
                        isVideoOff ? 'hidden' : 'block'
                      }`}
                    />

                    {/* Placeholder when video off */}
                    {isVideoOff && (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <img
                          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={user?.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                        />
                        <span className="text-xs font-semibold">{user?.name} (Camera Off)</span>
                      </div>
                    )}

                    {/* Overlays */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                      <span>{user?.name || 'You'} (You)</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isHandRaised && (
                        <div className="p-1.5 rounded-lg bg-amber-500 text-slate-900 animate-bounce">
                          <Hand className="w-4 h-4 fill-current" />
                        </div>
                      )}
                      <div className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {isAudioMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Remote Peer Video Tiles */}
                  {participants.map((peer) => {
                    const stream = remoteStreams[peer.socketId];
                    return (
                      <div
                        key={peer.socketId}
                        className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg flex items-center justify-center min-h-[220px]"
                      >
                        {stream && !peer.isVideoOn === false ? (
                          <video
                            autoPlay
                            playsInline
                            ref={(el) => {
                              if (el && stream) el.srcObject = stream;
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                            <img
                              src={peer.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
                              alt={peer.userName}
                              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                            />
                            <span className="text-xs font-semibold">{peer.userName}</span>
                          </div>
                        )}

                        {/* Overlays */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                          <span>{peer.userName}</span>
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {peer.isHandRaised && (
                            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-900 animate-bounce">
                              <Hand className="w-4 h-4 fill-current" />
                            </div>
                          )}
                          <div className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                            {peer.isAudioOn === false ? (
                              <MicOff className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Mic className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state when alone */}
                  {participants.length === 0 && (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-3">
                      <Users className="w-10 h-10 text-slate-500 opacity-60" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Waiting for peers to join</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                          Share Room ID <strong className="text-cyan-400 font-mono">{currentRoomId}</strong> with your classmates to connect.
                        </p>
                      </div>
                      <button
                        onClick={handleCopyRoomId}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied Code!' : 'Copy Room Code'}</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Bottom Control Bar */}
                <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-center gap-3 sm:gap-4">
                  {/* Mic Toggle */}
                  <button
                    onClick={toggleAudio}
                    title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
                    className={`p-3 rounded-2xl transition-all ${
                      isAudioMuted
                        ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40 hover:bg-rose-600/50'
                        : 'bg-slate-800 text-white hover:bg-slate-700 border border-white/10'
                    }`}
                  >
                    {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Video Camera Toggle */}
                  <button
                    onClick={toggleVideo}
                    title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                    className={`p-3 rounded-2xl transition-all ${
                      isVideoOff
                        ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40 hover:bg-rose-600/50'
                        : 'bg-slate-800 text-white hover:bg-slate-700 border border-white/10'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>

                  {/* Raise Hand */}
                  <button
                    onClick={toggleHandRaise}
                    title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                    className={`p-3 rounded-2xl transition-all ${
                      isHandRaised
                        ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Hand className="w-5 h-5" />
                  </button>

                  {/* Chat Toggle */}
                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    title="Toggle Chat"
                    className={`p-3 rounded-2xl transition-all ${
                      chatOpen
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>

                  {/* Leave Button */}
                  <button
                    onClick={handleLeaveAndCleanup}
                    title="Leave Room"
                    className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* Chat Sidebar (Col 1) */}
              {chatOpen && (
                <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col justify-between h-[520px] lg:col-span-1 shadow-xl">
                  
                  <div className="space-y-1.5 border-b border-white/10 pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span>Room Live Chat</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {chatMessages.length} msgs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Share points, links & notes with peers</p>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-[11px] text-center p-4">
                        <MessageSquare className="w-8 h-8 text-slate-600 mb-2 opacity-40" />
                        <span>No messages yet. Say hello or share an argument with your peers!</span>
                      </div>
                    ) : (
                      chatMessages.map((m) => (
                        <div key={m.id} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-white">{m.userName}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-200 leading-relaxed break-words">
                            {m.message}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Dictation Notice or Active Wave Indicator */}
                  {dictationStatus === 'listening' && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center justify-between animate-pulse mb-2">
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span>Dictating... Speak clearly.</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopDictation}
                        className="text-[10px] font-bold underline text-white"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {interimDictation && (
                    <div className="px-2.5 py-1 mb-2 rounded bg-black/40 border border-white/5 text-[10px] text-cyan-300 font-mono italic truncate">
                      Live Speech: "{interimDictation}"
                    </div>
                  )}

                  {dictationErrorNotice && (
                    <div className="p-2 mb-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                      {dictationErrorNotice}
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="pt-2 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="Type or voice dictate message..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                    />

                    {/* Microphone Dictate Button */}
                    <button
                      type="button"
                      onClick={dictationStatus === 'listening' ? stopDictation : startDictation}
                      title={dictationStatus === 'listening' ? 'Stop Voice Recording' : 'Voice Dictate'}
                      className={`p-2 rounded-xl transition-all border shrink-0 ${
                        dictationStatus === 'listening'
                          ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/50 animate-pulse'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-white/10'
                      }`}
                    >
                      {dictationStatus === 'listening' ? (
                        <MicOff className="w-4 h-4 text-white" />
                      ) : (
                        <Mic className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={!typedMessage.trim()}
                      className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 disabled:opacity-40 transition-all shrink-0"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
