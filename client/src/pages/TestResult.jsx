import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { testApi } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Filter,
  Check,
  X,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function TestResult() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [filterType, setFilterType] = useState('all'); // 'all', 'correct', 'incorrect'

  useEffect(() => {
    const fetchResult = async () => {
      if (result) return;
      try {
        const res = await testApi.getAttemptById(attemptId);
        if (res.success && res.attempt) {
          setResult({
            score: res.attempt.score,
            totalQuestions: res.attempt.totalQuestions,
            correctCount: res.attempt.correctCount,
            incorrectCount: res.attempt.incorrectCount,
            unansweredCount: res.attempt.unansweredCount || 0,
            accuracyPercentage: res.attempt.accuracyPercentage,
            timeTakenSeconds: res.attempt.timeTakenSeconds,
            category: res.attempt.category,
            subCategory: res.attempt.subCategory,
            evaluatedAnswers: res.attempt.answers
          });
        }
      } catch (err) {
        console.error('Failed to load attempt result:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, result]);

  // Confetti celebration if accuracy is high
  useEffect(() => {
    if (result && result.accuracyPercentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore confetti errors
      }
    }
  }, [result]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm">Calculating your test scorecard & explanations...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-4 text-center p-4">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Scorecard Not Available</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Could not find the requested test evaluation record.
        </p>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const filteredAnswers = (result.evaluatedAnswers || []).filter((ans) => {
    if (filterType === 'correct') return ans.isCorrect;
    if (filterType === 'incorrect') return !ans.isCorrect;
    return true;
  });

  const accuracyBadgeColor =
    result.accuracyPercentage >= 75
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : result.accuracyPercentage >= 50
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Result Scorecard Banner */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-600/20 text-brand-300 border border-brand-500/30">
                  Performance Evaluation
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  {result.category.replace('_', ' ')} • {result.subCategory}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {result.accuracyPercentage >= 75 ? '🎉 Outstanding Performance!' : result.accuracyPercentage >= 50 ? '👍 Good Effort!' : '🎯 Practice Required'}
              </h1>
              <p className="text-xs text-slate-400 max-w-lg">
                Your scorecard has been registered to your profile analytics. Review the full step-by-step explanations below to address errors.
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${accuracyBadgeColor} shrink-0 min-w-[140px]`}>
              <span className="text-4xl font-black">{result.accuracyPercentage}%</span>
              <span className="text-[11px] font-bold uppercase tracking-wider mt-1">Accuracy</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-center">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Final Score</span>
              <span className="text-xl font-black text-brand-300 font-mono">
                {result.score} / {result.totalQuestions}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Correct Answers</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {result.correctCount}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Incorrect Answers</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                {result.incorrectCount}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Time Elapsed</span>
              <span className="text-xl font-black text-cyan-300 font-mono">
                {formatSeconds(result.timeTakenSeconds)}
              </span>
            </div>
          </div>

          {/* Weak Topic Alert if low accuracy */}
          {result.accuracyPercentage < 65 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="block font-bold">Diagnostic Note:</strong>
                Your accuracy in <strong>{result.subCategory}</strong> is currently below target threshold for campus placements. We recommend retaking a 5-question targeted drill after reviewing these solutions.
              </div>
            </div>
          )}

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Link
                to={`/practice/${result.category}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-brand-600/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice This Category Again</span>
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Student Dashboard</span>
              </Link>
            </div>

            <Link
              to="/ai-interview"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Ready for AI Technical Interview?</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Detailed Solutions Review Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Comprehensive Question-by-Question Review</h2>
            <p className="text-xs text-slate-400">Step-by-step mathematical reasoning, theory, and code solutions</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({result.evaluatedAnswers?.length || 0})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Correct ({result.correctCount})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'incorrect'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Incorrect ({result.incorrectCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredAnswers.map((ans, idx) => {
            const isUnanswered = ans.selectedOption === -1 || ans.selectedOption === undefined;
            return (
              <div
                key={ans.questionId || idx}
                className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4"
              >
                
                {/* Question status header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-300">
                      Question {idx + 1}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                      {ans.subCategory}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      ans.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isUnanswered
                        ? 'bg-slate-800 text-slate-400 border border-white/10'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {ans.isCorrect ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Correct (+1)</span>
                      </>
                    ) : isUnanswered ? (
                      <span>Unanswered</span>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Incorrect (0)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Passage if present */}
                {ans.passage && (
                  <div className="p-4 rounded-xl bg-slate-900/90 text-xs text-slate-300 border border-white/5 italic leading-relaxed">
                    <div className="text-cyan-400 font-bold mb-1">Passage Context:</div>
                    {ans.passage}
                  </div>
                )}

                {/* Question text */}
                <h3 className="text-base font-semibold text-white leading-relaxed">
                  {ans.question}
                </h3>

                {/* Code snippet if present */}
                {ans.codeSnippet && (
                  <pre className="p-4 rounded-xl bg-black/70 font-mono text-xs text-cyan-300 border border-white/5 overflow-x-auto">
                    {ans.codeSnippet}
                  </pre>
                )}

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {ans.options?.map((opt, optIdx) => {
                    const isUserChoice = ans.selectedOption === optIdx;
                    const isCorrectChoice = ans.correctOption === optIdx;

                    let optionBorder = 'border-white/5 bg-slate-900/60 text-slate-300';
                    if (isCorrectChoice) {
                      optionBorder = 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold';
                    } else if (isUserChoice && !isCorrectChoice) {
                      optionBorder = 'border-rose-500/50 bg-rose-500/20 text-rose-300 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${optionBorder}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                        {isCorrectChoice && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Correct
                          </span>
                        )}
                        {isUserChoice && !isCorrectChoice && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/20 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-brand-300 font-bold text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Step-by-Step Solution & Placement Tips:</span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {ans.explanation}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
