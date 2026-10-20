import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05070B] border-t border-white/5 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">PlaceMentor</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Campus Placement Preparation Platform. Master Quantitative Aptitude, Logical Reasoning, Verbal Ability, Core CS, AI Mock Interviews, and Live Collaborative Group Discussions.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Ready Platform</span>
            </div>
          </div>

          {/* Practice Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Topic Practice</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/practice/aptitude" className="hover:text-brand-300 transition-colors">Quantitative Aptitude</a></li>
              <li><a href="/practice/logical_reasoning" className="hover:text-brand-300 transition-colors">Logical Reasoning</a></li>
              <li><a href="/practice/verbal_ability" className="hover:text-brand-300 transition-colors">Verbal Ability</a></li>
              <li><a href="/practice/core_cs" className="hover:text-brand-300 transition-colors">Core Computer Science</a></li>
              <li><a href="/practice/core_cs" className="hover:text-brand-300 transition-colors">DBMS & SQL Interview Questions</a></li>
            </ul>
          </div>

          {/* AI & Collaborative Tools */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">AI & Real-Time Prep</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/ai-interview" className="hover:text-brand-300 transition-colors">AI SDE Mock Interview</a></li>
              <li><a href="/ai-interview" className="hover:text-brand-300 transition-colors">Frontend & Backend Roles</a></li>
              <li><a href="/ai-gd" className="hover:text-brand-300 transition-colors">Multi-Agent AI GD Simulator</a></li>
              <li><a href="/live-gd" className="hover:text-brand-300 transition-colors">Live WebRTC Video GD Rooms</a></li>
              <li><a href="/dashboard" className="hover:text-brand-300 transition-colors">Weak Topic Diagnosis</a></li>
            </ul>
          </div>

          {/* Technology & Architecture */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Stack Architecture</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">React 19</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">Vite</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">Tailwind CSS</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">Node.js Express</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">Socket.IO</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">WebRTC</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">Recharts</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/5">Gemini AI</span>
            </div>
            <p className="mt-4 text-[11px] text-slate-500">
              Zero mandatory paid dependencies. Built-in resilient local persistence and smart evaluation fallback.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} PlaceMentor Platform. Designed for Engineering & College Placements.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered with precision for student success</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
