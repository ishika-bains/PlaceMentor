import UserModel from './User.js';
import QuestionModel from './Question.js';
import TestAttemptModel from './TestAttempt.js';
import InterviewSessionModel from './InterviewSession.js';
import GDSessionModel from './GDSession.js';
import { isConnectedToMongo, getStore, saveLocalDb } from '../config/db.js';
import crypto from 'crypto';

const generateId = () => crypto.randomBytes(12).toString('hex');

// Normalize Mongo _id / local id
const formatItem = (item) => {
  if (!item) return null;
  const obj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
};

/* ================= USER REPOSITORY ================= */
export const UserRepository = {
  async findByEmail(email) {
    if (isConnectedToMongo) {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return formatItem(user);
    }
    const store = getStore();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  },

  async findById(id) {
    if (isConnectedToMongo) {
      const user = await UserModel.findById(id);
      return formatItem(user);
    }
    const store = getStore();
    const user = store.users.find(u => (u.id === id || u._id === id));
    return user ? { ...user } : null;
  },

  async create(userData) {
    if (isConnectedToMongo) {
      const user = await UserModel.create(userData);
      return formatItem(user);
    }
    const store = getStore();
    const id = generateId();
    const newUser = {
      _id: id,
      id,
      college: 'Engineering Institute',
      branch: 'Computer Science & Engineering',
      graduationYear: new Date().getFullYear() + 1,
      targetCompanies: ['Google', 'Microsoft', 'Amazon', 'TCS Digital', 'Infosys DSE'],
      bio: 'Aspiring Software Development Engineer preparing for upcoming campus placement drives.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      stats: {
        testsTaken: 0,
        avgScore: 0,
        interviewsCount: 0,
        gdCount: 0,
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
      },
      weakTopics: [],
      createdAt: new Date().toISOString(),
      ...userData,
    };
    store.users.push(newUser);
    saveLocalDb();
    return { ...newUser };
  },

  async update(id, updateData) {
    if (isConnectedToMongo) {
      const updated = await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      return formatItem(updated);
    }
    const store = getStore();
    const index = store.users.findIndex(u => u.id === id || u._id === id);
    if (index === -1) return null;
    store.users[index] = { ...store.users[index], ...updateData };
    saveLocalDb();
    return { ...store.users[index] };
  }
};

/* ================= QUESTION REPOSITORY ================= */
export const QuestionRepository = {
  async find(filter = {}) {
    if (isConnectedToMongo) {
      const query = {};
      if (filter.category) query.category = filter.category;
      if (filter.subCategory) query.subCategory = filter.subCategory;
      if (filter.difficulty) query.difficulty = filter.difficulty;
      const questions = await QuestionModel.find(query).limit(filter.limit || 100);
      return questions.map(formatItem);
    }
    const store = getStore();
    let result = [...store.questions];
    if (filter.category) {
      result = result.filter(q => q.category === filter.category);
    }
    if (filter.subCategory) {
      result = result.filter(q => q.subCategory.toLowerCase() === filter.subCategory.toLowerCase());
    }
    if (filter.difficulty) {
      result = result.filter(q => q.difficulty.toLowerCase() === filter.difficulty.toLowerCase());
    }
    if (filter.limit) {
      result = result.slice(0, filter.limit);
    }
    return result;
  },

  async findById(id) {
    if (isConnectedToMongo) {
      const q = await QuestionModel.findById(id);
      return formatItem(q);
    }
    const store = getStore();
    const q = store.questions.find(item => item.id === id || item._id === id);
    return q ? { ...q } : null;
  },

  async count(filter = {}) {
    if (isConnectedToMongo) {
      return await QuestionModel.countDocuments(filter);
    }
    const store = getStore();
    if (!filter.category && !filter.subCategory) return store.questions.length;
    return store.questions.filter(q => {
      if (filter.category && q.category !== filter.category) return false;
      if (filter.subCategory && q.subCategory !== filter.subCategory) return false;
      return true;
    }).length;
  },

  async createMany(items) {
    if (isConnectedToMongo) {
      const inserted = await QuestionModel.insertMany(items);
      return inserted.map(formatItem);
    }
    const store = getStore();
    const formatted = items.map(q => ({
      ...q,
      _id: q._id || generateId(),
      id: q.id || q._id || generateId(),
      createdAt: new Date().toISOString()
    }));
    store.questions.push(...formatted);
    saveLocalDb();
    return formatted;
  }
};

