const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const {
  getDashboard,
  updateInsights,
  getModuleProgress,
} = require("../controllers/progress/progressController");

const router = express.Router();

// Validate ObjectId middleware
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.moduleId)) {
    return res.status(400).json({ message: "Invalid moduleId" });
  }
  next();
};

// Get User Dashboard Data
router.get("/dashboard", auth, getDashboard);

// Get Progress for a Specific Module
router.get("/module/:moduleId", auth, validateObjectId, getModuleProgress);

// Update User Insights for a Module
router.put("/insights/:moduleId", auth, validateObjectId, updateInsights);

module.exports = router;
