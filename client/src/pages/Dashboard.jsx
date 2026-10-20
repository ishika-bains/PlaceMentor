import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi, testApi } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  Video,
  Bot,
  AlertTriangle,
  Flame,
  ArrowRight,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  BarChart2,
  BookOpen
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await userApi.getDashboardStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleReviewAttempt = async (attemptId) => {
    setModalLoading(true);
    try {
      const res = await testApi.getAttemptById(attemptId);
      if (res.success && res.attempt) {
        setReviewModalData(res.attempt);
      }
    } catch (err) {
      console.error('Failed to load attempt details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading student performance analytics...</p>
      </div>
    );
  }

  const categoryColors = ['#6366f1', '#a855f7', '#f59e0b', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Student Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/20 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Hello, {user?.name || 'Student'}!
                  </h1>
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{stats?.streakDays || 1} Day Streak</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{user?.college || 'Engineering Institute'}</span>
                  <span className="text-slate-500">•</span>
                  <span>{user?.branch || 'Computer Science'}</span>
                  <span className="text-slate-500">•</span>
                  <span>Class of {user?.graduationYear || 2027}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(user?.targetCompanies || ['Google', 'Microsoft']).map((comp) => (
                    <span key={comp} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300">
                      🎯 {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/practice/aptitude"
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Practice Drill</span>
              </Link>
              <Link
                to="/ai-interview"
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition-all flex items-center gap-2"
              >
                <Bot className="w-3.5 h-3.5 text-brand-400" />
                <span>AI Mock Interview</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5 KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Tests</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.totalTestsTaken || 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Timed practice tests</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Avg Accuracy</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats?.averageScore || 0}%</div>
            <p className="text-[11px] text-slate-400 mt-1">Overall correctness</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">AI Interviews</span>
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.interviewsCompleted || 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Role interviews cleared</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">GD Debates</span>
              <Brain className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.gdParticipated || 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Simulated & Live rooms</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Current Streak</span>
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats?.streakDays || 1} Days</div>
            <p className="text-[11px] text-slate-400 mt-1">Consecutive prep days</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Score Trend Line Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Score Progression Over Time</h3>
                <p className="text-xs text-slate-400">Historical accuracy trend across recent test attempts</p>
              </div>
              <TrendingUp className="w-4 h-4 text-brand-400" />
            </div>

            <div className="h-64 w-full">
              {stats?.scoreTrend && stats.scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#818cf8' }}
                      formatter={(val) => [`${val}%`, 'Accuracy']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#06b6d4' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <BarChart2 className="w-8 h-8 mb-2 opacity-50" />
                  <span>Take your first practice test to plot your score trajectory</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Proficiency Bar Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Category Proficiency</h3>
                <p className="text-xs text-slate-400">Accuracy percentage across placement topics</p>
              </div>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-64 w-full">
              {stats?.categoryPerformance ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="category" stroke="#6B7280" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val) => [`${val}%`, 'Proficiency']}
                    />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                      {stats.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <BarChart2 className="w-8 h-8 mb-2 opacity-50" />
                  <span>No test attempts recorded yet</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Weak Topic Recommendations */}
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Targeted Weak-Topic Recommendations
              </h3>
            </div>
            <span className="text-[11px] font-medium text-amber-400/80">
              AI Diagnostic Engine
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Based on your test attempts and campus frequency weights, these areas require targeted improvement:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(stats?.recommendations || []).map((rec) => (
              <div
                key={rec.topic}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">{rec.topic}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                      Focus Area
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <Link
                  to={`/practice/${rec.category}?subCategory=${encodeURIComponent(rec.topic)}`}
                  className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-brand-300 hover:text-white"
                >
                  <span>{rec.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts Table */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Recent Test Attempts</h3>
              <p className="text-xs text-slate-400">Review your answers and detailed step-by-step explanations</p>
            </div>
            <Link
              to="/profile"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subcategory</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {stats.recentAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white capitalize">
                        {att.category.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {att.subCategory}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-300">
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            att.accuracyPercentage >= 70
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {att.accuracyPercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(att.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleReviewAttempt(att.id)}
                          className="px-2.5 py-1 rounded bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white transition-colors font-semibold"
                        >
                          Review Solutions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Clock className="w-8 h-8 mx-auto text-slate-500 opacity-50" />
              <p className="text-xs">No test attempts completed yet.</p>
              <Link
                to="/practice/aptitude"
                className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs"
              >
                Take First Practice Test
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Test Solutions Review Modal */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-white/10 shadow-2xl">
            
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
              <div>
                <h3 className="font-bold text-white text-base">
                  Test Attempt Review ({reviewModalData.subCategory})
                </h3>
                <p className="text-xs text-slate-400">
                  Score: {reviewModalData.score}/{reviewModalData.totalQuestions} ({reviewModalData.accuracyPercentage}% Accuracy)
                </p>
              </div>
              <button
                onClick={() => setReviewModalData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {reviewModalData.answers.map((ans, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-300">Question {idx + 1}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ans.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {ans.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                  </div>

                  {ans.passage && (
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs text-slate-300 border border-white/5 italic">
                      {ans.passage}
                    </div>
                  )}

                  <p className="text-sm font-semibold text-white">{ans.question}</p>

                  {ans.codeSnippet && (
                    <pre className="p-3 rounded-lg bg-black/60 font-mono text-xs text-cyan-300 overflow-x-auto border border-white/5">
                      {ans.codeSnippet}
                    </pre>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ans.options?.map((opt, optIdx) => {
                      const isSelected = ans.selectedOption === optIdx;
                      const isCorrect = ans.correctOption === optIdx;
                      let badgeStyle = 'bg-slate-900/60 border-white/5 text-slate-300';
                      if (isCorrect) badgeStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                      else if (isSelected && !isCorrect) badgeStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-lg border flex items-center justify-between ${badgeStyle}`}>
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-brand-950/40 border border-brand-500/20 text-xs space-y-1">
                    <span className="font-bold text-brand-300 uppercase tracking-wider text-[10px]">
                      Step-by-Step Explanation:
                    </span>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {ans.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setReviewModalData(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
              >
                Close Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
