# PlaceMentor — AI-Powered Placement Preparation Platform

> An all-in-one full-stack campus placement preparation platform for engineering and computer science students. Built with React 19, Vite, Tailwind CSS, Node.js, Express, MongoDB/Mongoose, Socket.IO, and WebRTC.

---

## 🌟 Key Features

1. **Authentication & Student Profiles:**
   - Secure student registration, login, logout, and protected routes.
   - Passwords hashed with `bcryptjs`.
   - Stateless session management with JSON Web Tokens (`jsonwebtoken`).
   - Profile management with branch, graduation year, target companies, and personal headline.
   - One-click demo credentials for rapid testing.

2. **Analytics-Driven Student Dashboard:**
   - Key KPI stat cards: Tests taken, Average score, AI Interviews completed, GD participated, and daily prep streak.
   - Interactive score progression line chart over time using `Recharts`.
   - Topic proficiency breakdown bar chart.
   - Intelligent weak-topic diagnosis with targeted recommendations.
   - Recent test attempts list with detailed question and explanation review modals.

3. **Quantitative Aptitude & Logical Reasoning:**
   - Topic-wise MCQs: Time & Work, Speed, Distance & Time, Profit & Loss, Percentages, Probability, Permutations & Combinations, Syllogisms, Blood Relations, Coding-Decoding, Direction Sense, Seating Arrangement, and Number Series.
   - Timed tests with real-time countdown timer and visual alerts.
   - Question palette with status indicators (Answered, Unanswered, Marked for Review, Current).
   - Instant scoring, accuracy breakdown, and in-depth step-by-step mathematical explanations.

4. **Verbal Ability & Core Computer Science:**
   - Spotting Errors, Sentence Improvement, Vocabulary/Antonyms, and Reading Comprehension passages.
   - Technical question bank covering Operating Systems, DBMS & SQL, Computer Networks, Object-Oriented Programming (OOP), Data Structures & Algorithms (DSA), and Software Engineering.
   - Dark code snippet formatting for technical interview questions.

5. **AI Mock Technical Interview:**
   - Role-based mock interviews: Software Engineer (SDE I), Frontend Developer, Backend Developer, Full Stack Developer, and Data Analyst / Data Scientist.
   - Experience levels: Fresher / Campus Placement and 1-2 Years Experience.
   - Speech-to-Text integration via the browser Web Speech API (dictate answers using microphone).
   - Turn-by-turn evaluation: Score out of 10, immediate feedback, identified strengths, and targeted improvement suggestions.
   - Dynamic follow-up questions formulated based on the candidate's answer.
   - Comprehensive final appraisal report with ratings in Technical Accuracy, Communication, Problem Solving, Confidence, and actionable placement advice.
   - Supports Google Gemini API (`GEMINI_API_KEY`) with an intelligent, pre-calibrated built-in fallback mode when no key is configured.

6. **AI Multi-Agent Group Discussion:**
   - Realistic multi-persona simulation with 4 distinct simulated peers:
     - **Dr. Sen (Moderator):** Guides discussion flow and evaluates candidate contributions.
     - **Priya Sharma:** Analytical and data-driven perspective.
     - **Rohan Mehta:** Polite contrarian and edge-case thinker.
     - **Aman Verma:** Industry and corporate realist.
   - Voice or text input with live debate exchange.
   - Comprehensive GD appraisal scorecard measuring Content Quality, Communication Clarity, Listening & Rebuttal, and Leadership.

7. **Live Group Discussion Rooms (WebRTC & Socket.IO):**
   - Real-time rooms for peer group discussions.
   - Peer-to-peer audio and video streaming using WebRTC with public Google STUN signaling.
   - In-room real-time text chat with participant timestamps.
   - Hand-raising feature to indicate speaking intent.
   - Audio mute/unmute and video camera toggle.
   - Instant 6-character room codes with one-click copy links.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, Morgan, CORS, Dotenv |
| **Database** | MongoDB with Mongoose ODM (with automatic resilient local JSON persistence fallback if local MongoDB is offline) |
| **Signaling & RTC** | WebRTC (Mesh topology) with Socket.IO signaling & Google Public STUN servers |
| **AI Integration** | `@google/generative-ai` (Gemini 1.5 Flash) + Built-in Intelligent Fallback Engine |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher recommended; tested on v24)
- npm

