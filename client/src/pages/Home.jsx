import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Bot,
  Video,
  Brain,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  BookOpen,
  Calculator,
  ShieldAlert,
  Users,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const coreFeatures = [
    {
      title: 'Quantitative & Logical Aptitude',
      desc: 'Master Speed Math, Time & Work, Probability, Syllogisms, and Puzzles with timed tests and step-by-step mathematical solutions.',
      icon: Calculator,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Aptitude Tests'
    },
    {
      title: 'Core CS Foundations',
      desc: 'Deep-dive into Operating Systems, DBMS & SQL, Computer Networks, OOP, and DSA questions asked by Google, Amazon, and Microsoft.',
      icon: Cpu,
      color: 'from-cyan-500 to-emerald-600',
      tag: 'Technical Rounds'
    },
    {
      title: 'AI Mock Technical Interviews',
      desc: 'Role-based mock interviews for SDE, Frontend, and Backend. Speak or type answers and get instant turn-by-turn evaluation and feedback.',
      icon: Bot,
      color: 'from-purple-500 to-pink-600',
      tag: 'Speech-to-Text & Feedback'
    },
    {
      title: 'Multi-Agent AI GD Simulator',
      desc: 'Practice Group Discussions anytime with simulated AI peers (Priya, Rohan, Aman) and Dr. Sen who critique your content and rebuttal.',
      icon: Brain,
      color: 'from-amber-500 to-orange-600',
      tag: 'AI Simulation'
    },
    {
      title: 'Live WebRTC Video GD Rooms',
      desc: 'Coordinate live mock group discussions with batchmates in real-time rooms featuring audio/video streaming, hand-raising, and chat.',
      icon: Video,
      color: 'from-rose-500 to-red-600',
      tag: 'Real-Time WebRTC'
    },
    {
      title: 'Weak-Topic Diagnosis',
      desc: 'Intelligent performance analytics pinpoint low-scoring subjects and suggest laser-focused 10-minute drills to plug conceptual gaps.',
      icon: TrendingUp,
      color: 'from-teal-500 to-cyan-600',
      tag: 'Smart Analytics'
    }
  ];

  const targetCompanies = [
    'Google', 'Microsoft', 'Amazon', 'TCS Digital', 'Infosys DSE', 'Wipro Turbo', 'Cognizant GenC Next', 'Accenture'
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-inner animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI-Powered Placement Preparation Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Crack Your Dream Campus Placement with{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              AI-Driven Precision
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one placement suite for engineering students. Master Quantitative Aptitude, Logical Reasoning, Verbal, Core Computer Science, AI Voice Mock Interviews, and Live Collaborative Group Discussions.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-xl shadow-brand-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ai-interview"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-brand-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-brand-400" />
              <span>Launch AI Mock Interview</span>
            </Link>

            <Link
              to="/live-gd"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>Join Live WebRTC GD</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Mandatory Paid APIs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Google Gemini AI + Smart Fallback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Peer-to-Peer WebRTC Video Rooms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Companies Ticker */}
      <section className="py-8 border-y border-white/5 bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-4">
            Curated For Tier-1 Product & Top Service Placement Drives
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {targetCompanies.map((company) => (
              <span
                key={company}
                className="px-4 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-medium text-slate-200"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Complete Preparation Ecosystem
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need To Secure Your Offer Letter
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            From the initial aptitude screening test all the way to technical SDE rounds and group discussions, PlaceMentor guides every stage of your campus recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card rounded-2xl p-6 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {feat.tag}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center text-xs font-semibold text-brand-400 group-hover:text-cyan-300 transition-colors">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recruitment Stages Walkthrough */}
      <section className="py-20 bg-gradient-to-b from-[#090D16] to-[#07090E] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              The 5-Stage Placement Readiness Funnel
            </h3>
            <p className="text-xs text-slate-400">
              How PlaceMentor bridges your college syllabus with corporate evaluation criteria
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { stage: '1. Aptitude Round', desc: 'Time-pressured quantitative arithmetic, algebra & logic drills' },
              { stage: '2. Verbal & Reading', desc: 'Grammar rules, sentence corrections, and technical reading comprehension' },
              { stage: '3. Core CS Deep Dive', desc: 'OS deadlocks, DBMS normalization, networks, OOP and DSA' },
              { stage: '4. AI Mock Interview', desc: 'Dynamic role interviews with instant audio evaluation and feedback' },
              { stage: '5. GD & Placement Day', desc: 'Peer debates on hot industry topics with collaborative WebRTC rooms' },
            ].map((step, idx) => (
              <div key={step.stage} className="p-5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-brand-600/30 text-brand-400 font-extrabold text-xs flex items-center justify-center mb-3">
                    0{idx + 1}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1.5">{step.stage}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative rounded-3xl p-10 sm:p-14 overflow-hidden border border-brand-500/30 bg-gradient-to-tr from-brand-950/80 via-slate-900 to-indigo-950/80 shadow-2xl">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Accelerate Your Placement Success?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of students honing their aptitude, core CS concepts, AI mock interviews, and live group discussion skills on PlaceMentor.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/40 transition-all hover:scale-105"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}
              </Link>
              <Link
                to="/practice/aptitude"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Try Sample Practice Test
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
