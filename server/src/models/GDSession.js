import mongoose from 'mongoose';

const GDSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mode: {
    type: String,
    enum: ['ai_simulated', 'live_room'],
    default: 'ai_simulated',
  },
  topic: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Technology',
  },
  transcript: [
    {
      speaker: { type: String, required: true },
      role: { type: String, default: 'participant' },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  evaluation: {
    contentQuality: { type: Number, default: 0 },
    communicationClarity: { type: Number, default: 0 },
    listeningAndRebuttal: { type: Number, default: 0 },
    leadershipAndInitiative: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.GDSession || mongoose.model('GDSession', GDSessionSchema);
