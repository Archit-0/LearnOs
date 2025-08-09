const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {getQuizByModule ,startQuizAttempt,submitQuizAnswer,submitQuiz } = require('../controllers/quiz/quizController');

// Routes
router.get('/module/:moduleId', auth, getQuizByModule);
router.post('/:quizId/start', auth, startQuizAttempt);
router.put('/attempt/:attemptId/answer', auth, submitQuizAnswer);
router.put('/attempt/:attemptId/submit', auth, submitQuiz);

module.exports = router;
