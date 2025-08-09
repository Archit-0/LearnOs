import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Award, BookOpen, TrendingUp, RotateCcw, Play, AlertCircle } from 'lucide-react';
import apiService from '../Api/api';
import { useParams } from 'react-router-dom';

/*
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. Install axios: npm install axios
 * 
 * 2. Import your API service:
 *    import apiService from './path/to/your/api';
 * 
 * 3. Replace the mock apiService below with your actual import
 * 
 * 4. Your API endpoints should match:
 *    - GET /quiz/module/:moduleId (getModuleQuizzes)
 *    - POST /quiz/:quizId/start (startQuiz) 
 *    - PUT /quiz/attempt/:attemptId/answer (submitQuizAnswer)
 *    - PUT /quiz/attempt/:attemptId/submit (submitQuizAttempt)
 * 
 * 5. Make sure authentication tokens are handled by your API service interceptors
 * 
 * 6. Optional: Add toast notifications for better error/success feedback
 */

// Import your API service
// import apiService from './path/to/your/api'; // Uncomment and update path

// For demo purposes, using mock API that matches your actual API structure
// const apiService = {
//   // This should be replaced with your actual apiService import
//   getModuleQuizzes: async (moduleId) => {
//     // This matches your API endpoint: GET /quiz/module/:moduleId
//     return {
//       quiz: {
//         _id: 'quiz123',
//         title: 'JavaScript Fundamentals Quiz',
//         description: 'Test your knowledge of JavaScript basics',
//         module: { _id: moduleId, title: 'JavaScript Basics', slug: 'js-basics' },
//         timeLimit: 30,
//         passingScore: 70,
//         attempts: 3,
//         totalQuestions: 10,
//         isActive: true
//       },
//       attempts: [
//         { _id: 'att1', score: 8, percentage: 80, passed: true, completedAt: '2025-08-08T10:00:00Z' },
//         { _id: 'att2', score: 6, percentage: 60, passed: false, completedAt: '2025-08-07T15:30:00Z' }
//       ]
//     };
//   },

//   startQuiz: async (quizId) => {
//     // This matches your API endpoint: POST /quiz/:quizId/start
//     return {
//       attemptId: 'attempt456',
//       questions: [
//         {
//           _id: 'q1',
//           question: 'What does "const" keyword do in JavaScript?',
//           type: 'multiple-choice',
//           options: [
//             { text: 'Creates a variable that can be reassigned' },
//             { text: 'Creates a constant variable that cannot be reassigned' },
//             { text: 'Creates a function' },
//             { text: 'Creates an object' }
//           ],
//           points: 10,
//           hints: ['Think about immutability', 'Consider variable declaration']
//         },
//         {
//           _id: 'q2',
//           question: 'Which method is used to add an element to the end of an array?',
//           type: 'multiple-choice',
//           options: [
//             { text: 'push()' },
//             { text: 'pop()' },
//             { text: 'shift()' },
//             { text: 'unshift()' }
//           ],
//           points: 10,
//           hints: ['Think about array manipulation', 'Consider the end of the array']
//         }
//       ],
//       timeLimit: 30
//     };
//   },

//   submitQuizAnswer: async (attemptId, answerData) => {
//     // This matches your API endpoint: PUT /quiz/attempt/:attemptId/answer
//     return {
//       isCorrect: answerData.selectedAnswer === 'Creates a constant variable that cannot be reassigned',
//       explanation: 'The const keyword creates a variable that cannot be reassigned after initialization.',
//       correctAnswer: answerData.selectedAnswer !== 'Creates a constant variable that cannot be reassigned'
//         ? 'Creates a constant variable that cannot be reassigned' : null
//     };
//   },

//   submitQuizAttempt: async (attemptId, submissionData = {}) => {
//     // This matches your API endpoint: PUT /quiz/attempt/:attemptId/submit
//     return {
//       attempt: {
//         score: 15,
//         totalPoints: 20,
//         percentage: 75,
//         passed: true,
//         timeSpent: 25
//       },
//       results: [
//         {
//           questionId: 'q1',
//           question: 'What does "const" keyword do in JavaScript?',
//           selectedAnswer: 'Creates a constant variable that cannot be reassigned',
//           correctAnswer: 'Creates a constant variable that cannot be reassigned',
//           isCorrect: true,
//           explanation: 'The const keyword creates a variable that cannot be reassigned after initialization.',
//           points: 10
//         },
//         {
//           questionId: 'q2',
//           question: 'Which method is used to add an element to the end of an array?',
//           selectedAnswer: 'pop()',
//           correctAnswer: 'push()',
//           isCorrect: false,
//           explanation: 'The push() method adds elements to the end of an array and returns the new length.',
//           points: 10
//         }
//       ]
//     };
//   }
// };

