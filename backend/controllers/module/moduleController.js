const Module = require('../../models/Module');
const Progress = require('../../models/Progress');

// @desc    Get all modules
exports.getModules = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let filter = { isPublished: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const modules = await Module.find(filter)
      .populate('prerequisites', 'title slug')
      .sort({ order: 1 });

    res.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single module with progress
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findOne({ slug: req.params.slug, isPublished: true })
      .populate('prerequisites', 'title slug');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      module: module._id
    });

    if (!progress) {
      progress = new Progress({ user: req.user._id, module: module._id });
      await progress.save();
    }

    res.json({ module, progress });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update module progress
exports.updateProgress = async (req, res) => {
  try {
    const { section, timeSpent, completed, interactions } = req.body;

    let progress = await Progress.findOne({
      user: req.user._id,
      module: req.params.moduleId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: req.params.moduleId
      });
    }

    if (section === 'theory') {
      progress.sections.theory.completed = completed;
      progress.sections.theory.timeSpent += timeSpent || 0;
    } else if (section === 'simulator') {
      progress.sections.simulator.completed = completed;
      progress.sections.simulator.timeSpent += timeSpent || 0;
      progress.sections.simulator.interactions += interactions || 0;
    }

    progress.timeSpent += timeSpent || 0;
    progress.lastAccessed = new Date();

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

    req.user.stats.totalTimeSpent += timeSpent || 0;
    await req.user.save();

    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
