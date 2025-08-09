const express = require('express');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized learning path
router.get('/recommend', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userLevel = req.user.preferences.difficulty;

    // Get user's progress
    const userProgress = await Progress.find({ user: userId })
      .populate('module', 'title slug category difficulty prerequisites');

    // Get all modules
    const allModules = await Module.find({ isPublished: true })
      .populate('prerequisites', 'title slug')
      .sort({ order: 1 });

    // Create progress map
    const progressMap = {};
    userProgress.forEach(p => {
      if (p.module) {
        progressMap[p.module._id.toString()] = p;
      }
    });

    // Analyze user performance
    const recentQuizzes = await QuizAttempt.find({ user: userId })
      .populate({
        path: 'quiz',
        populate: { path: 'module', select: 'category' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate performance by category
    const categoryPerformance = {};
    recentQuizzes.forEach(attempt => {
      if (attempt.quiz && attempt.quiz.module) {
        const category = attempt.quiz.module.category;
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = { total: 0, scores: [] };
        }
        categoryPerformance[category].scores.push(attempt.percentage);
        categoryPerformance[category].total++;
      }
    });

    // Calculate average scores per category
    Object.keys(categoryPerformance).forEach(category => {
      const scores = categoryPerformance[category].scores;
      categoryPerformance[category].average = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Generate recommendations
    const recommendations = [];

    // 1. Next logical modules (based on prerequisites and completion)
    const completedModules = userProgress
      .filter(p => p.status === 'completed')
      .map(p => p.module._id.toString());

    const inProgressModules = userProgress
      .filter(p => p.status === 'in-progress')
      .map(p => p.module._id.toString());

    allModules.forEach(module => {
      const moduleId = module._id.toString();
      const progress = progressMap[moduleId];
      
      // Skip if already completed
      if (completedModules.includes(moduleId)) return;

      let score = 0;
      let reason = [];

      // Check prerequisites
      const prerequisitesMet = module.prerequisites.every(prereq => 
        completedModules.includes(prereq._id.toString())
      );

      if (!prerequisitesMet) return; // Skip if prerequisites not met

      // Scoring logic
      
      // 1. Continue in-progress modules (high priority)
      if (inProgressModules.includes(moduleId)) {
        score += 50;
        reason.push('Continue your current progress');
      }

      // 2. Match user's difficulty preference
      if (module.difficulty === userLevel) {
        score += 20;
        reason.push(`Matches your ${userLevel} level`);
      } else if (userLevel === 'beginner' && module.difficulty === 'intermediate') {
        score += 10;
        reason.push('Next step in difficulty');
      } else if (userLevel === 'intermediate' && module.difficulty === 'advanced') {
        score += 10;
        reason.push('Next step in difficulty');
      }

      // 3. Weak areas (high priority)
      const allWeakAreas = userProgress.reduce((areas, p) => [...areas, ...p.weakAreas], []);
      const moduleCategory = module.category;
      
      if (allWeakAreas.some(area => area.toLowerCase().includes(moduleCategory.toLowerCase()))) {
        score += 30;
        reason.push('Addresses your weak areas');
      }

      // 4. Low performance in category
      if (categoryPerformance[moduleCategory] && categoryPerformance[moduleCategory].average < 70) {
        score += 25;
        reason.push('Improve performance in this area');
      }

      // 5. Sequential order preference
      const moduleOrder = module.order;
      const completedOrders = userProgress
        .filter(p => p.status === 'completed' && p.module)
        .map(p => p.module.order);
      
      if (completedOrders.length > 0) {
        const maxCompletedOrder = Math.max(...completedOrders);
        if (moduleOrder === maxCompletedOrder + 1) {
          score += 15;
          reason.push('Next in sequence');
        }
      }

      // 6. Time since last activity in category
      const categoryProgress = userProgress.filter(p => 
        p.module && p.module.category === moduleCategory
      );
      
      if (categoryProgress.length > 0) {
        const lastAccessed = Math.max(...categoryProgress.map(p => 
          new Date(p.lastAccessed || 0).getTime()
        ));
        const daysSinceAccess = (Date.now() - lastAccessed) / (1000 * 60 * 60 * 24);
        
        if (daysSinceAccess > 7) {
          score += 10;
          reason.push('Review recommended');
        }
      }

      if (score > 0) {
        recommendations.push({
          module: {
            id: module._id,
            title: module.title,
            slug: module.slug,
            category: module.category,
            difficulty: module.difficulty,
            estimatedTime: module.estimatedTime,
            description: module.description
          },
          score,
          priority: score > 40 ? 'high' : score > 20 ? 'medium' : 'low',
          reasons: reason,
          currentProgress: progress ? {
            status: progress.status,
            completionPercentage: progress.completionPercentage,
            timeSpent: progress.timeSpent
          } : null
        });
      }
    });

    // Sort by score and limit
    recommendations.sort((a, b) => b.score - a.score);

    // Group recommendations
    const highPriority = recommendations.filter(r => r.priority === 'high').slice(0, 3);
    const mediumPriority = recommendations.filter(r => r.priority === 'medium').slice(0, 5);
    const lowPriority = recommendations.filter(r => r.priority === 'low').slice(0, 3);

    // Generate study plan
    const studyPlan = generateStudyPlan(highPriority, mediumPriority, userLevel);

    res.json({
      recommendations: {
        highPriority,
        mediumPriority,
        lowPriority
      },
      studyPlan,
      insights: {
        categoryPerformance,
        weakAreas: userProgress.reduce((areas, p) => [...areas, ...p.weakAreas], []),
        completionRate: allModules.length > 0 ? 
          Math.round((completedModules.length / allModules.length) * 100) : 0,
        averageScore: req.user.stats.averageScore
      }
    });

  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate study plan helper function
function generateStudyPlan(highPriority, mediumPriority, userLevel) {
  const plan = {
    thisWeek: [],
    nextWeek: [],
    thisMonth: []
  };

  let totalTime = 0;
  const maxWeeklyTime = userLevel === 'beginner' ? 180 : userLevel === 'intermediate' ? 240 : 300; // minutes

  // This week - focus on high priority
  highPriority.forEach((rec, index) => {
    if (totalTime + rec.module.estimatedTime <= maxWeeklyTime && index < 2) {
      plan.thisWeek.push({
        ...rec,
        suggestedTime: rec.module.estimatedTime,
        day: index === 0 ? 'Monday-Tuesday' : 'Wednesday-Thursday'
      });
      totalTime += rec.module.estimatedTime;
    }
  });

  // Next week - remaining high priority + medium priority
  totalTime = 0;
  const remainingHigh = highPriority.slice(plan.thisWeek.length);
  const nextWeekCandidates = [...remainingHigh, ...mediumPriority.slice(0, 3)];

  nextWeekCandidates.forEach((rec, index) => {
    if (totalTime + rec.module.estimatedTime <= maxWeeklyTime && index < 3) {
      plan.nextWeek.push({
        ...rec,
        suggestedTime: rec.module.estimatedTime,
        day: ['Monday-Tuesday', 'Wednesday-Thursday', 'Friday-Weekend'][index]
      });
      totalTime += rec.module.estimatedTime;
    }
  });

  // This month - broader view
  const allRecommendations = [...highPriority, ...mediumPriority];
  const monthlyGoal = Math.min(allRecommendations.length, userLevel === 'beginner' ? 4 : 6);
  
  plan.thisMonth = allRecommendations.slice(0, monthlyGoal).map(rec => ({
    ...rec,
    suggestedWeek: Math.ceil((plan.thisMonth.length + 1) / 2)
  }));

  return plan;
}

// Update user learning preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { difficulty, learningStyle, voiceEnabled } = req.body;

    if (difficulty) {
      req.user.preferences.difficulty = difficulty;
    }
    if (learningStyle) {
      req.user.preferences.learningStyle = learningStyle;
    }
    if (typeof voiceEnabled === 'boolean') {
      req.user.preferences.voiceEnabled = voiceEnabled;
    }

    await req.user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: req.user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
