import { InterviewRepository, UserRepository } from '../models/index.js';
import {
  getInitialInterviewQuestion,
  evaluateInterviewAnswer,
  generateInterviewFinalReport,
  getAIStatus
} from '../services/aiService.js';

export const getInterviewRoles = async (req, res, next) => {
  try {
    const roles = [
      {
        id: 'sde',
        name: 'Software Engineer (SDE I)',
        description: 'Covers Data Structures, Algorithms, Operating Systems, Database Indexing, and Core Problem Solving.',
        badge: 'Top Placement Demand',
        icon: 'Code2',
        gradient: 'from-blue-600 to-indigo-600'
      },
      {
        id: 'frontend',
        name: 'Frontend Developer',
        description: 'Focuses on React.js internals, JavaScript Event Loop, Web Performance, CSS architecture and Web Vitals.',
        badge: 'High UI/UX Focus',
        icon: 'Layout',
        gradient: 'from-cyan-600 to-blue-600'
      },
      {
        id: 'backend',
        name: 'Backend Developer',
        description: 'Evaluates Distributed Systems, REST & WebSockets, Database ACID vs CAP, and Microservice Scaling.',
        badge: 'High Scale & Security',
        icon: 'Server',
        gradient: 'from-emerald-600 to-teal-600'
      },
      {
        id: 'fullstack',
        name: 'Full Stack Developer',
        description: 'Holistic assessment covering frontend client logic, backend services, CI/CD pipelines and deployment.',
        badge: 'Versatile Product Engineering',
        icon: 'Layers',
        gradient: 'from-violet-600 to-purple-600'
      },
      {
        id: 'data-analyst',
        name: 'Data Analyst / Data Scientist',
        description: 'Tests Complex SQL Window Functions, Statistical Analysis, Feature Engineering and Business Problem Framing.',
        badge: 'Analytics & Insights',
        icon: 'BarChart3',
        gradient: 'from-amber-600 to-orange-600'
      }
    ];

    const experienceLevels = [
      'Fresher / Campus Placement',
      '1-2 Years Experience'
    ];

    const aiStatus = getAIStatus();

    res.status(200).json({
      success: true,
      roles,
      experienceLevels,
      aiStatus
    });
  } catch (error) {
    next(error);
  }
};

export const startInterviewSession = async (req, res, next) => {
  try {
    const { role, experienceLevel } = req.body;
    const userId = req.user.id;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a target role for the interview.'
      });
    }

    const initial = getInitialInterviewQuestion(role, experienceLevel || 'Fresher / Campus');
    const aiStatus = getAIStatus();

    const session = await InterviewRepository.create({
      userId,
      role,
      experienceLevel: experienceLevel || 'Fresher / Campus',
      status: 'in_progress',
      aiProvider: aiStatus.provider,
      messages: [
        {
          role: 'interviewer',
          text: initial.question,
          category: initial.category || 'Introductory',
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Interview session initialized!',
      session: {
        id: session.id,
        role: session.role,
        experienceLevel: session.experienceLevel,
        status: session.status,
        aiProvider: session.aiProvider,
        firstQuestion: initial.question,
        category: initial.category || 'Introductory',
        questionIndex: 0,
        totalQuestions: initial.totalQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitInterviewAnswer = async (req, res, next) => {
  try {
    const { sessionId, candidateAnswer, questionIndex = 0 } = req.body;

    if (!sessionId || !candidateAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and candidate answer are required.'
      });
    }

    const session = await InterviewRepository.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // Get current question from interviewer's latest message
    const interviewerMessages = session.messages.filter(m => m.role === 'interviewer');
    const currentQuestionText = interviewerMessages[interviewerMessages.length - 1]?.text || 'Tell me about yourself.';

    // Evaluate answer via AI Service
    const evaluation = await evaluateInterviewAnswer({
      role: session.role,
      experienceLevel: session.experienceLevel,
      questionText: currentQuestionText,
      candidateAnswer,
      questionIndex: Number(questionIndex)
    });

    const updatedMessages = [...session.messages];

    // Push candidate answer
    updatedMessages.push({
      role: 'candidate',
      text: candidateAnswer,
      timestamp: new Date().toISOString(),
      score: evaluation.score,
      relevance: evaluation.relevance,
      clarity: evaluation.clarity,
      technicalAccuracy: evaluation.technicalAccuracy,
      feedback: evaluation.feedback
    });

    // If there is another question, push interviewer follow-up
    if (evaluation.nextQuestion) {
      updatedMessages.push({
        role: 'interviewer',
        text: evaluation.nextQuestion,
        category: evaluation.nextCategory || 'Technical',
        timestamp: new Date().toISOString()
      });
    }

    await InterviewRepository.update(sessionId, {
      messages: updatedMessages,
      status: evaluation.isCompleted ? 'completed' : 'in_progress'
    });

    res.status(200).json({
      success: true,
      evaluation: {
        score: evaluation.score,
        relevance: evaluation.relevance,
        clarity: evaluation.clarity,
        technicalAccuracy: evaluation.technicalAccuracy,
        feedback: evaluation.feedback,
        followUpComment: evaluation.followUpComment,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        nextQuestion: evaluation.nextQuestion,
        nextCategory: evaluation.nextCategory,
        isCompleted: evaluation.isCompleted,
        aiProvider: evaluation.aiProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

export const finalizeInterviewSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    const session = await InterviewRepository.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    const report = await generateInterviewFinalReport({
      role: session.role,
      experienceLevel: session.experienceLevel,
      messages: session.messages
    });

    const updated = await InterviewRepository.update(sessionId, {
      status: 'completed',
      finalFeedback: report
    });

    // Update user stats
    const user = await UserRepository.findById(userId);
    if (user) {
      const pastSessions = await InterviewRepository.findByUser(userId);
      await UserRepository.update(userId, {
        'stats.interviewsCount': pastSessions.length
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview evaluation report generated!',
      report,
      session: updated
    });
  } catch (error) {
    next(error);
  }
};

export const getUserInterviews = async (req, res, next) => {
  try {
    const sessions = await InterviewRepository.findByUser(req.user.id);
    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await InterviewRepository.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
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
