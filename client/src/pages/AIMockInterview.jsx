import React, { useState, useEffect, useRef } from 'react';
import { interviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Code2,
  Layout,
  Server,
  Layers,
  BarChart3,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  LogOut,
  ThumbsUp,
  Target,
  MessageSquareQuote,
  Check,
  Eye,
  EyeOff,
  Video,
  VideoOff,
  PhoneOff
} from 'lucide-react';

const ROLE_ICONS = {
  sde: Code2,
  frontend: Layout,
  backend: Server,
  fullstack: Layers,
  'data-analyst': BarChart3,
};

export default function AIMockInterview() {
  const { user } = useAuth();

  // Setup state
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState('Fresher / Campus Placement');
  const [aiStatus, setAiStatus] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Interview stage: 'setup' | 'answering' | 'feedback' | 'completed'
  const [stage, setStage] = useState('setup');

  // Active interview session data
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    category: 'Introductory',
    index: 0,
    total: 5,
  });
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Audio / Speech Recognition states
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'unsupported' | 'denied' | 'error'
  const [micErrorNotice, setMicErrorNotice] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [showSubmittedAnswer, setShowSubmittedAnswer] = useState(false);

  // Video / Candidate Camera states
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'requesting' | 'active' | 'off' | 'denied' | 'unsupported' | 'error'
  const [cameraErrorNotice, setCameraErrorNotice] = useState('');
  const candidateVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Session Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerIntervalRef = useRef(null);

  // Confirmation modal to exit
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Speech Recognition Refs
  const recognitionRef = useRef(null);
  const committedBaseTextRef = useRef('');
  const sessionFinalTextRef = useRef('');

  // Check speech recognition support once
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Load roles & AI Status on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await interviewApi.getRoles();
        if (res.success) {
          setRoles(res.roles);
          setSelectedRole(res.roles[0]?.name || 'Software Engineer (SDE I)');
          setAiStatus(res.aiStatus);
        }
      } catch (err) {
        console.error('Failed to load interview roles:', err);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchMetadata();
  }, []);

  // Timer interval for active interview
  useEffect(() => {
    if (stage === 'answering' || stage === 'feedback') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timerIntervalRef.current);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [stage]);

  // Clean up media tracks & speech recognition on unmount
  useEffect(() => {
    return () => {
      stopCameraTracks();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Synchronize candidate video ref with stream on stage or camera status change
  useEffect(() => {
    if (candidateVideoRef.current && streamRef.current && isCameraOn) {
      candidateVideoRef.current.srcObject = streamRef.current;
      candidateVideoRef.current.play().catch((e) => console.warn('Video autoPlay caught:', e));
    }
  }, [stage, isCameraOn, cameraStatus]);

  // Format timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // CAMERA & WEBCAM MANAGEMENT
  // =========================================================================
  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setCameraErrorNotice('Webcam access is not supported in this browser environment.');
      setIsCameraOn(false);
      return;
    }

    setCameraStatus('requesting');
    setCameraErrorNotice('');

    try {
      // Audio is set to false to avoid feedback; microphone audio is captured cleanly via SpeechRecognition
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOn(true);
      setCameraStatus('active');

      if (candidateVideoRef.current) {
        candidateVideoRef.current.srcObject = stream;
        candidateVideoRef.current.play().catch((e) => console.warn('Camera autoPlay caught:', e));
      }
    } catch (err) {
      console.warn('Webcam initialization notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setCameraErrorNotice('Camera permission was denied. You can allow it in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('unsupported');
        setCameraErrorNotice('No webcam was found on this device. You can proceed with the interview without camera.');
      } else {
        setCameraStatus('error');
        setCameraErrorNotice(`Camera notice: ${err.message || err.name}. You can proceed without video.`);
      }
      setIsCameraOn(false);
    }
  };

  const stopCameraTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (candidateVideoRef.current) {
      candidateVideoRef.current.srcObject = null;
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn && streamRef.current) {
      stopCameraTracks();
      setIsCameraOn(false);
      setCameraStatus('off');
    } else {
      await startCamera();
    }
  };

  // =========================================================================
  // TEXT-TO-SPEECH (TTS) FOR QUESTION
  // =========================================================================
  const toggleSpeakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio is not supported in this browser.');
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  // =========================================================================
  // VOICE RECORDING & SPEECH-TO-TEXT (STT)
  // =========================================================================
  const startRecording = () => {
    if (!isSpeechSupported) {
      setMicStatus('unsupported');
      setMicErrorNotice(
        'Speech recognition is not supported in this browser. Please type your answer directly in the text area below.'
      );
      return;
    }

    // Stop TTS if speaking
    if ('speechSynthesis' in window && isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
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

      // Capture existing text as committed base so we append accurately
      committedBaseTextRef.current = candidateAnswer.trim();
      sessionFinalTextRef.current = '';
      setInterimTranscript('');
      setMicErrorNotice('');

      recognition.onstart = () => {
        setMicStatus('listening');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let newlyFinalized = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newlyFinalized += transcriptSegment + ' ';
          } else {
            interim += transcriptSegment;
          }
        }

        if (newlyFinalized) {
          sessionFinalTextRef.current += newlyFinalized;
        }

        setInterimTranscript(interim.trim());

        // Compose display: base text + all finalized speech + current live interim
        const base = committedBaseTextRef.current ? committedBaseTextRef.current + ' ' : '';
        const finalized = sessionFinalTextRef.current;
        const liveInterim = interim ? (finalized || base ? ' ' : '') + interim.trim() : '';
        const combined = (base + finalized + liveInterim).trim();

        setCandidateAnswer(combined);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatus('denied');
          setMicErrorNotice(
            'Microphone access was denied. Please allow microphone permission in your browser address bar, or type your answer manually.'
          );
        } else if (event.error === 'no-speech') {
          // Normal silence, keep listening
        } else if (event.error === 'network') {
          setMicStatus('error');
          setMicErrorNotice('Speech recognition network timeout. You can continue typing your answer manually.');
        } else {
          setMicStatus('error');
          setMicErrorNotice(`Speech recognition notice: ${event.error}. You can continue typing your answer.`);
        }
      };

      recognition.onend = () => {
        setInterimTranscript('');
        const base = committedBaseTextRef.current ? committedBaseTextRef.current + ' ' : '';
        const finalized = sessionFinalTextRef.current;
        const combined = (base + finalized).trim();
        if (combined) {
          setCandidateAnswer(combined);
        }
        setMicStatus('idle');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setMicStatus('error');
      setMicErrorNotice('Could not start microphone. You can type your answer manually.');
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

  // =========================================================================
  // INTERVIEW LIFECYCLE HANDLERS
  // =========================================================================
  const handleStartInterview = async () => {
    try {
      // Prompt camera access as candidate enters the room
      startCamera();

      const res = await interviewApi.startSession({
        role: selectedRole,
        experienceLevel,
      });

      if (res.success && res.session) {
        setSessionId(res.session.id);
        setCurrentQuestion({
          text: res.session.firstQuestion,
          category: res.session.category || 'Introductory',
          index: res.session.questionIndex || 0,
          total: res.session.totalQuestions || 5,
        });
        setCandidateAnswer('');
        setSubmittedAnswer('');
        setCurrentFeedback(null);
        setElapsedSeconds(0);
        setStage('answering');
        setFinalReport(null);
      }
    } catch (err) {
      console.error('Failed to initialize interview:', err);
      alert('Error starting interview session: ' + err.message);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || submittingAnswer) return;

    if (micStatus === 'listening') {
      stopRecording();
    }
    if ('speechSynthesis' in window && isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }

    const answerToSubmit = candidateAnswer.trim();
    setSubmittedAnswer(answerToSubmit);
    setSubmittingAnswer(true);

    try {
      const res = await interviewApi.submitAnswer({
        sessionId,
        candidateAnswer: answerToSubmit,
        questionIndex: currentQuestion.index,
      });

      if (res.success && res.evaluation) {
        setCurrentFeedback(res.evaluation);
        setStage('feedback');
      }
    } catch (err) {
      console.error('Answer submission failed:', err);
      alert('Error evaluating answer: ' + err.message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (!currentFeedback) return;

    if (currentFeedback.isCompleted) {
      handleGenerateFinalReport();
      return;
    }

    setCurrentQuestion({
      text: currentFeedback.nextQuestion || 'Describe an architectural challenge you solved.',
      category: currentFeedback.nextCategory || 'Technical',
      index: currentQuestion.index + 1,
      total: currentQuestion.total,
    });

    setCandidateAnswer('');
    setSubmittedAnswer('');
    setCurrentFeedback(null);
    setShowSubmittedAnswer(false);
    setInterimTranscript('');
    setStage('answering');
  };

  const handleGenerateFinalReport = async () => {
    setGeneratingReport(true);
    // Stop camera stream once interview is complete
    stopCameraTracks();

    try {
      const res = await interviewApi.finalizeSession({ sessionId });
      if (res.success && res.report) {
        setFinalReport(res.report);
        setStage('completed');
      }
    } catch (err) {
      console.error('Failed to generate final report:', err);
      alert('Error finalizing interview: ' + err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExitInterview = () => {
    stopCameraTracks();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setSessionId(null);
    setStage('setup');
    setCandidateAnswer('');
    setSubmittedAnswer('');
    setCurrentFeedback(null);
    setFinalReport(null);
    setShowExitConfirm(false);
    setElapsedSeconds(0);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* =========================================================================
            STAGE 1: INTERVIEW ORIENTATION & SETUP
           ========================================================================= */}
        {stage === 'setup' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Header Banner */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Virtual Technical Interview Room</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                    Virtual Technical Mock Interview
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Practice realistic role-based placement interviews with an interactive video-style virtual room, candidate webcam preview, animated AI interviewer with spoken text-to-speech, and rubric-based feedback.
                  </p>
                </div>

                {/* AI Provider Status Pill */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 shrink-0 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Evaluation Engine Status</span>
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-300 uppercase">
                    {aiStatus?.provider === 'gemini' ? 'Google Gemini AI' : 'PlaceMentor Smart Engine'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {aiStatus?.provider === 'gemini' ? 'Cloud LLM Provider Active' : 'Zero-Key High-Fidelity Fallback'}
                  </div>
                </div>
              </div>
            </div>

            {/* Select Role */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                    1. Select Target Placement Role
                  </h2>
                  <p className="text-xs text-slate-400">Questions are calibrated to standard corporate hiring rubrics</p>
                </div>
                <span className="text-xs text-brand-400 font-semibold">{roles.length} Roles Available</span>
              </div>

              {loadingRoles ? (
                <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                  <span>Loading role banks...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.name;
                    const RoleIcon = ROLE_ICONS[r.id] || Bot;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.name)}
                        className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand-600/20 border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500'
                            : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-white/15'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${r.gradient} flex items-center justify-center text-white shadow-md`}>
                              <RoleIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                              {r.badge}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-white mb-1">{r.name}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
                        </div>

                        {isSelected && (
                          <div className="pt-3 mt-3 border-t border-brand-500/30 flex items-center gap-1.5 text-xs font-bold text-brand-300">
                            <CheckCircle2 className="w-4 h-4 text-brand-400" />
                            <span>Target Role Selected</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Experience Level & Launch Button */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 mb-1">
                    2. Select Experience Level
                  </h2>
                  <p className="text-xs text-slate-400">Controls question complexity and technical scrutiny</p>
                </div>

                <div className="flex gap-2">
                  {['Fresher / Campus Placement', '1-2 Years Experience'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        experienceLevel === lvl
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Protocol Highlights */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs text-slate-300">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                  Virtual Interview Room Features & Protocol:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span><strong>Virtual Interview Stage:</strong> Features prominent animated AI interviewer & candidate webcam preview.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span><strong>Speech Recognition & TTS:</strong> Listen to questions via text-to-speech or dictate answers with your microphone.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Turn Assessment:</strong> Receive immediate rubric feedback on relevance, clarity, and technical depth.</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-xl shadow-brand-600/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Bot className="w-5 h-5" />
                  <span>Enter Virtual Interview Room ({selectedRole})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2 & 3: VIRTUAL INTERVIEW ROOM (ANSWERING OR FEEDBACK)
           ========================================================================= */}
        {(stage === 'answering' || stage === 'feedback') && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Top Room Navigation Bar */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm sm:text-base text-white">{selectedRole}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {experienceLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Question {currentQuestion.index + 1} of {currentQuestion.total} • Category: {currentQuestion.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono font-bold text-cyan-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                </div>

                {/* Exit Button */}
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Room</span>
                </button>
              </div>
            </div>

            {/* Segmented Step Progress Bar */}
            <div className="glass-panel rounded-xl p-3 border border-white/10 flex items-center justify-between gap-2">
              {Array.from({ length: currentQuestion.total }).map((_, stepIdx) => {
                const isCompleted = stepIdx < currentQuestion.index;
                const isCurrent = stepIdx === currentQuestion.index;
                return (
                  <div key={stepIdx} className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-brand-500 shadow-md shadow-brand-500/50 animate-pulse'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold font-mono hidden sm:inline ${
                        isCompleted
                          ? 'text-emerald-400'
                          : isCurrent
                          ? 'text-brand-300'
                          : 'text-slate-500'
                      }`}
                    >
                      Q{stepIdx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* =========================================================================
                VIRTUAL INTERVIEW ROOM VIDEO STAGE
                - Prominent Animated AI Interviewer Stage
                - Candidate Camera Preview Panel
               ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* PRIMARY PROMINENT VIEW: AI Technical Interviewer (2 cols on lg) */}
              <div className="lg:col-span-2 relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#0B0F17] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[320px]">
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Overlay Badge Bar */}
                <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      AI Lead Interviewer Stage
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    Live Session Audio-Sync
                  </span>
                </div>

                {/* Center Animated Avatar Visual */}
                <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8">
                  <div className="relative flex items-center justify-center">
                    {/* Concentric sound wave pulses when speaking question */}
                    {isSpeakingQuestion && (
                      <>
                        <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-cyan-400/40 animate-ping [animation-duration:2s]" />
                        <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-brand-400/50 animate-pulse [animation-duration:1s]" />
                      </>
                    )}

                    {/* Interviewer Avatar Frame */}
                    <div
                      className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-2xl ${
                        isSpeakingQuestion
                          ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.45)] scale-105'
                          : 'border-brand-500/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      }`}
                    >
                      {/* Stylized Professional Interviewer Vector Avatar */}
                      <svg
                        className="w-full h-full bg-gradient-to-b from-slate-800 via-slate-900 to-[#0A0D14]"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="50" cy="50" r="45" fill="url(#avatarGlow)" fillOpacity="0.3" />

                        {/* Suit Shoulders */}
                        <path
                          d="M16 94C16 75 32 68 50 68C68 68 84 75 84 94"
                          fill="#1E293B"
                          stroke="#38BDF8"
                          strokeWidth="1.5"
                        />
                        {/* Shirt & Tie */}
                        <path d="M43 68L50 80L57 68" stroke="#60A5FA" strokeWidth="1.5" fill="#0F172A" />
                        <path d="M49 74L50 88L51 74Z" fill="#38BDF8" />

                        {/* Neck */}
                        <rect x="44" y="56" width="12" height="13" rx="2" fill="#E2E8F0" />

                        {/* Face */}
                        <ellipse cx="50" cy="42" rx="16" ry="19" fill="#F1F5F9" />

                        {/* Hair */}
                        <path
                          d="M32 40C32 26 38 20 50 20C62 20 68 26 68 40C68 33 64 26 50 26C36 26 32 33 32 40Z"
                          fill="#0F172A"
                        />

                        {/* Eyes */}
                        <circle cx="43" cy="41" r="2" fill="#0F172A" />
                        <circle cx="57" cy="41" r="2" fill="#0F172A" />

                        {/* Eyebrows */}
                        <path d="M39 37C41 36 45 36 47 37" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M53 37C55 36 59 36 61 37" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Glasses Frame */}
                        <rect x="38" y="38" width="10" height="7" rx="2" stroke="#0284C7" strokeWidth="1.2" fill="none" />
                        <rect x="52" y="38" width="10" height="7" rx="2" stroke="#0284C7" strokeWidth="1.2" fill="none" />
                        <path d="M48 41H52" stroke="#0284C7" strokeWidth="1.2" />

                        {/* Animated Mouth (Speaking state during TTS vs Attentive Idle) */}
                        {isSpeakingQuestion ? (
                          <ellipse cx="50" cy="51" rx="4.5" ry="3" fill="#0F172A" className="animate-pulse" />
                        ) : (
                          <path d="M46 51C48 53 52 53 54 51" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                        )}

                        {/* Professional Studio Headset with Boom Mic */}
                        <path
                          d="M31 43C29 43 28 41 28 38C28 25 38 18 50 18C62 18 72 25 72 38C72 41 71 43 69 43"
                          stroke="#38BDF8"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <rect x="27" y="36" width="4.5" height="10" rx="2" fill="#0284C7" />
                        <rect x="68.5" y="36" width="4.5" height="10" rx="2" fill="#0284C7" />
                        <path d="M29 44C29 53 37 57 44 57" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        <circle cx="45" cy="57" r="2.5" fill={isSpeakingQuestion ? '#22D3EE' : '#64748B'} />

                        {/* Radial Gradient Def */}
                        <defs>
                          <radialGradient id="avatarGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(45)">
                            <stop stopColor="#38BDF8" stopOpacity="0.4" />
                            <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Subtle Equalizer Sound Wave Bars */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 h-6">
                    {isSpeakingQuestion ? (
                      <>
                        <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms] h-3.5" />
                        <span className="w-1 bg-cyan-300 rounded-full animate-bounce [animation-delay:150ms] h-5" />
                        <span className="w-1 bg-brand-400 rounded-full animate-bounce [animation-delay:300ms] h-6" />
                        <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:100ms] h-4" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:250ms] h-6" />
                        <span className="w-1 bg-brand-300 rounded-full animate-bounce [animation-delay:75ms] h-3.5" />
                      </>
                    ) : (
                      <>
                        <span className="w-1 bg-slate-700 rounded-full h-1" />
                        <span className="w-1 bg-slate-700 rounded-full h-1.5" />
                        <span className="w-1 bg-slate-700 rounded-full h-1" />
                        <span className="w-1 bg-slate-700 rounded-full h-1.5" />
                        <span className="w-1 bg-slate-700 rounded-full h-1" />
                      </>
                    )}
                  </div>

                  {/* Dynamic Status Pill */}
                  <div className="mt-2 text-center">
                    {isSpeakingQuestion ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold animate-pulse">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Speaking Question Audio...</span>
                      </span>
                    ) : stage === 'answering' && submittingAnswer ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>Evaluating Response Against Rubric...</span>
                      </span>
                    ) : stage === 'feedback' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Evaluation Review Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Attentive • Listening to Candidate</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Nameplate Bar */}
                <div className="relative z-10 px-5 py-3 border-t border-white/5 bg-slate-900/60 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-white text-xs sm:text-sm">
                      Alex Vance — Senior Tech Lead & AI Interviewer
                    </span>
                    <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">
                      (Calibrated to Corporate Technical Rubrics)
                    </span>
                  </div>

                  <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Animated Avatar Visual
                  </span>
                </div>
              </div>

              {/* SECONDARY PANEL: Candidate Camera Preview (1 col on lg) */}
              <div className="relative rounded-3xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[300px]">
                
                {/* Top Camera Overlays */}
                <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                  {/* Camera Status */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white shadow-md">
                    <span className={`w-2 h-2 rounded-full ${isCameraOn && cameraStatus === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{isCameraOn && cameraStatus === 'active' ? 'CANDIDATE • LIVE' : 'CAM OFF'}</span>
                  </div>

                  {/* Mic Status */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold shadow-md">
                    {micStatus === 'listening' ? (
                      <span className="flex items-center gap-1 text-rose-400 animate-pulse">
                        <Mic className="w-3 h-3 text-rose-400" />
                        <span>MIC LIVE</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        <MicOff className="w-3 h-3 text-slate-500" />
                        <span>MIC MUTED</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Candidate Webcam Video (Mirrored for natural mirror view) */}
                <video
                  ref={candidateVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full min-h-[260px] object-cover transform -scale-x-100 ${
                    isCameraOn && cameraStatus === 'active' ? 'block' : 'hidden'
                  }`}
                />

                {/* Fallback Display if Camera is Off, Denied, or Unavailable */}
                {(!isCameraOn || cameraStatus !== 'active') && (
                  <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-[#0A0D14] space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-white/10 flex items-center justify-center text-slate-400 shadow-inner">
                      {cameraStatus === 'denied' ? (
                        <AlertTriangle className="w-7 h-7 text-amber-400" />
                      ) : (
                        <VideoOff className="w-7 h-7 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-1 max-w-[200px]">
                      <h4 className="text-xs font-bold text-white">
                        {cameraStatus === 'denied'
                          ? 'Camera Permission Denied'
                          : cameraStatus === 'unsupported'
                          ? 'Webcam Not Detected'
                          : cameraStatus === 'requesting'
                          ? 'Starting Camera...'
                          : 'Camera is Off'}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        {cameraStatus === 'denied'
                          ? 'Allow camera in browser address bar or continue interview normally.'
                          : cameraStatus === 'unsupported'
                          ? 'Webcam unavailable. You can continue with speech or typing.'
                          : cameraStatus === 'requesting'
                          ? 'Please allow camera in the browser prompt.'
                          : 'Your video feed is paused. Click below to turn camera on.'}
                      </p>
                    </div>

                    {cameraStatus !== 'requesting' && cameraStatus !== 'unsupported' && (
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/30 flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Turn Camera On</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Bottom Overlay: Candidate Identity & Inline Cam Toggle */}
                <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between px-3 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-[10px]">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span className="font-semibold text-white text-xs truncate max-w-[120px]">
                      {user?.name || 'Candidate'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`p-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                      isCameraOn && cameraStatus === 'active'
                        ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                        : 'bg-brand-600 border-brand-500 text-white shadow-sm'
                    }`}
                    title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {isCameraOn && cameraStatus === 'active' ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px]">On</span>
                      </>
                    ) : (
                      <>
                        <VideoOff className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[10px]">Off</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Room Media Action Bar */}
            <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-wrap items-center justify-center sm:justify-between gap-3 shadow-lg">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Camera Toggle */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isCameraOn && cameraStatus === 'active'
                      ? 'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                >
                  {isCameraOn && cameraStatus === 'active' ? (
                    <>
                      <Video className="w-4 h-4 text-emerald-400" />
                      <span>Camera On</span>
                    </>
                  ) : (
                    <>
                      <VideoOff className="w-4 h-4 text-rose-400" />
                      <span>Camera Off</span>
                    </>
                  )}
                </button>

                {/* Microphone Recording Toggle */}
                {stage === 'answering' && (
                  micStatus === 'listening' ? (
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
                      disabled={submittingAnswer}
                      onClick={startRecording}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Mic className="w-4 h-4 text-brand-400" />
                      <span>Record Voice Answer</span>
                    </button>
                  )
                )}

                {/* Listen to Question Audio */}
                <button
                  type="button"
                  onClick={() => toggleSpeakQuestion(currentQuestion.text)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isSpeakingQuestion
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-white/10 hover:bg-slate-700'
                  }`}
                  title="Read question out loud using speech synthesis"
                >
                  {isSpeakingQuestion ? (
                    <>
                      <VolumeX className="w-4 h-4 text-cyan-400" />
                      <span>Stop Question Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <span>Listen to Question</span>
                    </>
                  )}
                </button>
              </div>

              {/* End Call Button */}
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <PhoneOff className="w-4 h-4 text-rose-400" />
                <span>End Call</span>
              </button>
            </div>

            {/* Current Question Statement Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-3 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Interview Question {currentQuestion.index + 1} of {currentQuestion.total} ({currentQuestion.category})</span>
                </span>

                <button
                  type="button"
                  onClick={() => toggleSpeakQuestion(currentQuestion.text)}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeakingQuestion ? 'Speaking...' : 'Listen'}</span>
                </button>
              </div>

              <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* =====================================================================
                PHASE A: ANSWERING STATE (Input box, Mic, Submit)
               ===================================================================== */}
            {stage === 'answering' && (
              <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4 shadow-xl">
                
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Candidate Response Desk</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        ({user?.name || 'Candidate'})
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Speak your response using the microphone or type below. Review your text before submitting.
                    </p>
                  </div>

                  {/* Secondary Mic Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {candidateAnswer.trim() && (
                      <button
                        type="button"
                        onClick={() => setCandidateAnswer('')}
                        disabled={submittingAnswer || micStatus === 'listening'}
                        className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Clear Answer"
                      >
                        Clear Text
                      </button>
                    )}
                  </div>
                </div>

                {/* Mic Status & Error Alerts */}
                {micStatus === 'listening' && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-rose-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="font-semibold">
                        Microphone Active: Listening to your answer... Speak naturally.
                      </span>
                    </div>
                    <span className="text-[10px] text-rose-200">
                      Click Stop Voice Recording when done
                    </span>
                  </div>
                )}

                {micStatus === 'processing' && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Processing final speech segments...</span>
                  </div>
                )}

                {micErrorNotice && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block">Speech Recognition Notice:</span>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">{micErrorNotice}</p>
                    </div>
                  </div>
                )}

                {/* Candidate Textarea with Live Speech Flow */}
                <div className="relative">
                  <textarea
                    rows={6}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    disabled={submittingAnswer}
                    placeholder="Provide your technical answer here. You can dictate using the Record Voice button, type manually, or combine both..."
                    className="w-full p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y leading-relaxed"
                  />

                  {/* Interim Floating Preview */}
                  {interimTranscript && (
                    <div className="mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-cyan-300 font-mono italic">
                      Live Speech In-Flight: "{interimTranscript}"
                    </div>
                  )}
                </div>

                {/* Answering Guidance & Submission Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      Words: <strong className="text-white font-mono">{candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px]">
                      Tip: Articulate technical trade-offs, edge-cases, and practical reasoning.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!candidateAnswer.trim() || submittingAnswer}
                    className="px-8 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {submittingAnswer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Your Answer...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer for Evaluation</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

            {/* =====================================================================
                PHASE B: FEEDBACK STATE (Relevance, Clarity, Technical Accuracy)
               ===================================================================== */}
            {stage === 'feedback' && currentFeedback && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl animate-in fade-in">
                
                {/* Feedback Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Answer Evaluated
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Interviewer Evaluation & Feedback
                    </h3>
                    <p className="text-xs text-slate-400">
                      Objective appraisal of your response to Question {currentQuestion.index + 1}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-center min-w-[120px]">
                    <span className="text-3xl font-black text-brand-300 font-mono">
                      {currentFeedback.score}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-semibold">/ 10 Score</span>
                  </div>
                </div>

                {/* 3 Core Placement Pillars: Relevance, Clarity, Technical Accuracy */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Relevance */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Relevance to Question
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                          currentFeedback.relevance === 'High'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentFeedback.relevance === 'Good'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {currentFeedback.relevance || 'Good'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Addressed core topic and specific scenario posed
                    </p>
                  </div>

                  {/* 2. Clarity */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Communication & Clarity
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                          currentFeedback.clarity?.includes('Clear')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {currentFeedback.clarity || 'Well Articulated'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Logical flow, structure, and articulate delivery
                    </p>
                  </div>

                  {/* 3. Technical Accuracy */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Technical Accuracy
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                          currentFeedback.technicalAccuracy === 'Strong'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentFeedback.technicalAccuracy === 'Good'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {currentFeedback.technicalAccuracy || 'Good'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Correctness of algorithms, architecture, or concepts
                    </p>
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-brand-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-300">
                    <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
                    <span>Interviewer Evaluation Commentary:</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    "{currentFeedback.feedback}"
                  </p>
                </div>

                {/* Strengths and Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Demonstrated Strengths</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {currentFeedback.strengths?.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Targeted Improvement Tips</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {currentFeedback.improvements?.map((imp, imIdx) => (
                        <li key={imIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Submitted Answer Accordion */}
                <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => setShowSubmittedAnswer(!showSubmittedAnswer)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <span>View Your Submitted Answer</span>
                      <span className="text-[10px] text-slate-500 font-mono">({submittedAnswer.split(/\s+/).length} words)</span>
                    </span>
                    {showSubmittedAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {showSubmittedAnswer && (
                    <div className="p-4 border-t border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-black/40">
                      {submittedAnswer}
                    </div>
                  )}
                </div>

                {/* Continue / Next Question Action */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={generatingReport}
                    className="px-8 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    {generatingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compiling Final Appraisal...</span>
                      </>
                    ) : currentFeedback.isCompleted ? (
                      <>
                        <span>Finish Interview & View Final Report</span>
                        <Award className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Continue to Next Question ({currentQuestion.index + 2}/{currentQuestion.total})</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            STAGE 4: FINAL APPRAISAL SCORECARD
           ========================================================================= */}
        {stage === 'completed' && finalReport && (
          <div className="glass-panel rounded-3xl p-6 sm:p-9 border border-white/10 shadow-2xl space-y-7 animate-in fade-in">
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 border-b border-white/10 pb-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Comprehensive Performance Appraisal
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Placement Interview Appraisal Report
                </h2>
                <p className="text-xs text-slate-400">
                  Candidate: {user?.name} • Target Role: {selectedRole} ({experienceLevel}) • Elapsed: {formatTimer(elapsedSeconds)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-600/30 to-indigo-600/20 border border-brand-500/40 text-center min-w-[140px] shadow-lg">
                <span className="text-4xl font-black text-brand-300 font-mono">
                  {finalReport.overallScore}
                </span>
                <span className="text-xs text-slate-300 block font-semibold mt-1">/ 10 Overall</span>
              </div>
            </div>

            {/* 4 Competency Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Technical Depth & Accuracy', val: finalReport.technicalAccuracy, color: 'bg-indigo-500' },
                { label: 'Communication & Articulation', val: finalReport.communication, color: 'bg-cyan-500' },
                { label: 'Problem Solving & Structuring', val: finalReport.problemSolving, color: 'bg-purple-500' },
                { label: 'Confidence & Poise', val: finalReport.confidence, color: 'bg-emerald-500' },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-200">
                    <span>{metric.label}</span>
                    <span className="font-mono text-brand-300">{metric.val} / 10</span>
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

            {/* Executive Summary */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/5 space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Executive Readiness Summary:</span>
              </h4>
              <p className="text-slate-300 leading-relaxed leading-6 whitespace-pre-line">
                {finalReport.summary}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Demonstrated Strengths</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {finalReport.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Areas for Targeted Improvement</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {finalReport.areasForImprovement?.map((im, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{im}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Placement Recommendations */}
            {finalReport.recommendations && finalReport.recommendations.length > 0 && (
              <div className="p-5 rounded-2xl bg-brand-950/40 border border-brand-500/20 space-y-2.5 text-xs">
                <h4 className="font-bold text-brand-300 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Actionable Placement Recommendations:</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {finalReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Final Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <span className="text-xs text-slate-400">
                This interview transcript and scorecard are permanently saved in your Profile History.
              </span>
              <button
                type="button"
                onClick={handleExitInterview}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-brand-600 text-white hover:bg-brand-500 shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Mock Interview</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">End Interview Session?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to exit the interview room early? Your camera and active session progress will be stopped.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Resume Interview
              </button>
              <button
                type="button"
                onClick={handleExitInterview}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
