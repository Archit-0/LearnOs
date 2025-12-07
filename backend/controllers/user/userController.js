const User = require("../../models/User");
const { validationResult } = require("express-validator");

/* -------------------------------------------------------
   GET USER PROFILE
-------------------------------------------------------- */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   UPDATE PROFILE
-------------------------------------------------------- */
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });

      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   UPDATE USER PREFERENCES
-------------------------------------------------------- */
exports.updatePreferences = async (req, res) => {
  try {
    const { difficulty, learningStyle, voiceEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.preferences = user.preferences || {};

    if (
      difficulty &&
      ["beginner", "intermediate", "advanced"].includes(difficulty)
    ) {
      user.preferences.difficulty = difficulty;
    }

    if (
      learningStyle &&
      ["visual", "auditory", "kinesthetic", "mixed"].includes(learningStyle)
    ) {
      user.preferences.learningStyle = learningStyle;
    }

    if (typeof voiceEnabled === "boolean") {
      user.preferences.voiceEnabled = voiceEnabled;
    }

    await user.save();

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   GET USER ACHIEVEMENTS
-------------------------------------------------------- */
exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("achievements");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ achievements: user.achievements || [] });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   ADD ACHIEVEMENT
-------------------------------------------------------- */
exports.addAchievement = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.achievements = user.achievements || [];

    const exists = user.achievements.find((a) => a.name === name);

    if (exists) {
      return res.status(400).json({ message: "Achievement already earned" });
    }

    const newAchievement = {
      name,
      description,
      icon,
      earnedAt: new Date(),
    };

    user.achievements.push(newAchievement);
    await user.save();

    res.json({
      message: "Achievement earned!",
      achievement: newAchievement,
    });
  } catch (error) {
    console.error("Add achievement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
