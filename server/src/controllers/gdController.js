import { GDRepository, UserRepository } from '../models/index.js';
import {
  GD_TOPICS,
  generateGDAiResponses,
  evaluateGDSessionService,
  getAIStatus
} from '../services/aiService.js';

export const getGDTopics = async (req, res, next) => {
  try {
    const aiStatus = getAIStatus();
    res.status(200).json({
      success: true,
      topics: GD_TOPICS,
      aiStatus
    });
  } catch (error) {
    next(error);
  }
};

export const startGDSession = async (req, res, next) => {
  try {
    const { topic, category, mode = 'ai_simulated' } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to start a Group Discussion.'
      });
    }

    const moderatorOpening = {
      speaker: 'Moderator (Dr. Sen)',
      role: 'moderator',
      message: `Welcome everyone to today's placement Group Discussion on the topic: "${topic}". You will have 10-15 minutes to share your perspectives, debate constructively, and reach collaborative takeaways. Please introduce your initial perspective whenever you are ready.`,
      timestamp: new Date().toISOString()
    };

    const session = await GDRepository.create({
      userId,
      mode,
      topic,
      category: category || 'Technology',
      transcript: [moderatorOpening]
    });

    res.status(201).json({
      success: true,
      message: 'Group Discussion session started!',
      session: {
        id: session.id,
        topic: session.topic,
        category: session.category,
        mode: session.mode,
        transcript: session.transcript
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendGDMessage = async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;
    const userName = req.user.name || 'Candidate';

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required.'
      });
    }

    const session = await GDRepository.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'GD session not found'
      });
    }

    const candidateMsg = {
      speaker: userName,
      role: 'candidate',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedTranscript = [...session.transcript, candidateMsg];

    // Generate simulated peer reactions
    const aiPeers = await generateGDAiResponses({
      topic: session.topic,
      transcript: updatedTranscript,
      candidateMessage: message.trim()
    });

    for (const peer of aiPeers) {
      updatedTranscript.push({
        speaker: peer.speaker,
        role: peer.role,
        message: peer.message,
        timestamp: new Date().toISOString()
      });
    }

    await GDRepository.create({
      ...session,
      id: session.id,
      transcript: updatedTranscript
    }); // update session

    res.status(200).json({
      success: true,
      newMessages: [candidateMsg, ...aiPeers]
    });
  } catch (error) {
    next(error);
  }
};

export const completeGDSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    const userName = req.user.name || 'Candidate';

    const session = await GDRepository.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'GD session not found'
      });
    }

    const evaluation = await evaluateGDSessionService({
      topic: session.topic,
      transcript: session.transcript,
      candidateName: userName
    });

    const updated = await GDRepository.create({
      ...session,
      id: session.id,
      evaluation
    });

    // Update user stats
    const user = await UserRepository.findById(userId);
    if (user) {
      const pastSessions = await GDRepository.findByUser(userId);
      await UserRepository.update(userId, {
        'stats.gdCount': pastSessions.length
      });
    }

    res.status(200).json({
      success: true,
      message: 'Group Discussion evaluation complete!',
      evaluation,
      session: updated
    });
  } catch (error) {
    next(error);
  }
};

export const getUserGDSessions = async (req, res, next) => {
  try {
    const sessions = await GDRepository.findByUser(req.user.id);
    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

export const getGDSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await GDRepository.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'GD session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};
