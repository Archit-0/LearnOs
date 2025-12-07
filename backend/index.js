// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import {connectDB} from "./Db/db.js";

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// // Routes
// import aiRoutes from "./routes/AIRoutes.js"
// import quizRoutes from "./routes/QuizRoutes.js"
// app.use("/api/ai", aiRoutes);
// app.use("/api/quiz", quizRoutes);

// connectDB();

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./Db/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const quizRoutes = require("./routes/quizRoutes");
const chatbotRoutes = require("./routes/chatbot");
const progressRoutes = require("./routes/progressRoutes");
const simulatorRoutes = require("./routes/simulators");
const learningPathRoutes = require("./routes/learningPath");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Logging
app.use(morgan("combined"));

// // Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use("/api/auth", authRoutes); // working  route
app.use("/api/users", userRoutes); // working route
app.use("/api/modules", moduleRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/simulators", simulatorRoutes);
app.use("/api/learning-path", learningPathRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
