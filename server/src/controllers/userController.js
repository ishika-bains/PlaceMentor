import { UserRepository, TestAttemptRepository, InterviewRepository, GDRepository } from '../models/index.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const testAttempts = await TestAttemptRepository.findByUser(userId, 50);
    const interviews = await InterviewRepository.findByUser(userId);
    const gdSessions = await GDRepository.findByUser(userId);

    // Calculate score trends (chronological)
    const sortedAttempts = [...testAttempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const scoreTrend = sortedAttempts.slice(-10).map((attempt, index) => ({
      testNumber: `Test #${index + 1}`,
      score: attempt.accuracyPercentage,
      category: attempt.category,
      date: new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Category performance breakdown
    const categoryStats = {
      aptitude: { totalScore: 0, count: 0, label: 'Aptitude' },
      logical_reasoning: { totalScore: 0, count: 0, label: 'Reasoning' },
      verbal_ability: { totalScore: 0, count: 0, label: 'Verbal' },
      core_cs: { totalScore: 0, count: 0, label: 'Core CS' }
    };

    testAttempts.forEach(att => {
      if (categoryStats[att.category]) {
        categoryStats[att.category].totalScore += att.accuracyPercentage;
        categoryStats[att.category].count += 1;
      }
    });

    const categoryPerformance = Object.keys(categoryStats).map(key => {
      const cat = categoryStats[key];
      return {
        category: cat.label,
        key,
        accuracy: cat.count > 0 ? Math.round(cat.totalScore / cat.count) : 0,
        testsTaken: cat.count
      };
    });

    // Compute average score
    const avgScore = testAttempts.length > 0
      ? Math.round(testAttempts.reduce((acc, c) => acc + c.accuracyPercentage, 0) / testAttempts.length)
      : (user.stats?.avgScore || 0);

    // Recent attempts (last 5)
    const recentAttempts = testAttempts.slice(0, 5).map(att => ({
      id: att.id,
      category: att.category,
      subCategory: att.subCategory,
      score: att.score,
      totalQuestions: att.totalQuestions,
      accuracyPercentage: att.accuracyPercentage,
      createdAt: att.createdAt
    }));

    // Weak topics recommendations
    const weakTopics = (user.weakTopics && user.weakTopics.length > 0)
      ? user.weakTopics
      : ['Speed, Distance & Time', 'Operating Systems', 'Probability']; // Suggested default focus areas if new

    const recommendations = weakTopics.map(topic => ({
      topic,
      reason: 'Low accuracy in recent practice sessions or high campus placement frequency',
      action: 'Start 10-Minute Focus Drill',
      category: topic.includes('Operating') || topic.includes('DBMS') ? 'core_cs' : 'aptitude'
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalTestsTaken: testAttempts.length,
        averageScore: avgScore,
        interviewsCompleted: interviews.length,
        gdParticipated: gdSessions.length,
        streakDays: user.stats?.streakDays || 1,
        targetCompanies: user.targetCompanies || ['Google', 'Microsoft', 'Amazon'],
        scoreTrend,
        categoryPerformance,
        weakTopics,
        recommendations,
        recentAttempts
      }
    });
  } catch (error) {
    next(error);
  }
};
