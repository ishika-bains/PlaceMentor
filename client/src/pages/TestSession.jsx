import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { testApi } from '../services/api';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  Loader2,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function TestSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get('category') || 'aptitude';
  const subCategory = searchParams.get('subCategory') || 'All';
  const difficulty = searchParams.get('difficulty') || 'All';
  const limit = searchParams.get('limit') || '10';
  const durationMinutes = Number(searchParams.get('duration') || '15');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedOption (0-3) }
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Fetch test questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await testApi.getQuestions({
          category,
          subCategory: subCategory !== 'All' ? subCategory : undefined,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          limit
        });

        if (res.success && res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        } else {
          // Fallback if specific filter had 0 results
          const fallbackRes = await testApi.getQuestions({ category, limit });
          setQuestions(fallbackRes.questions || []);
        }
      } catch (err) {
        console.error('Failed to load test questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [category, subCategory, difficulty, limit]);

  // Timer countdown
  useEffect(() => {
    if (loading || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, questions]);

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your answers automatically.');
    handleSubmitTest();
  };

  const handleSelectOption = (optionIndex) => {
    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    setMarkedForReview((prev) => {
      const copy = new Set(prev);
      if (copy.has(currentQ.id)) {
        copy.delete(currentQ.id);
      } else {
        copy.add(currentQ.id);
      }
      return copy;
    });
  };

  const handleSubmitTest = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);

    const totalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedOption: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1,
      timeSpent: Math.round(totalTimeSpent / questions.length)
    }));

    try {
      const res = await testApi.submitTest({
        category,
        subCategory: subCategory !== 'All' ? subCategory : 'General Practice',
        timeTakenSeconds: totalTimeSpent,
        answers: formattedAnswers
      });

      if (res.success && res.result) {
        navigate(`/test-result/${res.attemptId}`, {
          state: { result: res.result, attemptId: res.attemptId }
        });
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Error submitting test: ' + err.message);
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm">Generating your placement test questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-4 text-center p-4">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-bold text-white">No questions found</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Could not find questions matching the selected parameters.
        </p>
        <button
          onClick={() => navigate('/practice/aptitude')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs"
        >
          Return to Practice Hub
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = userAnswers[currentQ?.id] !== undefined;
  const isMarked = markedForReview.has(currentQ?.id);

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = markedForReview.size;

  const timerColor = timeLeft < 60 ? 'text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse' : timeLeft < 300 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      
      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base tracking-tight text-white capitalize">
            {category.replace('_', ' ')}: {subCategory}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-600/30 text-brand-300 border border-brand-500/30">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Timer Pill */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${timerColor}`}>
          <Clock className="w-4 h-4 shrink-0" />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Finish Test Button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Test</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Active Question Card */}
        <div className="lg:col-span-3 flex flex-col justify-between glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
          
          <div className="space-y-4">
            
            {/* Meta bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                {currentQ.subCategory}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                  Difficulty: {currentQ.difficulty}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +1.00 / 0.00
                </span>
              </div>
            </div>

            {/* Reading Comprehension Passage */}
            {currentQ.passage && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Reading Comprehension Passage:</span>
                </div>
                <p className="italic">{currentQ.passage}</p>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h2>

            {/* Code Snippet for Core CS */}
            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-black/70 font-mono text-xs text-cyan-300 border border-white/5 overflow-x-auto">
                {currentQ.codeSnippet}
              </pre>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-md shadow-brand-500/10 ring-1 ring-brand-500'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </div>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Question Action Controls */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isMarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              {isAnswered && (
                <button
                  type="button"
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Clear Choice
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 shadow-md shadow-brand-600/20 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Right: Question Navigator Palette */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-6 lg:col-span-1 h-fit">
          
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Question Navigator</h3>
            <p className="text-xs text-slate-400">Click any number to jump to that question</p>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500/80"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-800 border border-white/20"></span>
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span>Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded ring-2 ring-brand-400 bg-brand-600"></span>
              <span>Current</span>
            </div>
          </div>

          {/* Numbered Palette Tiles */}
          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-white/10">
            {questions.map((q, idx) => {
              const qAnswered = userAnswers[q.id] !== undefined;
              const qMarked = markedForReview.has(q.id);
              const qCurrent = currentIndex === idx;

              let style = 'bg-slate-900 border-white/10 text-slate-400';
              if (qAnswered) style = 'bg-emerald-600 text-white border-emerald-500 font-bold';
              if (qMarked) style = 'bg-amber-600 text-white border-amber-500 font-bold';
              if (qCurrent) style += ' ring-2 ring-brand-400 scale-105';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs flex items-center justify-center transition-all ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Final Submit shortcut */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Submit & View Results</span>
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Ready to Submit Your Test?</h3>
            
            <p className="text-xs text-slate-300">
              Review your attempt summary before finalizing:
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <div className="font-extrabold text-lg">{answeredCount}</div>
                <div className="text-[10px]">Answered</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-white/10 text-slate-300">
                <div className="font-extrabold text-lg">{unansweredCount}</div>
                <div className="text-[10px]">Unanswered</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <div className="font-extrabold text-lg">{markedCount}</div>
                <div className="text-[10px]">Marked</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Resume Test
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitTest}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading Answers...</span>
                  </>
                ) : (
                  <span>Confirm Submission</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
