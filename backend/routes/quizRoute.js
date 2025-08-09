
import express from "express";
import {
  getQuizByModule,
  addQuizQuestion,
  submitQuiz,
} from "../controllers/quizControllers.js";

const router = express.Router();

router.get("/:module", getQuizByModule); // Get quiz by topic/module
router.post("/add", addQuizQuestion);    // Add a question (admin only)
router.post("/submit", submitQuiz);      // Submit quiz answers
router.get("/result/:userId", getUserQuizResults);

export default router;
