const mongoose = require("mongoose");
const Module = require("../../models/Module");
const Progress = require("../../models/Progress");
const User = require("../../models/User");

// -----------------------------
// GET ALL MODULES
// -----------------------------
exports.getModules = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    let filter = { isPublished: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const modules = await Module.find(filter)
      .populate("prerequisites", "title slug")
      .sort({ order: 1 });

    res.json({ modules });
  } catch (error) {
    console.error("Get modules error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// GET MODULE + CREATE PROGRESS
// -----------------------------
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate("prerequisites", "title slug");

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      module: module._id,
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: module._id,

        // initialize sections safely
        sections: {
          theory: { completed: false, timeSpent: 0 },
          simulator: { completed: false, timeSpent: 0, interactions: 0 },
          quiz: { completed: false },
        },
      });

      await progress.save();
    }

    res.json({ module, progress });
  } catch (error) {
    console.error("Get module error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// UPDATE PROGRESS
// -----------------------------
exports.updateProgress = async (req, res) => {
  try {
    const { section, timeSpent, completed, interactions } = req.body;
    const moduleId = req.params.moduleId;

    // Validate ObjectId
    if (!mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId" });
    }

    // Check module exists
    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Validate section
    const validSections = ["theory", "simulator", "quiz"];
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    // Get or create progress
    let progress = await Progress.findOne({
      user: req.user._id,
      module: moduleId,
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: moduleId,
        sections: {
          theory: { completed: false, timeSpent: 0 },
          simulator: { completed: false, timeSpent: 0, interactions: 0 },
          quiz: { completed: false },
        },
      });
    }

    // Apply updates
    if (section === "theory") {
      progress.sections.theory.completed = completed;
      progress.sections.theory.timeSpent += timeSpent || 0;
    }

    if (section === "simulator") {
      progress.sections.simulator.completed = completed;
      progress.sections.simulator.timeSpent += timeSpent || 0;
      progress.sections.simulator.interactions += interactions || 0;
    }

    if (section === "quiz") {
      progress.sections.quiz.completed = completed;
    }

    // Total time
    progress.timeSpent += timeSpent || 0;
    progress.lastAccessed = new Date();

    // Calculate percentage dynamically
    const sectionValues = Object.values(progress.sections);
    const totalSections = sectionValues.length;
    const completedSections = sectionValues.filter((s) => s.completed).length;

    progress.completionPercentage = Math.round(
      (completedSections / totalSections) * 100
    );

    // Update status
    if (progress.completionPercentage === 100) {
      progress.status = "completed";
      if (!progress.completedAt) progress.completedAt = new Date();
    } else if (completedSections > 0) {
      progress.status = "in-progress";
    }

    await progress.save();

    // Update user stats safely
    await User.updateOne(
      { _id: req.user._id },
      { $inc: { "stats.totalTimeSpent": timeSpent || 0 } }
    );

    res.json({ progress });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
