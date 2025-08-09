const Quiz = require('../../models/Quiz');
const QuizAttempt = require('../../models/QuizAttempt');
const Progress = require('../../models/Progress');

// Get quiz by module
exports.getQuizByModule = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      module: req.params.moduleId,
      isActive: true
    }).populate('module', 'title slug');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: quiz._id
    }).sort({ createdAt: -1 }).limit(5);

    const secureQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options.map(opt => ({ text: opt.text })),
        difficulty: q.difficulty,
        points: q.points,
        hints: q.hints
      }))
    };

    res.json({ quiz: secureQuiz, attempts });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start quiz attempt
exports.startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const attemptCount = await QuizAttempt.countDocuments({
      user: req.user._id,
      quiz: quiz._id
    });

    if (attemptCount >= quiz.attempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    let selectedQuestions = quiz.questions;
    if (quiz.isAdaptive && attemptCount > 0) {
      const lastAttempt = await QuizAttempt.findOne({
        user: req.user._id,
        quiz: quiz._id
      }).sort({ createdAt: -1 });

      if (lastAttempt && lastAttempt.percentage < 70) {
        selectedQuestions = quiz.questions.filter(q => q.difficulty !== 'hard');
      } else if (lastAttempt && lastAttempt.percentage > 90) {
        selectedQuestions = quiz.questions.filter(q => q.difficulty !== 'easy');
      }
    }

    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    const attempt = new QuizAttempt({
      user: req.user._id,
      quiz: quiz._id,
      answers: selectedQuestions.map(q => ({
        questionId: q._id,
        selectedAnswer: null,
        isCorrect: false,
        timeSpent: 0,
        hintsUsed: 0
      })),
      score: 0,
      totalPoints: selectedQuestions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      timeSpent: 0
    });

    await attempt.save();

    res.json({
      attemptId: attempt._id,
      questions: selectedQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options.map(opt => ({ text: opt.text })),
        points: q.points,
        hints: q.hints
      })),
      timeLimit: quiz.timeLimit
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit single answer
exports.submitQuizAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeSpent, hintsUsed } = req.body;

    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
      completed: false
    });
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });

    const quiz = await Quiz.findById(attempt.quiz);
    const question = quiz.questions.id(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const answerIndex = attempt.answers.findIndex(a => a.questionId.toString() === questionId);
    if (answerIndex !== -1) {
      let isCorrect = false;
      if (question.type === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.text === selectedAnswer;
      } else {
        isCorrect = question.correctAnswer === selectedAnswer;
      }

      attempt.answers[answerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
        hintsUsed: hintsUsed || 0
      };

      await attempt.save();

      res.json({
        isCorrect,
        explanation: question.explanation,
        correctAnswer: isCorrect ? null :
          (question.type === 'multiple-choice'
            ? question.options.find(opt => opt.isCorrect)?.text
            : question.correctAnswer)
      });
    }
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit entire quiz
exports.submitQuiz = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
      completed: false
    });
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });

    const quiz = await Quiz.findById(attempt.quiz);

    let score = 0;
    attempt.answers.forEach(answer => {
      if (answer.isCorrect) {
        const question = quiz.questions.id(answer.questionId);
        score += question ? question.points : 1;
      }
    });

    attempt.score = score;
    attempt.percentage = Math.round((score / attempt.totalPoints) * 100);
    attempt.passed = attempt.percentage >= quiz.passingScore;
    attempt.completed = true;
    attempt.completedAt = new Date();
    await attempt.save();

    // Update user stats
    req.user.stats.totalQuizzesTaken += 1;
    const totalScore = (
      req.user.stats.averageScore * (req.user.stats.totalQuizzesTaken - 1) +
      attempt.percentage
    );
    req.user.stats.averageScore = Math.round(totalScore / req.user.stats.totalQuizzesTaken);
    await req.user.save();

    // Update module progress
    let progress = await Progress.findOne({
      user: req.user._id,
      module: quiz.module
    });

    if (progress) {
      progress.sections.quiz.completed = attempt.passed;
      progress.sections.quiz.bestScore = Math.max(progress.sections.quiz.bestScore, attempt.percentage);
      progress.sections.quiz.attempts += 1;

      const sections = progress.sections;
      const completedSections = [
        sections.theory.completed,
        sections.simulator.completed,
        sections.quiz.completed
      ].filter(Boolean).length;

      progress.completionPercentage = Math.round((completedSections / 3) * 100);
      if (progress.completionPercentage === 100 && !progress.completedAt) {
        progress.status = 'completed';
        progress.completedAt = new Date();
      } else if (progress.completionPercentage > 0) {
        progress.status = 'in-progress';
      }
      await progress.save();
    }

    res.json({
      attempt: {
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent
      },
      results: attempt.answers.map(answer => {
        const question = quiz.questions.id(answer.questionId);
        return {
          questionId: answer.questionId,
          question: question?.question,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question?.type === 'multiple-choice'
            ? question.options.find(opt => opt.isCorrect)?.text
            : question?.correctAnswer,
          isCorrect: answer.isCorrect,
          explanation: question?.explanation,
          points: question?.points || 1
        };
      })
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
