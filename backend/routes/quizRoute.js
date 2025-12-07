import express from "express";
import {
  getQuizByModule,
  addQuizQuestion,
  submitQuiz,
  getUserQuizResults,
} from "../controllers/quizControllers.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// Add quiz question (Admin only)
router.post("/add", auth, adminOnly, addQuizQuestion);

// Submit quiz answers (User must be logged in)
router.post("/submit", auth, submitQuiz);

// Get quiz results for a specific user (User OR admin)
router.get("/results/:userId", auth, getUserQuizResults);

// Get quiz by module/topic
router.get("/module/:moduleName", auth, getQuizByModule);

export default router;
