import express from 'express';
import {
  getCategories,
  getQuestions,
  submitTest,
  getTestAttemptById,
  getUserTestHistory
} from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/questions', getQuestions);
router.post('/submit', protect, submitTest);
router.get('/attempt/:id', protect, getTestAttemptById);
router.get('/history', protect, getUserTestHistory);

export default router;
