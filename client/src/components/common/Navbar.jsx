import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Brain,
  Video,
  Bot,
  User,
  LogOut,
  Flame,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practiceDropdown, setPracticeDropdown] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Interview', path: '/ai-interview', icon: Bot, badge: 'AI' },
    { name: 'AI GD Room', path: '/ai-gd', icon: Brain, badge: 'Smart' },
    { name: 'Live WebRTC GD', path: '/live-gd', icon: Video, badge: 'Live' },
    { name: 'Profile & History', path: '/profile', icon: User },
  ];

  const practiceCategories = [
    { name: 'Quantitative Aptitude', path: '/practice/aptitude', color: 'text-blue-400' },
    { name: 'Logical Reasoning', path: '/practice/logical_reasoning', color: 'text-purple-400' },
    { name: 'Verbal Ability', path: '/practice/verbal_ability', color: 'text-amber-400' },
    { name: 'Core Computer Science', path: '/practice/core_cs', color: 'text-cyan-400' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                PlaceMentor
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-cyan-400 -mt-1">
                AI Placement Prep
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Practice Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPracticeDropdown(!practiceDropdown)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.startsWith('/practice')
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Topic Practice</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {practiceDropdown && (
                  <div
                    onMouseLeave={() => setPracticeDropdown(false)}
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                      Categories
                    </div>
                    {practiceCategories.map((cat) => (
                      <Link
                        key={cat.path}
                        to={cat.path}
                        onClick={() => setPracticeDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-brand-600/20 hover:text-white transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full ${cat.color.replace('text-', 'bg-')}`}></span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#topics" className="hover:text-white transition-colors">Topics</a>
              <a href="#interview" className="hover:text-white transition-colors">AI Interview</a>
              <a href="#webrtc" className="hover:text-white transition-colors">Live GD</a>
            </div>
          )}

          {/* Right Action Section */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-inner">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>{user?.stats?.streakDays || 1} Day Streak</span>
                </div>

                {/* Profile Pill */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-800/60 border border-white/10 hover:border-brand-500/40 transition-colors"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/40"
                  />
                  <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'Student'}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-brand-400" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-white/10">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
                  Topic Practice
                </p>
                {practiceCategories.map((cat) => (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.color.replace('text-', 'bg-')}`}></span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between px-3">
                <span className="text-xs text-slate-400">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-medium text-slate-200 bg-white/5 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-brand-600 rounded-lg"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
