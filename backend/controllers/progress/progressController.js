// controllers/progressController.js
const mongoose = require("mongoose");
const Progress = require("../../models/Progress");
const Module = require("../../models/Module");
const QuizAttempt = require("../../models/QuizAttempt");

// helper
const countOccurrences = (arr = []) =>
  arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

// GET Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const modules = await Module.find({ isPublished: true })
      .select("title slug category difficulty estimatedTime order")
      .sort({ order: 1 });

    const progressData = await Progress.find({ user: userId }).populate(
      "module",
      "title slug category"
    );

    // map moduleId -> progress
    const progressMap = {};
    progressData.forEach((p) => {
      if (p.module) {
        progressMap[p.module._id.toString()] = p;
      }
    });

    const modulesWithProgress = modules.map((module) => {
      const progress = progressMap[module._id.toString()];

      if (progress) {
        return {
          ...module.toObject(),
          progress: {
            status: progress.status,
            completionPercentage: progress.completionPercentage,
            timeSpent: progress.timeSpent,
            sections: progress.sections,
            lastAccessed: progress.lastAccessed,
          },
        };
      }

      // default progress for not-started modules
      return {
        ...module.toObject(),
        progress: {
          status: "not-started",
          completionPercentage: 0,
          timeSpent: 0,
          sections: {
            theory: { completed: false, timeSpent: 0 },
            simulator: { completed: false, timeSpent: 0, interactions: 0 },
            quiz: { completed: false, bestScore: 0, attempts: 0 },
          },
          lastAccessed: null,
        },
      };
    });

    const totalModules = modules.length;
    const completedModules = progressData.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgressModules = progressData.filter(
      (p) => p.status === "in-progress"
    ).length;
    const totalTimeSpent = progressData.reduce(
      (sum, p) => sum + (p.timeSpent || 0),
      0
    );

    const averageCompletion =
      modulesWithProgress.length > 0
        ? Math.round(
            modulesWithProgress.reduce(
              (sum, m) => sum + (m.progress.completionPercentage || 0),
              0
            ) / modulesWithProgress.length
          )
        : 0;

    const recentQuizzes = await QuizAttempt.find({ user: userId })
      .populate({
        path: "quiz",
        select: "title module",
        populate: { path: "module", select: "title slug" },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const allWeakAreas = progressData.reduce(
      (areas, p) => [...areas, ...(p.weakAreas || [])],
      []
    );
    const allStrengths = progressData.reduce(
      (areas, p) => [...areas, ...(p.strengths || [])],
      []
    );

    const topWeakAreas = Object.entries(countOccurrences(allWeakAreas))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    const topStrengths = Object.entries(countOccurrences(allStrengths))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    res.json({
      modules: modulesWithProgress,
      statistics: {
        totalModules,
        completedModules,
        inProgressModules,
        notStartedModules: totalModules - completedModules - inProgressModules,
        totalTimeSpent,
        averageCompletion,
        completionRate:
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0,
      },
      recentActivity: {
        recentQuizzes: recentQuizzes.map((quiz) => ({
          id: quiz._id,
          title: quiz.quiz?.title || "Unknown Quiz",
          module: quiz.quiz?.module?.title || "Unknown Module",
          moduleSlug: quiz.quiz?.module?.slug,
          score: quiz.percentage,
          passed: quiz.passed,
          completedAt: quiz.completedAt,
          timeSpent: quiz.timeSpent,
        })),
      },
      insights: {
        weakAreas: topWeakAreas,
        strengths: topStrengths,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET Detailed Module Progress
exports.getModuleProgress = async (req, res) => {
  try {
    const { moduleId } = req.params;

    if (!mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId" });
    }

    const progress = await Progress.findOne({
      user: req.user._id,
      module: moduleId,
    }).populate("module", "title slug category difficulty estimatedTime");

    if (!progress) {
      const module = await Module.findById(moduleId).select(
        "title slug category difficulty estimatedTime"
      );

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      return res.json({
        module,
        progress: {
          status: "not-started",
          completionPercentage: 0,
          timeSpent: 0,
          sections: {
            theory: { completed: false, timeSpent: 0 },
            simulator: { completed: false, timeSpent: 0, interactions: 0 },
            quiz: { completed: false, bestScore: 0, attempts: 0 },
          },
          weakAreas: [],
          strengths: [],
          lastAccessed: null,
        },
      });
    }

    const quizAttempts = await QuizAttempt.find({
      user: req.user._id,
    })
      .populate({
        path: "quiz",
        match: { module: moduleId },
        select: "title module",
      })
      .sort({ createdAt: -1 });

    const validAttempts = quizAttempts.filter(
      (attempt) => attempt.quiz !== null
    );

    res.json({
      module: progress.module,
      progress: {
        status: progress.status,
        completionPercentage: progress.completionPercentage,
        timeSpent: progress.timeSpent,
        sections: progress.sections,
        weakAreas: progress.weakAreas || [],
        strengths: progress.strengths || [],
        lastAccessed: progress.lastAccessed,
        completedAt: progress.completedAt,
      },
      quizHistory: validAttempts.map((attempt) => ({
        id: attempt._id,
        score: attempt.percentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt,
      })),
    });
  } catch (error) {
    console.error("Get module progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT Update Insights
exports.updateInsights = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { weakAreas, strengths } = req.body;

    if (!mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId" });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      module: moduleId,
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: moduleId,
        weakAreas: [],
        strengths: [],
      });
    }

    const currentWeak = progress.weakAreas || [];
    const currentStrengths = progress.strengths || [];

    if (Array.isArray(weakAreas)) {
      progress.weakAreas = [...new Set([...currentWeak, ...weakAreas])];
    }

    if (Array.isArray(strengths)) {
      progress.strengths = [...new Set([...currentStrengths, ...strengths])];
    }

    await progress.save();
    res.json({ message: "Insights updated successfully" });
  } catch (error) {
    console.error("Update insights error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