const QuizDashboard = () => {
  const { Id } = useParams();
  const moduleId = Id;
  // console.log("moduleId: ", Id);
  const [currentView, setCurrentView] = useState('overview');
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
  const [answerFeedback, setAnswerFeedback] = useState({}); // Store individual answer feedback

  useEffect(() => {
    loadQuizData();
  }, [moduleId]);

  useEffect(() => {
    let timer;
    if (timeRemaining > 0 && currentView === 'taking') {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, currentView]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getModuleQuizzes(moduleId);
      console.log("modukeData:", data);
      setQuizData(data);
    } catch (error) {
      console.error('Error loading quiz:', error.message);
      setError(`Failed to load quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const attempt = await apiService.startQuiz(quizData.quiz._id);
      setCurrentAttempt(attempt);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setHintsUsed({});
      setAnswerFeedback({});
      setTimeRemaining(attempt.timeLimit * 60);
      setCurrentView('taking');
    } catch (error) {
      console.error('Error starting quiz:', error.message);
      setError(`Failed to start quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionId, selectedAnswer) => {
    const newAnswers = { ...answers, [questionId]: selectedAnswer };
    setAnswers(newAnswers);

    try {
      const result = await apiService.submitQuizAnswer(currentAttempt.attemptId, {
        questionId,
        selectedAnswer,
        timeSpent: Math.floor((currentAttempt.timeLimit * 60 - timeRemaining) / currentAttempt.questions.length),
        hintsUsed: hintsUsed[questionId] || 0
      });

      // Store the result for immediate feedback if needed
      console.log('Answer submitted:', result);
    } catch (error) {
      console.error('Error submitting answer:', error.message);
      // You might want to show a warning to the user that the answer wasn't saved
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const results = await apiService.submitQuizAttempt(currentAttempt.attemptId, {
        timeSpent: Math.floor((currentAttempt.timeLimit * 60 - timeRemaining) / 60) // Convert to minutes
      });
      setQuizResults(results);
      setCurrentView('results');
      await loadQuizData(); // Refresh quiz data to update attempts
    } catch (error) {
      console.error('Error submitting quiz:', error.message);
      // Handle error state - you might want to show an error message and allow retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseHint = (questionId) => {
    setHintsUsed(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttemptStatusColor = (attempt) => {
    if (attempt.passed) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading && !quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadQuizData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quizData?.quiz.title}</h1>
                <p className="text-gray-600 mb-4">{quizData?.quiz.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {quizData?.quiz.totalQuestions} Questions
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {quizData?.quiz.timeLimit} minutes
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {quizData?.quiz.passingScore}% to pass
                  </span>
                  <span className="flex items-center">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {quizData?.quiz.attempts} attempts allowed
                  </span>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={handleStartQuiz}
                  disabled={loading || (quizData?.attempts?.length >= quizData?.quiz.attempts)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Quiz</span>
                </button>
                {quizData?.attempts?.length >= quizData?.quiz.attempts && (
                  <p className="text-red-600 text-sm mt-2">Maximum attempts reached</p>
                )}
              </div>
            </div>
          </div>

          {/* Previous Attempts */}
          {quizData?.attempts?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Previous Attempts</h2>
              <div className="space-y-3">
                {quizData.attempts.map((attempt, index) => (
                  <div key={attempt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {attempt.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">Attempt {quizData.attempts.length - index}</span>
                      </div>
                      <div className={`text-lg font-bold ${getAttemptStatusColor(attempt)}`}>
                        {attempt.percentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Score: {attempt.score} points
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'taking') {
    const currentQuestion = currentAttempt.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentAttempt.questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / currentAttempt.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Quiz Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Taking Quiz</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {currentAttempt.questions.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${timeRemaining < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                </div>
                {timeRemaining < 300 && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex-1">
                  {currentQuestion.question}
                </h2>
                <div className="ml-4 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {currentQuestion.points} points
                </div>
              </div>

              {/* Hints */}
              {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => handleUseHint(currentQuestion._id)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                  >
                    <span>💡 Use Hint ({(hintsUsed[currentQuestion._id] || 0)} used)</span>
                  </button>
                  {hintsUsed[currentQuestion._id] > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm">
                      {currentQuestion.hints[Math.min(hintsUsed[currentQuestion._id] - 1, currentQuestion.hints.length - 1)]}
                    </div>
                  )}
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${answers[currentQuestion._id] === option.text
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option.text}
                        checked={answers[currentQuestion._id] === option.text}
                        onChange={(e) => handleAnswerSelect(currentQuestion._id, e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">{option.text}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {currentAttempt.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[currentAttempt.questions[index]._id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(currentAttempt.questions.length - 1, prev + 1))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Quiz Summary Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(answers).length}
                </div>
                <div className="text-sm text-gray-500">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {currentAttempt.questions.length - Object.keys(answers).length}
                </div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(hintsUsed).reduce((sum, hints) => sum + hints, 0)}
                </div>
                <div className="text-sm text-gray-500">Hints Used</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${quizResults.attempt.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {quizResults.attempt.passed ? (
                <Award className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {quizResults.attempt.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className={`text-3xl font-bold ${quizResults.attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {quizResults.attempt.percentage}%
                </div>
                <div className="text-sm text-gray-500">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {quizResults.attempt.score}
                </div>
                <div className="text-sm text-gray-500">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {quizResults.attempt.totalPoints}
                </div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {formatTime(quizResults.attempt.timeSpent * 60)}
                </div>
                <div className="text-sm text-gray-500">Time Spent</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h2>
            <div className="space-y-6">
              {quizResults.results.map((result, index) => (
                <div key={result.questionId} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex-1">
                      {index + 1}. {result.question}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-gray-600">
                        {result.points} pts
                      </span>
                    </div>
                  </div>

                  <div className="ml-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Your answer:</span>
                      <span className={`font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {result.selectedAnswer}
                      </span>
                    </div>

                    {!result.isCorrect && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Correct answer:</span>
                        <span className="font-medium text-green-600">{result.correctAnswer}</span>
                      </div>
                    )}

                    {result.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm">
                        <strong>Explanation:</strong> {result.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentView('overview');
                setCurrentAttempt(null);
                setQuizResults(null);
                setAnswers({});
                setHintsUsed({});
                setTimeRemaining(null);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Overview
            </button>

            {!quizResults.attempt.passed && quizData?.attempts?.length < quizData?.quiz.attempts && (
              <button
                onClick={handleStartQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizDashboard;