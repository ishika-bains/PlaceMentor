import express from 'express';
import {
  getInterviewRoles,
  startInterviewSession,
  submitInterviewAnswer,
  finalizeInterviewSession,
  getUserInterviews,
  getInterviewById
} from '../controllers/aiInterviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/roles', getInterviewRoles);
router.post('/start', protect, startInterviewSession);
router.post('/answer', protect, submitInterviewAnswer);
router.post('/finalize', protect, finalizeInterviewSession);
router.get('/history', protect, getUserInterviews);
router.get('/session/:id', protect, getInterviewById);

export default router;
