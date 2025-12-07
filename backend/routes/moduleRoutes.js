const express = require("express");
const mongoose = require("mongoose");
const {
  getModules,
  getModule,
  updateProgress,
} = require("../controllers/module/moduleController");
const auth = require("../middleware/auth");

const router = express.Router();

// Validate ObjectId middleware
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.moduleId)) {
    return res.status(400).json({ message: "Invalid moduleId" });
  }
  next();
};

// GET all modules (Protected or Public? Your choice)
router.get("/", auth, getModules);

// GET a module by slug
router.get("/module/:slug", auth, getModule);

// UPDATE module progress
router.put("/:moduleId/progress", auth, validateObjectId, updateProgress);

module.exports = router;
