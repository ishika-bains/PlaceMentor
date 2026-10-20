import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { testApi } from '../services/api';
import {
  Calculator,
  Brain,
  BookOpen,
  Cpu,
  Clock,
  Play,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronRight
} from 'lucide-react';

const CATEGORY_META = {
  aptitude: {
    id: 'aptitude',
    title: 'Quantitative Aptitude',
    subtitle: 'High frequency in Tier-1 & MNC campus placement aptitude screening rounds',
    icon: Calculator,
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    subCategories: ['All', 'Time & Work', 'Speed, Distance & Time', 'Profit & Loss', 'Percentages', 'Probability', 'Permutations & Combinations']
  },
  logical_reasoning: {
    id: 'logical_reasoning',
    title: 'Logical Reasoning',
    subtitle: 'Analytical thinking, relational deductions, and sequential pattern recognition',
    icon: Brain,
    gradient: 'from-purple-600 via-pink-600 to-rose-500',
    subCategories: ['All', 'Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Direction Sense', 'Seating Arrangement', 'Series & Sequences']
  },
  verbal_ability: {
    id: 'verbal_ability',
    title: 'Verbal Ability',
    subtitle: 'Grammar mechanics, vocabulary in context, and technical reading comprehension',
    icon: BookOpen,
    gradient: 'from-amber-600 via-orange-600 to-yellow-500',
    subCategories: ['All', 'Spotting Errors', 'Vocabulary & Antonyms', 'Sentence Improvement', 'Reading Comprehension']
  },
  core_cs: {
    id: 'core_cs',
    title: 'Core Computer Science',
    subtitle: 'OS, DBMS & SQL, Computer Networks, OOP, and DSA fundamentals for technical interviews',
    icon: Cpu,
    gradient: 'from-cyan-600 via-teal-600 to-emerald-500',
    subCategories: ['All', 'Operating Systems', 'DBMS & SQL', 'Computer Networks', 'Data Structures & Algorithms', 'Object Oriented Programming', 'Software Engineering']
  }
};

export default function PracticeCategory() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = CATEGORY_META[categoryId] || CATEGORY_META.aptitude;
  const initialSubCat = searchParams.get('subCategory') || 'All';

  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCat);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        const res = await testApi.getQuestions({
          category: currentCategory.id,
          subCategory: selectedSubCategory !== 'All' ? selectedSubCategory : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
          limit: 3
        });
        if (res.success && res.questions) {
          setPreviewQuestions(res.questions);
        }
      } catch (err) {
        console.error('Failed to fetch preview questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [categoryId, selectedSubCategory, selectedDifficulty]);

  const handleStartTest = () => {
    const params = new URLSearchParams({
      category: currentCategory.id,
      subCategory: selectedSubCategory,
      difficulty: selectedDifficulty,
      limit: questionCount,
      duration: timerMinutes
    });
    navigate(`/test-session?${params.toString()}`);
  };

  const Icon = currentCategory.icon;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Category Header Banner */}
        <div className={`relative rounded-3xl p-8 bg-gradient-to-r ${currentCategory.gradient} shadow-2xl overflow-hidden`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Icon className="w-9 h-9 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    Topic Practice Module
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold">{currentCategory.title}</h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-xl mt-1">
                  {currentCategory.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-current text-slate-900" />
              <span>Launch Test Now</span>
            </button>
          </div>
        </div>

        {/* Subcategories Filter Pills */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Select Sub-Topic</span>
            </h3>
            <span className="text-xs text-slate-400">
              Filtering by: <strong className="text-brand-300">{selectedSubCategory}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentCategory.subCategories.map((sub) => {
              const isSelected = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-2 ring-brand-400'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Configuration Controls & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Test Setup Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6 lg:col-span-1 h-fit">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>Configure Your Test Session</span>
            </h3>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-brand-600/30 border-brand-500 text-brand-300'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      questionCount === cnt
                        ? 'bg-brand-600 text-white border-brand-500'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>Timer Duration</span>
                <span className="text-cyan-400 font-bold">{timerMinutes} Minutes</span>
              </label>
              <input
                type="range"
                min="5"
                max="45"
                step="5"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5m</span>
                <span>15m</span>
                <span>30m</span>
                <span>45m</span>
              </div>
            </div>

            {/* Test Rules Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Test Guidelines:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>+1.00 Mark for every correct response</li>
                <li>No negative marking (Standard practice mode)</li>
                <li>Detailed step-by-step solutions unlocked upon submit</li>
                <li>Performance updates your weak-topic diagnosis</li>
              </ul>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartTest}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Timed Practice ({questionCount} Qs)</span>
            </button>
          </div>

          {/* Sample Questions Preview */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Sample Question Bank Preview</h3>
                <p className="text-xs text-slate-400">Previewing curated questions for {selectedSubCategory}</p>
              </div>
              <span className="text-xs text-brand-300 font-medium">Real Placement Patterns</span>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <span className="text-xs">Fetching sample questions...</span>
              </div>
            ) : previewQuestions.length > 0 ? (
              <div className="space-y-4">
                {previewQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {q.subCategory}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {q.difficulty}
                      </span>
                    </div>

                    {q.passage && (
                      <p className="p-3 rounded-lg bg-black/40 text-xs text-slate-300 border border-white/5 italic">
                        {q.passage}
                      </p>
                    )}

                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {idx + 1}. {q.question}
                    </p>

                    {q.codeSnippet && (
                      <pre className="p-3 rounded-lg bg-black/60 font-mono text-xs text-cyan-300 border border-white/5 overflow-x-auto">
                        {q.codeSnippet}
                      </pre>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="p-2 rounded-lg bg-slate-800/50 border border-white/5">
                          <span className="font-bold text-brand-400 mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No questions found for the chosen sub-category. Try switching to "All".
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
