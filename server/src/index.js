import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB, isConnectedToMongo } from './config/db.js';
import { runSeed } from './seed.js';
import { setupGDSignaling } from './socket/gdSignaling.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getAIStatus } from './services/aiService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import aiInterviewRoutes from './routes/aiInterviewRoutes.js';
import gdRoutes from './routes/gdRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isConnectedToMongo ? 'MongoDB Connected' : 'PlaceMentor Resilient Local Storage',
    ai: getAIStatus()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/interview', aiInterviewRoutes);
app.use('/api/gd', gdRoutes);
app.use('/api/user', userRoutes);

// WebRTC and real-time collaboration signaling
setupGDSignaling(io);

// Global Error Handler
app.use(errorHandler);

// Bootstrap Server & Database
const startServer = async () => {
  try {
    await connectDB();
    await runSeed();

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 PlaceMentor Backend running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO signaling active for Live Group Discussions`);
      console.log(`🤖 AI Provider: ${getAIStatus().provider.toUpperCase()} (${getAIStatus().model})`);
      console.log(`🗄️  Database Status: ${isConnectedToMongo ? 'MongoDB Connected' : 'Resilient Local Storage Active'}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
