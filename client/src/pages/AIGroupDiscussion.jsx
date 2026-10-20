import React, { useState, useEffect, useRef } from 'react';
import { gdApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Users,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Volume2,
  VolumeX,
  User,
  Bot,
  MessageCircle,
  HelpCircle,
  Check
} from 'lucide-react';

// Distinct avatars and profiles for the virtual discussion round-table participants
const PARTICIPANT_PROFILES = [
  {
    id: 'dr_sen',
    name: 'Dr. Sen',
    fullName: 'Moderator (Dr. Sen)',
    role: 'GD Facilitator & Lead',
    viewpoint: 'Moderation, topic structuring, and debate synthesis',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    accentColor: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ringClass: 'ring-amber-500/60',
    borderClass: 'border-amber-500/50',
    glowClass: 'shadow-amber-500/20',
    isAI: true,
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    role: 'Analytical & Data-Driven',
    viewpoint: 'Industry statistics, empirical trends, and quantitative ROI',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    accentColor: 'indigo',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    ringClass: 'ring-indigo-500/60',
    borderClass: 'border-indigo-500/50',
    glowClass: 'shadow-indigo-500/20',
    isAI: true,
  },
  {
    id: 'rohan',
    name: 'Rohan Mehta',
    fullName: 'Rohan Mehta',
    role: 'Contrarian & Critical Thinker',
    viewpoint: 'Counter-arguments, hidden liabilities, and edge-case risks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    accentColor: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    ringClass: 'ring-rose-500/60',
    borderClass: 'border-rose-500/50',
    glowClass: 'shadow-rose-500/20',
    isAI: true,
  },
  {
    id: 'aman',
    name: 'Aman Verma',
    fullName: 'Aman Verma',
    role: 'Industry & Practical Realist',
    viewpoint: 'Real-world delivery cycles, corporate feasibility, and team dynamics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    accentColor: 'teal',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    ringClass: 'ring-teal-500/60',
    borderClass: 'border-teal-500/50',
    glowClass: 'shadow-teal-500/20',
    isAI: true,
  },
];