/* ================= TEST ATTEMPT REPOSITORY ================= */
export const TestAttemptRepository = {
  async create(data) {
    if (isConnectedToMongo) {
      const attempt = await TestAttemptModel.create(data);
      return formatItem(attempt);
    }
    const store = getStore();
    const id = generateId();
    const newAttempt = {
      ...data,
      _id: id,
      id,
      createdAt: new Date().toISOString()
    };
    store.testAttempts.push(newAttempt);
    saveLocalDb();
    return { ...newAttempt };
  },

  async findByUser(userId, limit = 50) {
    if (isConnectedToMongo) {
      const attempts = await TestAttemptModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
      return attempts.map(formatItem);
    }
    const store = getStore();
    return store.testAttempts
      .filter(a => String(a.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  async findById(id) {
    if (isConnectedToMongo) {
      const attempt = await TestAttemptModel.findById(id);
      return formatItem(attempt);
    }
    const store = getStore();
    const attempt = store.testAttempts.find(a => a.id === id || a._id === id);
    return attempt ? { ...attempt } : null;
  }
};

/* ================= INTERVIEW REPOSITORY ================= */
export const InterviewRepository = {
  async create(data) {
    if (isConnectedToMongo) {
      const session = await InterviewSessionModel.create(data);
      return formatItem(session);
    }
    const store = getStore();
    const id = generateId();
    const newSession = {
      ...data,
      _id: id,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.interviewSessions.push(newSession);
    saveLocalDb();
    return { ...newSession };
  },

  async findById(id) {
    if (isConnectedToMongo) {
      const session = await InterviewSessionModel.findById(id);
      return formatItem(session);
    }
    const store = getStore();
    const session = store.interviewSessions.find(s => s.id === id || s._id === id);
    return session ? { ...session } : null;
  },

  async findByUser(userId) {
    if (isConnectedToMongo) {
      const sessions = await InterviewSessionModel.find({ userId }).sort({ createdAt: -1 });
      return sessions.map(formatItem);
    }
    const store = getStore();
    return store.interviewSessions
      .filter(s => String(s.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async update(id, updateData) {
    if (isConnectedToMongo) {
      const updated = await InterviewSessionModel.findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true }
      );
      return formatItem(updated);
    }
    const store = getStore();
    const index = store.interviewSessions.findIndex(s => s.id === id || s._id === id);
    if (index === -1) return null;
    store.interviewSessions[index] = {
      ...store.interviewSessions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    saveLocalDb();
    return { ...store.interviewSessions[index] };
  }
};

/* ================= GD REPOSITORY ================= */
export const GDRepository = {
  async create(data) {
    if (isConnectedToMongo) {
      const session = await GDSessionModel.create(data);
      return formatItem(session);
    }
    const store = getStore();
    const id = generateId();
    const newSession = {
      ...data,
      _id: id,
      id,
      createdAt: new Date().toISOString()
    };
    store.gdSessions.push(newSession);
    saveLocalDb();
    return { ...newSession };
  },

  async findById(id) {
    if (isConnectedToMongo) {
      const session = await GDSessionModel.findById(id);
      return formatItem(session);
    }
    const store = getStore();
    const session = store.gdSessions.find(s => s.id === id || s._id === id);
    return session ? { ...session } : null;
  },

  async findByUser(userId) {
    if (isConnectedToMongo) {
      const sessions = await GDSessionModel.find({ userId }).sort({ createdAt: -1 });
      return sessions.map(formatItem);
    }
    const store = getStore();
    return store.gdSessions
      .filter(s => String(s.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};
