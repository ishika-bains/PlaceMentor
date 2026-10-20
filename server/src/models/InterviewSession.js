import mongoose from 'mongoose';

const InterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,
    default: 'Fresher / Campus',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  messages: [
    {
      role: { type: String, enum: ['interviewer', 'candidate'] },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      score: { type: Number, default: null },
      feedback: { type: String, default: null },
    },
  ],
  finalFeedback: {
    overallScore: { type: Number, default: 0 },
    technicalAccuracy: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    areasForImprovement: { type: [String], default: [] },
    summary: { type: String, default: '' },
    recommendations: { type: [String], default: [] },
  },
  aiProvider: {
    type: String,
    default: 'builtin-mock',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.InterviewSession || mongoose.model('InterviewSession', InterviewSessionSchema);
