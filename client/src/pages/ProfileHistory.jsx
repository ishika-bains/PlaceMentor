import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { testApi, interviewApi, gdApi } from '../services/api';
import {
  User,
  Mail,
  Building,
  BookOpen,
  Calendar,
  Briefcase,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Edit3,
  Bot,
  Brain,
  FileText,
  RotateCcw,
  Loader2,
  Save,
  X
} from 'lucide-react';

export default function ProfileHistory() {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('tests'); // 'tests', 'interviews', 'gds'
  const [testsHistory, setTestsHistory] = useState([]);
  const [interviewsHistory, setInterviewsHistory] = useState([]);
  const [gdsHistory, setGdsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || new Date().getFullYear() + 1,
    targetCompanies: user?.targetCompanies?.join(', ') || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  // Selected Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalType, setDetailModalType] = useState(null); // 'test', 'interview', 'gd'

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        college: user.college || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || new Date().getFullYear() + 1,
        targetCompanies: user.targetCompanies?.join(', ') || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const loadAllHistory = async () => {
      try {
        const [testsRes, interviewRes, gdRes] = await Promise.all([
          testApi.getHistory().catch(() => ({ attempts: [] })),
          interviewApi.getHistory().catch(() => ({ sessions: [] })),
          gdApi.getHistory().catch(() => ({ sessions: [] })),
        ]);

        setTestsHistory(testsRes.attempts || []);
        setInterviewsHistory(interviewRes.sessions || []);
        setGdsHistory(gdRes.sessions || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadAllHistory();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const companiesArray = editFormData.targetCompanies
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const res = await updateProfile({
      name: editFormData.name,
      college: editFormData.college,
      branch: editFormData.branch,
      graduationYear: Number(editFormData.graduationYear),
      targetCompanies: companiesArray,
      bio: editFormData.bio,
      avatar: editFormData.avatar,
    });

    if (res.success) {
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  const openTestReview = async (attemptId) => {
    try {
      const res = await testApi.getAttemptById(attemptId);
      if (res.success && res.attempt) {
        setSelectedItem(res.attempt);
        setDetailModalType('test');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openInterviewDetails = (session) => {
    setSelectedItem(session);
    setDetailModalType('interview');
  };

  const openGDDetails = (session) => {
    setSelectedItem(session);
    setDetailModalType('gd');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card Banner */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

          {saveSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={user?.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-xl"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{user?.stats?.streakDays || 1} Day Streak</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                    <span>{user?.email}</span>
                    <span>•</span>
                    <span>{user?.college}</span>
                    <span>•</span>
                    <span>{user?.branch}</span>
                  </p>

                  <p className="text-xs text-slate-300 italic max-w-xl">
                    "{user?.bio || 'Preparing diligently for upcoming campus recruitment opportunities.'}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(user?.targetCompanies || []).map((comp) => (
                      <span key={comp} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-semibold">
                        🎯 {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center justify-center gap-2 shrink-0 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

            </div>
          ) : (
            /* Inline Profile Editor */
            <form onSubmit={handleSaveProfile} className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">Edit Candidate Profile</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">College</label>
                  <input
                    type="text"
                    value={editFormData.college}
                    onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Branch / Degree</label>
                  <input
                    type="text"
                    value={editFormData.branch}
                    onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editFormData.graduationYear}
                    onChange={(e) => setEditFormData({ ...editFormData, graduationYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Target Companies (comma separated)</label>
                  <input
                    type="text"
                    value={editFormData.targetCompanies}
                    onChange={(e) => setEditFormData({ ...editFormData, targetCompanies: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Bio / Headline</label>
                  <input
                    type="text"
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 shadow-md shadow-brand-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tests Taken</span>
              <span className="text-xl font-black text-white font-mono">{testsHistory.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Interviews</span>
              <span className="text-xl font-black text-purple-400 font-mono">{interviewsHistory.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">GD Sessions</span>
              <span className="text-xl font-black text-amber-400 font-mono">{gdsHistory.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Year</span>
              <span className="text-xl font-black text-cyan-400 font-mono">{user?.graduationYear || 2027}</span>
            </div>
          </div>
        </div>

        {/* History Records Section */}
        <div className="space-y-4">
          
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Practice Tests ({testsHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'interviews'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Mock Interviews ({interviewsHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gds')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'gds'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Group Discussions ({gdsHistory.length})</span>
            </button>
          </div>

          {/* Tab 1: Practice Tests History */}
          {activeTab === 'tests' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              {testsHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Subtopic</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Accuracy</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {testsHistory.map((att) => (
                        <tr key={att.id} className="hover:bg-white/5">
                          <td className="py-3.5 px-4 font-semibold text-white capitalize">
                            {att.category.replace('_', ' ')}
                          </td>
                          <td className="py-3.5 px-4">{att.subCategory}</td>
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
                            {new Date(att.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => openTestReview(att.id)}
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
                <div className="py-12 text-center text-slate-400 text-xs">
                  No practice test attempts recorded yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: AI Mock Interviews History */}
          {activeTab === 'interviews' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              {interviewsHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interviewsHistory.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            {s.experienceLevel}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base">{s.role}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {s.messages?.length || 0} discussion exchanges conducted
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300">
                          Rating: {s.finalFeedback?.overallScore || 7.5} / 10
                        </span>
                        <button
                          onClick={() => openInterviewDetails(s)}
                          className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          View Transcript
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No mock interviews completed yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Group Discussions History */}
          {activeTab === 'gds' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              {gdsHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gdsHistory.map((g) => (
                    <div
                      key={g.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {g.category || 'Technology'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(g.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{g.topic}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {g.transcript?.length || 0} statements recorded
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">
                          Appraisal: {g.evaluation?.overallScore || 8} / 10
                        </span>
                        <button
                          onClick={() => openGDDetails(g)}
                          className="px-3 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          View Assessment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No group discussion sessions recorded yet.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Details View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-white/10 shadow-2xl">
            
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-white text-base">
                {detailModalType === 'test' && `Test Review: ${selectedItem.subCategory}`}
                {detailModalType === 'interview' && `Mock Interview Transcript: ${selectedItem.role}`}
                {detailModalType === 'gd' && `GD Assessment: ${selectedItem.topic}`}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {detailModalType === 'test' && (
                <div className="space-y-4">
                  {selectedItem.answers?.map((ans, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
                      <div className="flex justify-between font-bold text-white">
                        <span>Q{idx + 1}. {ans.question}</span>
                        <span className={ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {ans.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-slate-300 italic whitespace-pre-line bg-black/40 p-2.5 rounded-lg">
                        {ans.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {detailModalType === 'interview' && (
                <div className="space-y-4">
                  {selectedItem.messages?.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        m.role === 'interviewer'
                          ? 'bg-slate-800/80 border-white/10 text-white'
                          : 'bg-purple-900/30 border-purple-500/30 text-purple-200'
                      }`}
                    >
                      <div className="font-bold text-[11px] mb-1 capitalize text-cyan-400">
                        {m.role === 'interviewer' ? 'AI Interviewer' : 'Candidate'}
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                      {m.feedback && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-slate-400 text-[11px]">
                          <strong>Feedback:</strong> {m.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {detailModalType === 'gd' && (
                <div className="space-y-4">
                  {selectedItem.transcript?.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5">
                      <div className="font-bold text-brand-300 mb-1">{t.speaker}</div>
                      <p className="text-slate-200 leading-relaxed">{t.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
