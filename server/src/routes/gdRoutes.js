import express from 'express';
import {
  getGDTopics,
  startGDSession,
  sendGDMessage,
  completeGDSession,
  getUserGDSessions,
  getGDSessionById
} from '../controllers/gdController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/topics', getGDTopics);
router.post('/start', protect, startGDSession);
router.post('/message', protect, sendGDMessage);
router.post('/complete', protect, completeGDSession);
router.get('/history', protect, getUserGDSessions);
router.get('/session/:id', protect, getGDSessionById);

export default router;
