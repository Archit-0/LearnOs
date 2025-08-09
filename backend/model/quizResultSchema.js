// models/QuizResult.js
import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  module: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  incorrectQuestions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    selectedOption: String
  }],
  timeTaken: { type: Number }, // in seconds
  date: { type: Date, default: Date.now }
});

export default mongoose.model("QuizResult", quizResultSchema);
