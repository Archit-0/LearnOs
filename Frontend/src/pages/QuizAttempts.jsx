import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  TrendingUp,
  RotateCcw,
  Play,
  AlertCircle,
} from "lucide-react";
import apiService from "../Api/api";
import { useParams } from "react-router-dom";

const QuizDashboard = () => {
  const { Id } = useParams();
  const moduleId = Id;

  const [currentView, setCurrentView] = useState("overview");
  const [quizData, setQuizData] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [hintsUsed, setHintsUsed] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track time spent per question
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // ----------------------------
  // LOAD QUIZ DATA
  // ----------------------------
  const loadQuizData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getModuleQuizzes(moduleId);
      setQuizData(data);
    } catch (err) {
      setError("Failed to load quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizData();
  }, [moduleId]);

  // ----------------------------
  // TIMER HANDLING
  // ----------------------------
  useEffect(() => {
    if (!timeRemaining || currentView !== "taking") return;

    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, currentView]);

  // ----------------------------
  // START QUIZ
  // ----------------------------
  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      const attempt = await apiService.startQuiz(quizData.quiz._id);

      setCurrentAttempt(attempt);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setHintsUsed({});
      setQuizResults(null);
      setQuestionStartTime(Date.now());

      setTimeRemaining(attempt.timeLimit * 60);
      setCurrentView("taking");
    } catch (err) {
      setError("Failed to start quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // ANSWER SELECT HANDLER
  // ----------------------------
  const handleAnswerSelect = async (questionId, selectedAnswer) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    setAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }));

    try {
      await apiService.submitQuizAnswer(currentAttempt.attemptId, {
        questionId,
        selectedAnswer,
        timeSpent,
        hintsUsed: hintsUsed[questionId] || 0,
      });
    } catch (err) {
      console.error("Error saving answer:", err.message);
    }
  };

  // ----------------------------
  // USE HINT
  // ----------------------------
  const handleUseHint = (questionId) => {
    setHintsUsed((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1,
    }));
  };

  // ----------------------------
  // SUBMIT QUIZ
  // ----------------------------
  const handleSubmitQuiz = useCallback(async () => {
    if (!currentAttempt) return;

    try {
      setIsSubmitting(true);

      const totalTimeSpent = currentAttempt.timeLimit * 60 - timeRemaining;

      const results = await apiService.submitQuizAttempt(
        currentAttempt.attemptId,
        { timeSpent: totalTimeSpent }
      );

      setQuizResults(results);
      setCurrentView("results");
      loadQuizData();
    } catch (err) {
      console.error("Error submitting quiz:", err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentAttempt, timeRemaining]);

  // ----------------------------
  // TIME FORMATTER
  // ----------------------------
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // ----------------------------
  // PROTECTION AGAINST NULL DATA
  // ----------------------------
  if (loading && !quizData) return <p>Loading...</p>;
  if (error && !quizData) return <p>{error}</p>;
  if (!quizData?.quiz) return <p>No quiz available.</p>;

  // ----------------------------
  // OVERVIEW SCREEN
  // ----------------------------
  if (currentView === "overview") {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">{quizData.quiz.title}</h1>
        <p className="text-gray-600">{quizData.quiz.description}</p>

        <button
          onClick={handleStartQuiz}
          disabled={
            loading || quizData.attempts.length >= quizData.quiz.attempts
          }
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Start Quiz
        </button>

        {quizData.attempts.length >= quizData.quiz.attempts && (
          <p className="text-red-600 mt-2">Maximum attempts reached</p>
        )}
      </div>
    );
  }

  // ----------------------------
  // TAKING QUIZ SCREEN
  // ----------------------------
  if (currentView === "taking") {
    if (!currentAttempt?.questions) return <p>Loading questions...</p>;

    const q = currentAttempt.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / currentAttempt.questions.length) * 100;

    return (
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Question {currentQuestionIndex + 1} /{" "}
            {currentAttempt.questions.length}
          </h2>

          <div
            className={`font-mono ${timeRemaining < 10 ? "text-red-600" : ""}`}
          >
            <Clock className="inline-block w-5 h-5 mr-1" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* PROGRESS */}
        <div className="w-full bg-gray-300 h-2 rounded-full mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* QUESTION */}
        <h3 className="text-lg font-semibold mb-4">{q.question}</h3>

        {/* HINT */}
        {q.hints?.length > 0 && (
          <div className="mb-4">
            <button
              className="text-blue-600 underline"
              onClick={() => handleUseHint(q._id)}
            >
              Use Hint ({hintsUsed[q._id] || 0})
            </button>

            {hintsUsed[q._id] > 0 && (
              <div className="mt-2 p-3 bg-blue-100 border-l-4 border-blue-500">
                {q.hints[Math.min(hintsUsed[q._id] - 1, q.hints.length - 1)]}
              </div>
            )}
          </div>
        )}

        {/* OPTIONS */}
        <div className="space-y-3">
          {q.options.map((opt) => (
            <label
              key={opt._id}
              className={`block p-4 border rounded-lg cursor-pointer ${
                answers[q._id] === opt.text
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`q-${q._id}`}
                value={opt.text}
                checked={answers[q._id] === opt.text}
                onChange={() => handleAnswerSelect(q._id, opt.text)}
              />
              <span className="ml-3">{opt.text}</span>
            </label>
          ))}
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-between mt-6">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => {
              setCurrentQuestionIndex((i) => i - 1);
              setQuestionStartTime(Date.now());
            }}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Previous
          </button>

          {currentQuestionIndex === currentAttempt.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentQuestionIndex((i) => i + 1);
                setQuestionStartTime(Date.now());
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------
  // RESULT SCREEN
  // ----------------------------
  if (currentView === "results") {
    const a = quizResults.attempt;

    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold">
          {a.passed ? "Congratulations 🎉" : "Try Again!"}
        </h1>

        <p className="text-xl mt-4 font-semibold">{a.percentage}% Score</p>

        <p className="mt-2 text-gray-600">
          Time Spent: {formatTime(a.timeSpent)}
        </p>

        <button
          onClick={() => setCurrentView("overview")}
          className="mt-6 bg-gray-700 text-white px-6 py-3 rounded-lg"
        >
          Back to Overview
        </button>

        {!a.passed && quizData.attempts.length < quizData.quiz.attempts && (
          <button
            onClick={handleStartQuiz}
            className="mt-4 ml-3 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Retry Quiz
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default QuizDashboard;