export default function AIGroupDiscussion() {
  const { user } = useAuth();

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active GD session state
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [gdTimerSeconds, setGdTimerSeconds] = useState(600); // 10 mins
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Active speaking indicator state
  const [activeSpeaker, setActiveSpeaker] = useState(null); // name of currently speaking participant
  const [readingAudioMessageId, setReadingAudioMessageId] = useState(null);

  // Speech Recognition States (Fixed Non-Duplicating Architecture)
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'unsupported' | 'denied' | 'error'
  const [micErrorNotice, setMicErrorNotice] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  // Speech Recognition Refs
  const recognitionRef = useRef(null);
  const committedBaseTextRef = useRef('');
  const sessionFinalTextRef = useRef('');
  const latestInterimRef = useRef('');

  const transcriptEndRef = useRef(null);
  const timerRef = useRef(null);
  const activeSpeakerTimerRef = useRef(null);

  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Load GD Topics on Mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await gdApi.getTopics();
        if (res.success) {
          setTopics(res.topics);
          setSelectedTopic(res.topics[0]);
          setAiStatus(res.aiStatus);
        }
      } catch (err) {
        console.error('Failed to load GD topics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Timer interval for active discussion
  useEffect(() => {
    if (sessionId && !evaluation) {
      timerRef.current = setInterval(() => {
        setGdTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [sessionId, evaluation]);

  // Auto-scroll transcript when new turns arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, sendingMessage]);

  // Clean up recognition & audio on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (activeSpeakerTimerRef.current) clearTimeout(activeSpeakerTimerRef.current);
    };
  }, []);

  // Helper: Trigger active speaker highlight on participant card for duration
  const triggerActiveSpeaker = (speakerName, durationMs = 4500) => {
    setActiveSpeaker(speakerName);
    if (activeSpeakerTimerRef.current) clearTimeout(activeSpeakerTimerRef.current);
    activeSpeakerTimerRef.current = setTimeout(() => {
      setActiveSpeaker((current) => (current === speakerName ? null : current));
    }, durationMs);
  };

  // =========================================================================
  // SPEECH RECOGNITION (ISSUE 1: FIX SPEECH-TO-TEXT DUPLICATION)
  // =========================================================================
  const startRecording = () => {
    if (!isSpeechSupported) {
      setMicStatus('unsupported');
      setMicErrorNotice(
        'Speech recognition is not supported in this browser. Please type your argument in the box below.'
      );
      return;
    }

    // Cancel any active TTS audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setReadingAudioMessageId(null);
    }

    try {
      // Abort previous session if exists
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

      // Capture manual text as base so existing edits are not overwritten
      committedBaseTextRef.current = userMessage.trim();
      sessionFinalTextRef.current = '';
      latestInterimRef.current = '';
      setInterimTranscript('');
      setMicErrorNotice('');

      recognition.onstart = () => {
        setMicStatus('listening');
        triggerActiveSpeaker(user?.name || 'Candidate', 60000); // Highlight user while speaking
      };

      recognition.onresult = (event) => {
        let interim = '';
        let newlyFinalized = '';

        // Iterate through recognition results from the changed index
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newlyFinalized += segment + ' ';
          } else {
            interim += segment;
          }
        }

        // Accumulate only finalized speech into sessionFinalTextRef
        if (newlyFinalized) {
          sessionFinalTextRef.current += newlyFinalized;
        }

        latestInterimRef.current = interim.trim();
        // Display interim segment separately as temporary preview
        setInterimTranscript(interim.trim());

        // Compose stable text: base + all finalized chunks + live interim preview
        const base = committedBaseTextRef.current ? committedBaseTextRef.current + ' ' : '';
        const finalized = sessionFinalTextRef.current;
        const liveInterim = interim ? (finalized || base ? ' ' : '') + interim.trim() : '';
        const combined = (base + finalized + liveInterim).trim();

        setUserMessage(combined);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice in GD with AI:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatus('denied');
          setMicErrorNotice(
            'Microphone access was denied. Please allow microphone permission in your browser address bar.'
          );
        } else if (event.error === 'no-speech') {
          // Normal silence, keep listening
        } else if (event.error === 'network') {
          setMicStatus('error');
          setMicErrorNotice('Speech recognition network timeout. You can continue typing your argument manually.');
        } else {
          setMicStatus('error');
          setMicErrorNotice(`Speech recognition notice: ${event.error}. You can continue typing your argument.`);
        }
      };

      recognition.onend = () => {
        // Finalize state: drop interim preview and commit stable base + finalized text
        setInterimTranscript('');
        const base = committedBaseTextRef.current ? committedBaseTextRef.current + ' ' : '';
        let finalized = sessionFinalTextRef.current.trim();
        const trailingInterim = latestInterimRef.current.trim();

        if (trailingInterim && !finalized.endsWith(trailingInterim)) {
          finalized = (finalized ? finalized + ' ' : '') + trailingInterim;
        }

        const combined = (base + (finalized ? finalized + ' ' : '')).trim();
        if (combined) {
          setUserMessage(combined);
        }
        latestInterimRef.current = '';
        setMicStatus('idle');
        // Do NOT auto-submit message; user must review before sending
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setMicStatus('error');
      setMicErrorNotice('Could not start microphone. You can type your argument manually.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        setMicStatus('processing');
        recognitionRef.current.stop();
      } catch (e) {
        setMicStatus('idle');
      }
    } else {
      setMicStatus('idle');
    }
  };

  // Optional: Read any participant's turn out loud via browser TTS
  const togglePlayAudioTurn = (messageId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (readingAudioMessageId === messageId) {
      window.speechSynthesis.cancel();
      setReadingAudioMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setReadingAudioMessageId(messageId);
    utterance.onend = () => setReadingAudioMessageId(null);
    utterance.onerror = () => setReadingAudioMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  // =========================================================================
  // GD FLOW HANDLERS
  // =========================================================================
  const handleStartGD = async () => {
    if (!selectedTopic) return;
    try {
      const res = await gdApi.startSession({
        topic: selectedTopic.title,
        category: selectedTopic.category,
        mode: 'ai_simulated',
      });

      if (res.success && res.session) {
        setSessionId(res.session.id);
        setTranscript(res.session.transcript);
        setGdTimerSeconds(600);
        setEvaluation(null);
        // Moderator opened the room
        triggerActiveSpeaker('Moderator (Dr. Sen)', 5000);
      }
    } catch (err) {
      console.error('Failed to start GD:', err);
      alert('Error starting session: ' + err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || sendingMessage) return;

    if (micStatus === 'listening') {
      stopRecording();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setReadingAudioMessageId(null);
    }

    const msg = userMessage.trim();
    setUserMessage('');
    setSendingMessage(true);

    const candidateSpeaker = user?.name || 'Candidate';
    triggerActiveSpeaker(candidateSpeaker, 4000);

    // Optimistically add candidate turn
    const userItem = {
      id: `candidate-${Date.now()}`,
      speaker: candidateSpeaker,
      role: 'candidate',
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscript((prev) => [...prev, userItem]);

    try {
      const res = await gdApi.sendMessage({
        sessionId,
        message: msg,
      });

      if (res.success && res.newMessages) {
        const aiPeers = res.newMessages.filter((m) => m.role !== 'candidate');

        // Stagger AI peer responses sequentially for realistic turn-taking flow
        if (aiPeers.length > 0) {
          const peer1 = aiPeers[0];
          setTimeout(() => {
            setTranscript((prev) => [
              ...prev,
              {
                ...peer1,
                id: `ai-1-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            triggerActiveSpeaker(peer1.speaker, 4500);

            // Stagger 2nd peer response if available
            if (aiPeers.length > 1) {
              const peer2 = aiPeers[1];
              setTimeout(() => {
                setTranscript((prev) => [
                  ...prev,
                  {
                    ...peer2,
                    id: `ai-2-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
                triggerActiveSpeaker(peer2.speaker, 4500);
              }, 1400);
            }
          }, 600);
        }
      }
    } catch (err) {
      console.error('Failed to send GD message:', err);
      alert('Error processing discussion turn: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCompleteGD = async () => {
    setEvaluating(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setReadingAudioMessageId(null);
    }
    try {
      const res = await gdApi.completeSession({ sessionId });
      if (res.success && res.evaluation) {
        setEvaluation(res.evaluation);
      }
    } catch (err) {
      console.error('Failed to complete GD:', err);
      alert('Error evaluating GD: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to count turns taken by a participant
  const getTurnCount = (speakerFullName) => {
    if (speakerFullName === 'Candidate' || speakerFullName === user?.name) {
      return transcript.filter((t) => t.role === 'candidate' || t.speaker === user?.name).length;
    }
    return transcript.filter((t) => t.speaker === speakerFullName || t.speaker.includes(speakerFullName)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm">Loading Group Discussion room banks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* =========================================================================
            STAGE 1: TOPIC SELECTION & GD ROOM ENTRANCE
           ========================================================================= */}
        {!sessionId && (
          <div className="space-y-8 animate-in fade-in">
            {/* Header Banner */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Virtual Discussion Round Table Simulator</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                    AI Virtual Group Discussion Room
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Deliberate on trending tech, economy, and corporate topics in an interactive round-table room. Debate with virtual peer personas (Priya, Rohan, Aman) and an AI Moderator who analyzes your leadership, factual accuracy, and rebuttal tact.
                  </p>
                </div>

                {/* AI Provider Status Pill */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 shrink-0 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Agent Simulator</span>
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-300 uppercase">
                    {aiStatus?.provider === 'gemini' ? 'Google Gemini AI' : 'PlaceMentor Smart Engine'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    4 Distinct Virtual Personas
                  </div>
                </div>
              </div>
            </div>

            {/* Topics Selection Grid */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                    Select a Campus Placement GD Topic
                  </h2>
                  <p className="text-xs text-slate-400">Calibrated to corporate recruitment patterns & standard GD evaluation rubrics</p>
                </div>
                <span className="text-xs text-cyan-400 font-semibold">{topics.length} Topics Available</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {topics.map((t) => {
                  const isSelected = selectedTopic?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopic(t)}
                      className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500'
                          : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {t.category}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selected Topic</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-white mb-2">{t.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartGD}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-xl shadow-purple-600/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Enter Virtual GD Room & Take Seat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: VIRTUAL DISCUSSION ROOM (ISSUE 2: REALISTIC GD INTERFACE)
           ========================================================================= */}
        {sessionId && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Top Room Navigation Bar */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Active Discussion Topic ({selectedTopic?.category || 'General'})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Virtual Multi-Agent Session
                  </span>
                </div>
                <h2 className="font-extrabold text-sm sm:text-base text-white">
                  {selectedTopic?.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-300 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{formatTimer(gdTimerSeconds)}</span>
                </div>

                {/* Conclude Button */}
                {!evaluation && (
                  <button
                    onClick={handleCompleteGD}
                    disabled={evaluating}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-105"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling Appraisal...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        <span>Conclude GD & View Scorecard</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Leave current GD room? Your active session progress will reset.')) {
                      setSessionId(null);
                      setTranscript([]);
                      setEvaluation(null);
                      if (micStatus === 'listening') stopRecording();
                    }
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Leave GD Room"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =====================================================================
                VIRTUAL PARTICIPANT ROUND-TABLE ARENA (VISUAL PARTICIPANT CARDS)
               ===================================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Virtual Round-Table Participants (5 Seats Active)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {activeSpeaker ? (
                    <span className="text-cyan-300 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{activeSpeaker} is speaking / took floor</span>
                    </span>
                  ) : (
                    <span>Floor open for debate</span>
                  )}
                </span>
              </div>

              {/* 5-Seat Participant Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* AI Participants (Dr. Sen, Priya, Rohan, Aman) */}
                {PARTICIPANT_PROFILES.map((peer) => {
                  const isSpeaking = activeSpeaker === peer.fullName || activeSpeaker === peer.name;
                  const turns = getTurnCount(peer.fullName);

                  return (
                    <div
                      key={peer.id}
                      className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isSpeaking
                          ? `bg-slate-900/90 ${peer.borderClass} ring-2 ring-opacity-70 ${peer.ringClass} shadow-xl ${peer.glowClass} scale-[1.02]`
                          : 'bg-slate-900/60 border-white/5 hover:bg-slate-900/80 hover:border-white/10'
                      }`}
                    >
                      {/* Top status indicator */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase">
                          Virtual AI Peer
                        </span>

                        <span className="text-[10px] font-mono text-slate-400">
                          {turns} {turns === 1 ? 'turn' : 'turns'}
                        </span>
                      </div>

                      {/* Avatar with speaking wave ring */}
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            className={`w-11 h-11 rounded-2xl object-cover ring-2 transition-all ${
                              isSpeaking ? `${peer.borderClass} ring-2` : 'ring-white/10'
                            }`}
                          />

                          {/* Sound wave badge when participant is speaking */}
                          {isSpeaking && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">{peer.name}</h4>
                          <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-0.5 border ${peer.badgeClass}`}>
                            {peer.role}
                          </span>
                        </div>
                      </div>

                      {/* Perspective statement */}
                      <p className="text-[10px] text-slate-400 leading-snug mt-2.5 line-clamp-2">
                        {peer.viewpoint}
                      </p>

                      {/* Active speaking indicator */}
                      {isSpeaking && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-cyan-300 font-semibold animate-pulse">
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                          <span>Speaking on Floor</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Candidate (You) Seat Card */}
                {(() => {
                  const candidateName = user?.name || 'Candidate';
                  const isCandidateSpeaking = activeSpeaker === candidateName || micStatus === 'listening';
                  const candidateTurns = getTurnCount(candidateName);

                  return (
                    <div
                      className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isCandidateSpeaking
                          ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/70 shadow-xl shadow-purple-500/20 scale-[1.02]'
                          : 'bg-purple-950/20 border-purple-500/30 hover:bg-purple-950/30'
                      }`}
                    >
                      {/* Top status */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase border border-purple-500/30">
                          Your Seat (Live)
                        </span>

                        <span className="text-[10px] font-mono text-purple-300">
                          {candidateTurns} {candidateTurns === 1 ? 'turn' : 'turns'}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-purple-400/50 text-sm shadow-md">
                            {candidateName.charAt(0).toUpperCase()}
                          </div>

                          {micStatus === 'listening' && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">{candidateName}</h4>
                          <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Placement Aspirant
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 leading-snug mt-2.5">
                        {micStatus === 'listening'
                          ? 'Microphone recording in progress. Speak naturally.'
                          : 'Dictate or type your arguments, rebuttals & viewpoints.'}
                      </p>

                      {isCandidateSpeaking && (
                        <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center gap-1.5 text-[10px] text-purple-300 font-semibold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span>{micStatus === 'listening' ? 'Mic Active' : 'Recent Turn Taken'}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* =====================================================================
                DELIBERATION FEED: TRANSCRIPT STREAM
               ===================================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Discussion Transcript & Turns ({transcript.length} Contributed)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Chronological discussion log
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4 min-h-[380px] max-h-[480px] overflow-y-auto">
                {transcript.map((item, idx) => {
                  const isCandidate = item.role === 'candidate' || item.speaker === (user?.name || 'Candidate');
                  const isModerator = item.role === 'moderator' || item.speaker.includes('Moderator');

                  // Find profile matching speaker
                  const matchedProfile = PARTICIPANT_PROFILES.find(
                    (p) => item.speaker.includes(p.name) || p.fullName === item.speaker
                  );

                  const avatar = matchedProfile?.avatar || (isCandidate ? user?.avatar : null);
                  const isPlayingThis = readingAudioMessageId === (item.id || idx);

                  return (
                    <div
                      key={item.id || idx}
                      className={`flex items-start gap-3 ${isCandidate ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      {isCandidate ? (
                        <div className="w-8 h-8 rounded-xl bg-purple-600 border border-purple-400/40 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1 shadow-md">
                          {(user?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <img
                          src={
                            avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                          }
                          alt={item.speaker}
                          className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-white/10 mt-1"
                        />
                      )}

                      {/* Speech Bubble */}
                      <div className={`space-y-1 max-w-2xl ${isCandidate ? 'items-end text-right' : ''}`}>
                        <div className={`flex items-center gap-2 text-xs ${isCandidate ? 'justify-end' : ''}`}>
                          <span className="font-bold text-white">{item.speaker}</span>

                          {item.role && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                                isCandidate
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : isModerator
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300 border-white/10'
                              }`}
                            >
                              {item.role}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-500">{item.timestamp}</span>

                          {/* Listen to turn TTS button */}
                          <button
                            type="button"
                            onClick={() => togglePlayAudioTurn(item.id || idx, item.message)}
                            className={`p-1 rounded hover:bg-white/5 transition-colors ${
                              isPlayingThis ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                            title={isPlayingThis ? 'Stop Audio' : 'Listen to Spoken Argument'}
                          >
                            {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isCandidate
                              ? 'bg-purple-600/30 border border-purple-500/40 text-white rounded-tr-sm text-left shadow-lg'
                              : isModerator
                              ? 'bg-amber-950/40 border border-amber-500/30 text-amber-100 rounded-tl-sm shadow-md'
                              : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-sm shadow-md'
                          }`}
                        >
                          {item.message}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sendingMessage && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>AI Participants (Priya, Rohan, Aman) are deliberating your viewpoint and preparing counter-arguments...</span>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* =====================================================================
                CANDIDATE ARGUMENT DESK (INPUT DOCK WITH FIXED SPEECH RECOGNITION)
               ===================================================================== */}
            {!evaluation && (
              <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3.5 shadow-xl">
                
                {/* Header toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Candidate Response & Rebuttal Desk</span>
                      <span className="text-[10px] text-purple-300 font-mono">({user?.name || 'You'})</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Dictate your argument via microphone or type manually. Review before submitting to the room.
                    </p>
                  </div>

                  {/* Speech Dictation Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {micStatus === 'listening' ? (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 ring-2 ring-rose-400 animate-pulse"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Stop Voice Recording</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={sendingMessage}
                        onClick={startRecording}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 hover:border-purple-500/40 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Mic className="w-4 h-4 text-purple-400" />
                        <span>Voice Dictate Argument</span>
                      </button>
                    )}

                    {userMessage.trim() && (
                      <button
                        type="button"
                        onClick={() => setUserMessage('')}
                        disabled={sendingMessage || micStatus === 'listening'}
                        className="px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Clear Input"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Microphone Active Live Wave Notice */}
                {micStatus === 'listening' && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-rose-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="font-semibold">
                        Microphone Active: Dictating your argument... Speak clearly into mic.
                      </span>
                    </div>
                    <span className="text-[10px] text-rose-200 font-mono">
                      Click Stop when finished
                    </span>
                  </div>
                )}

                {/* Processing speech segment loader */}
                {micStatus === 'processing' && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Processing final speech segment into transcript...</span>
                  </div>
                )}

                {/* Permission or Device Warning Notice */}
                {micErrorNotice && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block">Speech Recognition Notice:</span>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">{micErrorNotice}</p>
                    </div>
                  </div>
                )}

                {/* Textarea with In-Flight Speech Flow */}
                <div className="relative">
                  <textarea
                    rows={3}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="State your technical/analytical argument, agree or politely rebut peers (e.g., 'While Priya highlighted stats, I believe...'), or propose a balanced conclusion..."
                    className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-y leading-relaxed"
                  />

                  {/* Live in-flight interim preview */}
                  {interimTranscript && (
                    <div className="mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-cyan-300 font-mono italic">
                      Live In-Flight Preview: "{interimTranscript}"
                    </div>
                  )}
                </div>

                {/* Input Footer & Submit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      Words: <strong className="text-white font-mono">{userMessage.trim() ? userMessage.trim().split(/\s+/).length : 0}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px]">
                      Tip: Acknowledge previous speakers by name for higher leadership & rebuttal tact scores.
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!userMessage.trim() || sendingMessage}
                    onClick={handleSendMessage}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Contribute to Round Table</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

            {/* =====================================================================
                FINAL GD EVALUATION SCORECARD
               ===================================================================== */}
            {evaluation && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      GD Appraisal Result
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-1">
                      Group Discussion Performance Appraisal
                    </h2>
                    <p className="text-xs text-slate-400">
                      Topic: {selectedTopic?.title} • Candidate: {user?.name}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/20 border border-purple-500/40 text-center min-w-[130px] shadow-lg">
                    <span className="text-3xl font-black text-purple-300 font-mono">{evaluation.overallScore}</span>
                    <span className="text-xs text-slate-400 block font-semibold mt-0.5">/ 10 Overall</span>
                  </div>
                </div>

                {/* 4 Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Content Quality & Facts', val: evaluation.contentQuality, color: 'bg-indigo-500' },
                    { label: 'Communication Clarity', val: evaluation.communicationClarity, color: 'bg-cyan-500' },
                    { label: 'Listening & Rebuttal Tact', val: evaluation.listeningAndRebuttal, color: 'bg-purple-500' },
                    { label: 'Leadership & Initiative', val: evaluation.leadershipAndInitiative, color: 'bg-emerald-500' },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-200">
                        <span>{metric.label}</span>
                        <span className="font-mono text-purple-300">{metric.val} / 10</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${metric.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${(metric.val / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualitative Feedback */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Moderator Commentary:</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed leading-6 whitespace-pre-line">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
                    <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Noted Strengths</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300 text-[11px]">
                      {evaluation.strengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                    <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Areas for Improvement</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300 text-[11px]">
                      {evaluation.improvements?.map((im, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{im}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSessionId(null);
                      setTranscript([]);
                      setEvaluation(null);
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-xs bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Select Another Topic & Debate</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
