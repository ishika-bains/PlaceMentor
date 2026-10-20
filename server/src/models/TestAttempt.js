import mongoose from 'mongoose';

const TestAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  correctCount: {
    type: Number,
    required: true,
  },
  incorrectCount: {
    type: Number,
    required: true,
  },
  unansweredCount: {
    type: Number,
    default: 0,
  },
  timeTakenSeconds: {
    type: Number,
    required: true,
  },
  accuracyPercentage: {
    type: Number,
    required: true,
  },
  answers: [
    {
      questionId: { type: String, required: true },
      selectedOption: { type: Number, default: -1 }, // -1 for unanswered
      isCorrect: { type: Boolean, required: true },
      timeSpent: { type: Number, default: 0 },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TestAttempt || mongoose.model('TestAttempt', TestAttemptSchema);