### 2. Installation
Install all dependencies for root, server, and client:
```bash
# Root directory
npm run install:all
```
Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory (or edit `server/.env`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/placementor
JWT_SECRET=placementor_super_secret_jwt_key_2025_secure_dev
JWT_EXPIRE=7d

# Optional: Google Gemini API Key for Live Cloud AI Evaluation
# Obtain a free key at: https://aistudio.google.com/
# Leave blank to use PlaceMentor's built-in intelligent evaluation engine!
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

### 4. Seed the Question Bank
The server automatically populates questions on startup if the database is empty, but you can also run:
```bash
npm run seed
# or
cd server && npm run seed
```

### 5. Running the Application
Start both the backend server and frontend client concurrently:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

Click the **"Fill Demo"** button on the login page, or use:
- **Email:** `arjun@example.com`
- **Password:** `password123`

---

## 🌐 External Services & Zero-Cost Policy

PlaceMentor is engineered with **zero mandatory paid dependencies**:
- **Database:** If MongoDB is running locally or a MongoDB Atlas URI is provided, Mongoose connects seamlessly. If MongoDB is offline, PlaceMentor switches to its resilient local JSON persistence store (`server/data/local_db.json`), ensuring all accounts, tests, and statistics work without interruption.
- **AI Model:** If a free Google Gemini API key is supplied via `GEMINI_API_KEY`, the application connects to Gemini 1.5 Flash for dynamic interview grading. If left unconfigured, the platform automatically engages its pre-calibrated smart evaluation engine with full turn evaluations, strengths, and areas for improvement.
- **WebRTC STUN:** Uses Google's free public STUN servers (`stun:stun.l.google.com:19302`) for peer-to-peer audio and video NAT traversal.

---

## 📁 Repository Structure

```
PlaceMentor/
├── package.json               # Root scripts (seed, client, server, install)
├── .gitignore                 # Excluded files & directories
├── .env.example               # Template environment configuration
├── README.md                  # Complete documentation
├── server/
│   ├── package.json           # Server dependencies & scripts
│   ├── .env                   # Server environment config
│   ├── src/
│   │   ├── config/            # Database (MongoDB + Local fallback store)
│   │   ├── controllers/       # Auth, Test, AI Interview, GD, User controllers
│   │   ├── models/            # Mongoose schemas & Unified Repository layer
│   │   ├── routes/            # Express REST API routes
│   │   ├── middleware/        # JWT auth protection & error handling
│   │   ├── socket/            # WebRTC signaling & real-time room manager
│   │   ├── services/          # Gemini AI service & fallback evaluation engine
│   │   ├── data/              # 150+ comprehensive placement question bank
│   │   ├── index.js           # Server bootstrap & socket binding
│   │   └── seed.js            # Question seeding script
├── client/
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.js         # Vite configuration with API & WebSocket proxy
│   ├── tailwind.config.js     # Tailwind CSS theme & custom palette
│   ├── index.html             # HTML entry point with metadata & favicon
│   ├── src/
│   │   ├── components/        # Navbar, Footer, ProtectedRoute, Modals
│   │   ├── context/           # AuthContext & SocketContext (WebRTC)
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page with placement funnel & CTA
│   │   │   ├── Login.jsx      # Sign in with demo credentials autofill
│   │   │   ├── Register.jsx   # Candidate registration
│   │   │   ├── Dashboard.jsx  # Student analytics, Recharts, recommendations
│   │   │   ├── PracticeCategory.jsx # Quantitative, Reasoning, Verbal, Core CS hubs
│   │   │   ├── TestSession.jsx      # Timed MCQ test engine with navigator palette
│   │   │   ├── TestResult.jsx       # Scorecards, accuracy metrics & explanations
│   │   │   ├── AIMockInterview.jsx  # Speech-to-text role interview with feedback
│   │   │   ├── AIGroupDiscussion.jsx# Multi-agent simulated GD round table
│   │   │   └── LiveGroupDiscussion.jsx # WebRTC video/audio peer room with chat
│   │   ├── services/api.js    # Client REST API connector
│   │   ├── index.css          # Design system, glassmorphism, fonts & scrollbars
│   │   ├── App.jsx            # Routing and application entry
│   │   └── main.jsx           # React DOM root
```

---

## 📜 License
MIT License. Created for campus placement preparation and student career success.
