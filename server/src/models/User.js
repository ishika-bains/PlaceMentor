import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  college: {
    type: String,
    default: 'Engineering Institute',
    trim: true,
  },
  branch: {
    type: String,
    default: 'Computer Science & Engineering',
    trim: true,
  },
  graduationYear: {
    type: Number,
    default: new Date().getFullYear() + 1,
  },
  targetCompanies: {
    type: [String],
    default: ['Google', 'Microsoft', 'Amazon', 'TCS Digital', 'Infosys DSE'],
  },
  bio: {
    type: String,
    default: 'Aspiring Software Development Engineer preparing for upcoming campus placement drives.',
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  },
  stats: {
    testsTaken: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    interviewsCount: { type: Number, default: 0 },
    gdCount: { type: Number, default: 0 },
    streakDays: { type: Number, default: 1 },
    lastActiveDate: { type: Date, default: Date.now },
  },
  weakTopics: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
