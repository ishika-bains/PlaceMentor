import bcrypt from 'bcryptjs';
import { UserRepository } from '../models/index.js';
import { generateToken } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, college, branch, graduationYear, targetCompanies } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email address, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      college: college || 'Engineering Institute',
      branch: branch || 'Computer Science & Engineering',
      graduationYear: graduationYear ? Number(graduationYear) : new Date().getFullYear() + 1,
      targetCompanies: targetCompanies || ['Google', 'Microsoft', 'Amazon', 'TCS Digital', 'Infosys DSE'],
    });

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to PlaceMentor.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check streak
    const now = new Date();
    const lastActive = user.stats?.lastActiveDate ? new Date(user.stats.lastActiveDate) : null;
    let streakDays = user.stats?.streakDays || 1;

    if (lastActive) {
      const diffHours = (now - lastActive) / (1000 * 60 * 60);
      if (diffHours >= 24 && diffHours < 48) {
        streakDays += 1;
      } else if (diffHours >= 48) {
        streakDays = 1; // streak reset
      }
    }

    const updatedUser = await UserRepository.update(user.id, {
      'stats.lastActiveDate': now.toISOString(),
      'stats.streakDays': streakDays
    });

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = updatedUser || user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await UserRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password: _, ...safeUser } = user;
    res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, college, branch, graduationYear, targetCompanies, bio, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (college) updateData.college = college;
    if (branch) updateData.branch = branch;
    if (graduationYear) updateData.graduationYear = Number(graduationYear);
    if (Array.isArray(targetCompanies)) updateData.targetCompanies = targetCompanies;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    const updated = await UserRepository.update(req.user.id, updateData);
    const { password: _, ...safeUser } = updated;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};
