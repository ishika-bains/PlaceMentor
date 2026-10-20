import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['aptitude', 'logical_reasoning', 'verbal_ability', 'core_cs'],
  },
  subCategory: {
    type: String,
    required: true,
  },
  passage: {
    type: String,
    default: null, // For Reading Comprehension
  },
  question: {
    type: String,
    required: true,
  },
  codeSnippet: {
    type: String,
    default: null, // For Core CS questions with code examples
  },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length >= 2, 'Question must have at least 2 options'],
  },
  correctOption: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
