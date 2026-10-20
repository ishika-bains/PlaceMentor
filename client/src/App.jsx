import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PracticeCategory from './pages/PracticeCategory';
import TestSession from './pages/TestSession';
import TestResult from './pages/TestResult';
import AIMockInterview from './pages/AIMockInterview';
import AIGroupDiscussion from './pages/AIGroupDiscussion';
import LiveGroupDiscussion from './pages/LiveGroupDiscussion';
import ProfileHistory from './pages/ProfileHistory';

// 404 Page
function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-center p-6 text-slate-100">
      <div className="text-6xl font-black text-brand-500 mb-2 font-mono">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-400 mb-6 max-w-sm">
        The placement preparation module or path you requested does not exist.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
      >
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-[#07090E] flex flex-col justify-between selection:bg-brand-500 selection:text-white">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Student Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice/:categoryId"
                  element={
                    <ProtectedRoute>
                      <PracticeCategory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/test-session"
                  element={
                    <ProtectedRoute>
                      <TestSession />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/test-result/:attemptId"
                  element={
                    <ProtectedRoute>
                      <TestResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-interview"
                  element={
                    <ProtectedRoute>
                      <AIMockInterview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-gd"
                  element={
                    <ProtectedRoute>
                      <AIGroupDiscussion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/live-gd"
                  element={
                    <ProtectedRoute>
                      <LiveGroupDiscussion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
