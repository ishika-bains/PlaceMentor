import { QuestionRepository, TestAttemptRepository, UserRepository } from '../models/index.js';

export const getCategories = async (req, res, next) => {
  try {
    const categoriesMeta = [
      {
        id: 'aptitude',
        title: 'Quantitative Aptitude',
        description: 'Arithmetic, Algebra, Percentages, Time & Work, Speed Distance & Time, Probability and Permutations.',
        icon: 'Calculator',
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'High Frequency in Campus Drives',
        subCategories: ['Time & Work', 'Speed, Distance & Time', 'Profit & Loss', 'Percentages', 'Probability', 'Permutations & Combinations']
      },
      {
        id: 'logical_reasoning',
        title: 'Logical Reasoning',
        description: 'Syllogisms, Blood Relations, Coding-Decoding, Seating Arrangements, Direction Sense and Analytical Puzzles.',
        icon: 'Brain',
        gradient: 'from-purple-500 to-pink-600',
        badge: 'Critical for Aptitude Clearence',
        subCategories: ['Syllogisms', 'Blood Relations', 'Coding-Decoding', 'Direction Sense', 'Seating Arrangement', 'Series & Sequences']
      },
      {
        id: 'verbal_ability',
        title: 'Verbal Ability',
        description: 'Grammar, Error Spotting, Sentence Improvement, Vocabulary, Synonyms/Antonyms and Reading Comprehension.',
        icon: 'BookOpen',
        gradient: 'from-amber-500 to-orange-600',
        badge: 'Key for MNC Written Rounds',
        subCategories: ['Spotting Errors', 'Vocabulary & Antonyms', 'Sentence Improvement', 'Reading Comprehension']
      },
      {
        id: 'core_cs',
        title: 'Core Computer Science',
        description: 'DBMS, SQL, Operating Systems, Computer Networks, OOP, DSA and Software Engineering fundamentals.',
        icon: 'Cpu',
        gradient: 'from-cyan-500 to-emerald-600',
        badge: 'Essential for Technical Interviews',
        subCategories: ['Operating Systems', 'DBMS & SQL', 'Computer Networks', 'Data Structures & Algorithms', 'Object Oriented Programming', 'Software Engineering']
      }
    ];

    // Compute live count for each
    const categories = await Promise.all(
      categoriesMeta.map(async (cat) => {
        const count = await QuestionRepository.count({ category: cat.id });
        return {
          ...cat,
          questionCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const { category, subCategory, difficulty, limit = 10 } = req.query;

    const filter = {
      limit: Number(limit)
    };
    if (category) filter.category = category;
    if (subCategory && subCategory !== 'All') filter.subCategory = subCategory;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;

    const allMatching = await QuestionRepository.find(filter);

    // Shuffle questions for fresh test attempts
    const shuffled = [...allMatching].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Number(limit));

    // Strip answers & explanations so client cannot view answers before submitting
    const clientSafeQuestions = selected.map(q => {
      const { correctOption, explanation, ...safeQ } = q;
      return safeQ;
    });

    res.status(200).json({
      success: true,
      count: clientSafeQuestions.length,
      questions: clientSafeQuestions
    });
  } catch (error) {
    next(error);
  }
};

export const submitTest = async (req, res, next) => {
  try {
    const { answers, timeTakenSeconds, category, subCategory } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers array provided.'
      });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const evaluatedAnswers = await Promise.all(
      answers.map(async (ans) => {
        const question = await QuestionRepository.findById(ans.questionId);
        if (!question) {
          return {
            questionId: ans.questionId,
            selectedOption: ans.selectedOption,
            isCorrect: false,
            timeSpent: ans.timeSpent || 0,
            questionText: 'Question not found',
            explanation: 'N/A'
          };
        }

        const isUnanswered = ans.selectedOption === -1 || ans.selectedOption === undefined || ans.selectedOption === null;
        const isCorrect = !isUnanswered && Number(ans.selectedOption) === Number(question.correctOption);

        if (isUnanswered) {
          unansweredCount++;
        } else if (isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }

        return {
          questionId: question.id,
          question: question.question,
          passage: question.passage,
          codeSnippet: question.codeSnippet,
          options: question.options,
          correctOption: question.correctOption,
          selectedOption: ans.selectedOption,
          isCorrect,
          explanation: question.explanation,
          subCategory: question.subCategory,
          timeSpent: ans.timeSpent || 0
        };
      })
    );

    const totalQuestions = answers.length;
    const score = correctCount; // 1 mark per correct answer
    const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Save test attempt
    const attempt = await TestAttemptRepository.create({
      userId,
      category,
      subCategory: subCategory || 'General Practice',
      totalQuestions,
      score,
      correctCount,
      incorrectCount,
      unansweredCount,
      timeTakenSeconds: timeTakenSeconds || 0,
      accuracyPercentage,
      answers: evaluatedAnswers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
        timeSpent: a.timeSpent
      }))
    });

    // Update user's aggregate stats
    const user = await UserRepository.findById(userId);
    if (user) {
      const pastAttempts = await TestAttemptRepository.findByUser(userId);
      const totalScoreSum = pastAttempts.reduce((acc, curr) => acc + curr.accuracyPercentage, 0);
      const avgScore = pastAttempts.length > 0 ? Math.round(totalScoreSum / pastAttempts.length) : accuracyPercentage;

      // Identify weak topics (subcategories where accuracy is low)
      const currentWeakTopics = new Set(user.weakTopics || []);
      if (accuracyPercentage < 60 && subCategory && subCategory !== 'All') {
        currentWeakTopics.add(subCategory);
      } else if (accuracyPercentage >= 75 && subCategory) {
        currentWeakTopics.delete(subCategory);
      }

      await UserRepository.update(userId, {
        'stats.testsTaken': pastAttempts.length,
        'stats.avgScore': avgScore,
        weakTopics: Array.from(currentWeakTopics)
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test submitted and evaluated successfully!',
      attemptId: attempt.id,
      result: {
        score,
        totalQuestions,
        correctCount,
        incorrectCount,
        unansweredCount,
        accuracyPercentage,
        timeTakenSeconds: timeTakenSeconds || 0,
        category,
        subCategory,
        evaluatedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTestAttemptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attempt = await TestAttemptRepository.findById(id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Hydrate answers with question texts and explanations
    const detailedAnswers = await Promise.all(
      attempt.answers.map(async (a) => {
        const q = await QuestionRepository.findById(a.questionId);
        return {
          ...a,
          question: q?.question || 'Archived Question',
          passage: q?.passage,
          codeSnippet: q?.codeSnippet,
          options: q?.options || [],
          correctOption: q?.correctOption,
          explanation: q?.explanation || 'Explanation unavailable.',
          subCategory: q?.subCategory
        };
      })
    );

    res.status(200).json({
      success: true,
      attempt: {
        ...attempt,
        answers: detailedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTestHistory = async (req, res, next) => {
  try {
    const attempts = await TestAttemptRepository.findByUser(req.user.id);
    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    next(error);
  }
};
