// package.json
//   const ans = () =>{"scripts": {
   
//     "seed": "node scripts/seedData.js"
//   }
// }

// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moduleRoutes = require('./routes/modules');
const quizRoutes = require('./routes/quizzes');
const chatbotRoutes = require('./routes/chatbot');
const progressRoutes = require('./routes/progress');
const simulatorRoutes = require('./routes/simulators');
const learningPathRoutes = require('./routes/learningPath');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/os-learning-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/simulators', simulatorRoutes);
app.use('/api/learning-path', learningPathRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  preferences: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
      default: 'mixed'
    },
    voiceEnabled: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalQuizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.stats.lastActiveDate);
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    this.stats.streakDays += 1;
  } else if (daysDiff > 1) {
    this.stats.streakDays = 1;
  }
  
  this.stats.lastActiveDate = today;
};

module.exports = mongoose.model('User', userSchema);

// models/Module.js
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['process-management', 'cpu-scheduling', 'deadlock-sync', 'memory-management', 'file-systems', 'io-management'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  content: {
    theory: {
      introduction: String,
      concepts: [{
        title: String,
        explanation: String,
        examples: [String],
        diagrams: [String] // URLs to diagram images
      }],
      summary: String
    },
    codeExamples: [{
      language: String,
      code: String,
      explanation: String
    }],
    resources: [{
      title: String,
      type: { type: String, enum: ['video', 'article', 'book', 'website'] },
      url: String,
      description: String
    }]
  },
  simulator: {
    type: {
      type: String,
      enum: ['cpu-scheduling', 'memory-allocation', 'page-replacement', 'deadlock-detection', 'file-allocation'],
    },
    config: mongoose.Schema.Types.Mixed // Store simulator-specific configuration
  },
  order: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Module', moduleSchema);

// models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'code-output'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String, // For non-MCQ types
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1
  },
  hints: [String],
  tags: [String]
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  attempts: {
    type: Number,
    default: 3
  },
  isAdaptive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);

// models/QuizAttempt.js
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    hintsUsed: Number
  }],
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  passed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

// models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  sections: {
    theory: {
      completed: { type: Boolean, default: false },
      timeSpent: { type: Number, default: 0 }
    },
    simulator: {
      completed: { type: Boolean, default: false },
      timeSpent: { type: Number, default: 0 },
      interactions: { type: Number, default: 0 }
    },
    quiz: {
      completed: { type: Boolean, default: false },
      bestScore: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 }
    }
  },
  weakAreas: [String], // Topics user struggled with
  strengths: [String], // Topics user excelled at
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

// models/ChatHistory.js
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    context: {
      module: String,
      topic: String,
      difficulty: String
    }
  }],
  context: {
    currentModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    userLevel: String,
    topics: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);

// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', [
  body('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update streak and last active
    user.updateStreak();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats,
        achievements: user.achievements
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;

// routes/modules.js
const express = require('express');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all modules
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let filter = { isPublished: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const modules = await Module.find(filter)
      .populate('prerequisites', 'title slug')
      .sort({ order: 1 });

    res.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single module with user progress
router.get('/:slug', auth, async (req, res) => {
  try {
    const module = await Module.findOne({ slug: req.params.slug, isPublished: true })
      .populate('prerequisites', 'title slug');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get user progress
    let progress = await Progress.findOne({
      user: req.user._id,
      module: module._id
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: module._id
      });
      await progress.save();
    }

    res.json({ module, progress });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update module progress
router.put('/:moduleId/progress', auth, async (req, res) => {
  try {
    const { section, timeSpent, completed, interactions } = req.body;

    let progress = await Progress.findOne({
      user: req.user._id,
      module: req.params.moduleId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: req.params.moduleId
      });
    }

    // Update section progress
    if (section === 'theory') {
      progress.sections.theory.completed = completed;
      progress.sections.theory.timeSpent += timeSpent || 0;
    } else if (section === 'simulator') {
      progress.sections.simulator.completed = completed;
      progress.sections.simulator.timeSpent += timeSpent || 0;
      progress.sections.simulator.interactions += interactions || 0;
    }

    progress.timeSpent += timeSpent || 0;
    progress.lastAccessed = new Date();

    // Calculate completion percentage
    const sections = progress.sections;
    const completedSections = [
      sections.theory.completed,
      sections.simulator.completed,
      sections.quiz.completed
    ].filter(Boolean).length;
    
    progress.completionPercentage = Math.round((completedSections / 3) * 100);
    
    if (progress.completionPercentage === 100 && !progress.completedAt) {
      progress.status = 'completed';
      progress.completedAt = new Date();
    } else if (progress.completionPercentage > 0) {
      progress.status = 'in-progress';
    }

    await progress.save();

    // Update user stats
    req.user.stats.totalTimeSpent += timeSpent || 0;
    await req.user.save();

    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// routes/quizzes.js
const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Get quiz by module
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      module: req.params.moduleId, 
      isActive: true 
    }).populate('module', 'title slug');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get user's previous attempts
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: quiz._id
    }).sort({ createdAt: -1 }).limit(5);

    // Remove correct answers from questions for security
    const secureQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options.map(opt => ({ text: opt.text })),
        difficulty: q.difficulty,
        points: q.points,
        hints: q.hints
      }))
    };

    res.json({ quiz: secureQuiz, attempts });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start quiz attempt
router.post('/:quizId/start', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check attempt limit
    const attemptCount = await QuizAttempt.countDocuments({
      user: req.user._id,
      quiz: quiz._id
    });

    if (attemptCount >= quiz.attempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Adaptive question selection based on user performance
    let selectedQuestions = quiz.questions;
    
    if (quiz.isAdaptive && attemptCount > 0) {
      const lastAttempt = await QuizAttempt.findOne({
        user: req.user._id,
        quiz: quiz._id
      }).sort({ createdAt: -1 });

      if (lastAttempt && lastAttempt.percentage < 70) {
        // Focus on easier questions
        selectedQuestions = quiz.questions.filter(q => q.difficulty !== 'hard');
      } else if (lastAttempt && lastAttempt.percentage > 90) {
        // Include more challenging questions
        selectedQuestions = quiz.questions.filter(q => q.difficulty !== 'easy');
      }
    }

    // Shuffle questions for variety
    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    const attempt = new QuizAttempt({
      user: req.user._id,
      quiz: quiz._id,
      answers: selectedQuestions.map(q => ({
        questionId: q._id,
        selectedAnswer: null,
        isCorrect: false,
        timeSpent: 0,
        hintsUsed: 0
      })),
      score: 0,
      totalPoints: selectedQuestions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      timeSpent: 0
    });

    await attempt.save();

    res.json({ 
      attemptId: attempt._id,
      questions: selectedQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options.map(opt => ({ text: opt.text })),
        points: q.points,
        hints: q.hints
      })),
      timeLimit: quiz.timeLimit
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answer
router.put('/attempt/:attemptId/answer', auth, async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeSpent, hintsUsed } = req.body;

    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
      completed: false
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    const question = quiz.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update answer
    const answerIndex = attempt.answers.findIndex(a => a.questionId.toString() === questionId);
    if (answerIndex !== -1) {
      let isCorrect = false;

      // Check correctness based on question type
      if (question.type === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.text === selectedAnswer;
      } else {
        isCorrect = question.correctAnswer === selectedAnswer;
      }

      attempt.answers[answerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
        hintsUsed: hintsUsed || 0
      };

      await attempt.save();

      res.json({ 
        isCorrect,
        explanation: question.explanation,
        correctAnswer: isCorrect ? null : (question.type === 'multiple-choice' ? 
          question.options.find(opt => opt.isCorrect)?.text : question.correctAnswer)
      });
    }
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit complete quiz
router.put('/attempt/:attemptId/submit', auth, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
      completed: false
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    const quiz = await Quiz.findById(attempt.quiz);

    // Calculate final score
    let score = 0;
    attempt.answers.forEach(answer => {
      if (answer.isCorrect) {
        const question = quiz.questions.id(answer.questionId);
        score += question ? question.points : 1;
      }
    });

    attempt.score = score;
    attempt.percentage = Math.round((score / attempt.totalPoints) * 100);
    attempt.passed = attempt.percentage >= quiz.passingScore;
    attempt.completed = true;
    attempt.completedAt = new Date();

    await attempt.save();

    // Update user stats
    req.user.stats.totalQuizzesTaken += 1;
    const totalScore = (req.user.stats.averageScore * (req.user.stats.totalQuizzesTaken - 1) + attempt.percentage);
    req.user.stats.averageScore = Math.round(totalScore / req.user.stats.totalQuizzesTaken);
    await req.user.save();

    // Update module progress
    let progress = await Progress.findOne({
      user: req.user._id,
      module: quiz.module
    });

    if (progress) {
      progress.sections.quiz.completed = attempt.passed;
      progress.sections.quiz.bestScore = Math.max(progress.sections.quiz.bestScore, attempt.percentage);
      progress.sections.quiz.attempts += 1;

      // Recalculate completion percentage
      const sections = progress.sections;
      const completedSections = [
        sections.theory.completed,
        sections.simulator.completed,
        sections.quiz.completed
      ].filter(Boolean).length;
      
      progress.completionPercentage = Math.round((completedSections / 3) * 100);
      
      if (progress.completionPercentage === 100 && !progress.completedAt) {
        progress.status = 'completed';
        progress.completedAt = new Date();
      } else if (progress.completionPercentage > 0) {
        progress.status = 'in-progress';
      }

      await progress.save();
    }

    res.json({
      attempt: {
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent
      },
      results: attempt.answers.map(answer => {
        const question = quiz.questions.id(answer.questionId);
        return {
          questionId: answer.questionId,
          question: question?.question,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question?.type === 'multiple-choice' ? 
            question.options.find(opt => opt.isCorrect)?.text : question?.correctAnswer,
          isCorrect: answer.isCorrect,
          explanation: question?.explanation,
          points: question?.points || 1
        };
      })
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// routes/chatbot.js
const express = require('express');
const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// System prompt for OS tutor
const SYSTEM_PROMPT = `You are an expert Operating Systems tutor designed to help students learn OS concepts. Your goals are:

1. Explain concepts clearly and in student-friendly language
2. Use analogies and real-world examples
3. Break down complex topics into digestible parts
4. Encourage critical thinking with guided questions
5. Adapt explanations based on student's level (beginner/intermediate/advanced)
6. Focus on practical understanding, not just theory
7. Help debug and explain code related to OS concepts

Topics you cover:
- Process Management & Scheduling
- CPU Scheduling Algorithms (FCFS, SJF, Round Robin, etc.)
- Deadlock Detection & Prevention
- Synchronization (Semaphores, Mutexes, etc.)
- Memory Management (Paging, Segmentation, Virtual Memory)
- File Systems & I/O Management

Always be encouraging and patient. If a student seems confused, try a different approach or analogy.`;

// Chat with AI tutor
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const currentSessionId = sessionId || uuidv4();

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: currentSessionId
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user: req.user._id,
        sessionId: currentSessionId,
        messages: [],
        context: context || {}
      });
    }

    // Add user message to history
    chatHistory.messages.push({
      role: 'user',
      content: message,
      context: context || {}
    });

    // Prepare conversation for OpenAI
    const conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.messages.slice(-10).map(msg => ({ // Keep last 10 messages for context
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add context information if available
    if (context?.currentModule || context?.topics) {
      const contextPrompt = `Current context: ${context.currentModule ? `Module: ${context.currentModule}` : ''} ${context.topics ? `Topics: ${context.topics.join(', ')}` : ''} User Level: ${context.userLevel || req.user.preferences.difficulty}`;
      conversation.splice(1, 0, { role: 'system', content: contextPrompt });
    }

    if (!OPENAI_API_KEY) {
      // Fallback response when OpenAI key is not configured
      const fallbackResponse = generateFallbackResponse(message);
      
      chatHistory.messages.push({
        role: 'assistant',
        content: fallbackResponse,
        context: context || {}
      });

      await chatHistory.save();

      return res.json({
        response: fallbackResponse,
        sessionId: currentSessionId
      });
    }

    // Call OpenAI API
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: conversation,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const aiResponse = response.data.choices[0].message.content;

    // Add AI response to history
    chatHistory.messages.push({
      role: 'assistant',
      content: aiResponse,
      context: context || {}
    });

    await chatHistory.save();

    res.json({
      response: aiResponse,
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Provide fallback response on error
    const fallbackResponse = generateFallbackResponse(req.body.message);
    res.json({
      response: fallbackResponse,
      sessionId: req.body.sessionId || uuidv4(),
      error: 'AI service temporarily unavailable'
    });
  }
});

// Get chat history
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: req.params.sessionId
    });

    if (!chatHistory) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: chatHistory.messages,
      context: chatHistory.context
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear chat history
router.delete('/history/:sessionId', auth, async (req, res) => {
  try {
    await ChatHistory.deleteOne({
      user: req.user._id,
      sessionId: req.params.sessionId
    });

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fallback response generator
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('process') && lowerMessage.includes('scheduling')) {
    return "Process scheduling is about determining which process runs next on the CPU. Common algorithms include FCFS (First Come First Served), SJF (Shortest Job First), and Round Robin. Would you like me to explain any specific scheduling algorithm?";
  }
  
  if (lowerMessage.includes('deadlock')) {
    return "Deadlock occurs when processes are blocked forever, waiting for each other. The four conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. We can prevent deadlock by breaking any of these conditions. Which aspect would you like to explore?";
  }
  
  if (lowerMessage.includes('memory') || lowerMessage.includes('paging')) {
    return "Memory management is crucial in OS. Paging divides memory into fixed-size blocks called pages, while segmentation divides it into variable-size segments. Virtual memory allows processes to use more memory than physically available. What specific memory concept interests you?";
  }
  
  if (lowerMessage.includes('semaphore') || lowerMessage.includes('synchronization')) {
    return "Synchronization ensures processes access shared resources safely. Semaphores are counters that control access - binary semaphores work like locks, while counting semaphores allow multiple accesses. Mutexes provide mutual exclusion. Need help with a specific synchronization problem?";
  }
  
  return "I'm here to help you learn Operating Systems! I can explain concepts like process scheduling, memory management, deadlocks, synchronization, file systems, and more. What specific topic would you like to explore?";
}

module.exports = router;

// routes/simulators.js
const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// CPU Scheduling Simulator
router.post('/cpu-scheduling', auth, async (req, res) => {
  try {
    const { algorithm, processes } = req.body;

    if (!algorithm || !processes || !Array.isArray(processes)) {
      return res.status(400).json({ message: 'Algorithm and processes are required' });
    }

    let result = {};

    switch (algorithm.toLowerCase()) {
      case 'fcfs':
        result = simulateFCFS(processes);
        break;
      case 'sjf':
        result = simulateSJF(processes);
        break;
      case 'round-robin':
      case 'rr':
        const timeQuantum = req.body.timeQuantum || 2;
        result = simulateRoundRobin(processes, timeQuantum);
        break;
      case 'priority':
        result = simulatePriority(processes);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported algorithm' });
    }

    res.json(result);
  } catch (error) {
    console.error('CPU Scheduling simulation error:', error);
    res.status(500).json({ message: 'Simulation error' });
  }
});

// Memory Allocation Simulator
router.post('/memory-allocation', auth, async (req, res) => {
  try {
    const { algorithm, memorySize, processes } = req.body;

    if (!algorithm || !memorySize || !processes) {
      return res.status(400).json({ message: 'Algorithm, memory size, and processes are required' });
    }

    let result = {};

    switch (algorithm.toLowerCase()) {
      case 'first-fit':
        result = simulateFirstFit(memorySize, processes);
        break;
      case 'best-fit':
        result = simulateBestFit(memorySize, processes);
        break;
      case 'worst-fit':
        result = simulateWorstFit(memorySize, processes);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported algorithm' });
    }

    res.json(result);
  } catch (error) {
    console.error('Memory allocation simulation error:', error);
    res.status(500).json({ message: 'Simulation error' });
  }
});

// Page Replacement Simulator
router.post('/page-replacement', auth, async (req, res) => {
  try {
    const { algorithm, pageFrames, referenceString } = req.body;

    if (!algorithm || !pageFrames || !referenceString) {
      return res.status(400).json({ message: 'Algorithm, page frames, and reference string are required' });
    }

    let result = {};

    switch (algorithm.toLowerCase()) {
      case 'fifo':
        result = simulateFIFO(pageFrames, referenceString);
        break;
      case 'lru':
        result = simulateLRU(pageFrames, referenceString);
        break;
      case 'optimal':
        result = simulateOptimal(pageFrames, referenceString);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported algorithm' });
    }

    res.json(result);
  } catch (error) {
    console.error('Page replacement simulation error:', error);
    res.status(500).json({ message: 'Simulation error' });
  }
});

// CPU Scheduling Algorithms Implementation
function simulateFCFS(processes) {
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0
  };

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  // Sort by arrival time
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  sortedProcesses.forEach((process) => {
    const startTime = Math.max(currentTime, process.arrivalTime);
    const endTime = startTime + process.burstTime;
    const waitingTime = startTime - process.arrivalTime;
    const turnaroundTime = endTime - process.arrivalTime;

    result.ganttChart.push({
      processId: process.id,
      startTime,
      endTime,
      duration: process.burstTime
    });

    result.processResults.push({
      processId: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;
  });

  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

function simulateSJF(processes) {
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0
  };

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  const remainingProcesses = [...processes];
  const completedProcesses = [];

  while (remainingProcesses.length > 0) {
    // Find processes that have arrived
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      // No process available, jump to next arrival
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }

    // Select shortest job
    const shortestJob = availableProcesses.reduce((prev, curr) => 
      prev.burstTime < curr.burstTime ? prev : curr
    );

    const startTime = currentTime;
    const endTime = startTime + shortestJob.burstTime;
    const waitingTime = startTime - shortestJob.arrivalTime;
    const turnaroundTime = endTime - shortestJob.arrivalTime;

    result.ganttChart.push({
      processId: shortestJob.id,
      startTime,
      endTime,
      duration: shortestJob.burstTime
    });

    completedProcesses.push({
      processId: shortestJob.id,
      arrivalTime: shortestJob.arrivalTime,
      burstTime: shortestJob.burstTime,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;

    // Remove completed process
    const index = remainingProcesses.findIndex(p => p.id === shortestJob.id);
    remainingProcesses.splice(index, 1);
  }

  result.processResults = completedProcesses;
  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

function simulateRoundRobin(processes, timeQuantum) {
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    timeQuantum
  };

  let currentTime = 0;
  const queue = [];
  const remainingTime = {};
  const waitingTime = {};
  const turnaroundTime = {};

  // Initialize remaining times and waiting times
  processes.forEach(p => {
    remainingTime[p.id] = p.burstTime;
    waitingTime[p.id] = 0;
  });

  // Add processes to queue based on arrival time
  let processIndex = 0;
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  // Add first process
  if (sortedProcesses.length > 0) {
    queue.push(sortedProcesses[0]);
    processIndex = 1;
  }

  while (queue.length > 0) {
    const currentProcess = queue.shift();
    const executeTime = Math.min(timeQuantum, remainingTime[currentProcess.id]);
    
    result.ganttChart.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
      duration: executeTime
    });

    currentTime += executeTime;
    remainingTime[currentProcess.id] -= executeTime;

    // Add newly arrived processes to queue
    while (processIndex < sortedProcesses.length && 
           sortedProcesses[processIndex].arrivalTime <= currentTime) {
      queue.push(sortedProcesses[processIndex]);
      processIndex++;
    }

    // If process is completed
    if (remainingTime[currentProcess.id] === 0) {
      turnaroundTime[currentProcess.id] = currentTime - currentProcess.arrivalTime;
      waitingTime[currentProcess.id] = turnaroundTime[currentProcess.id] - currentProcess.burstTime;
    } else {
      // Add back to queue if not completed
      queue.push(currentProcess);
    }
  }

  // Calculate results
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processes.forEach(process => {
    result.processResults.push({
      processId: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      waitingTime: waitingTime[process.id],
      turnaroundTime: turnaroundTime[process.id]
    });

    totalWaitingTime += waitingTime[process.id];
    totalTurnaroundTime += turnaroundTime[process.id];
  });

  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

function simulatePriority(processes) {
  // Similar to SJF but using priority instead of burst time
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0
  };

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  const remainingProcesses = [...processes];
  const completedProcesses = [];

  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }

    // Select highest priority (lower number = higher priority)
    const highestPriority = availableProcesses.reduce((prev, curr) => 
      prev.priority < curr.priority ? prev : curr
    );

    const startTime = currentTime;
    const endTime = startTime + highestPriority.burstTime;
    const waitingTime = startTime - highestPriority.arrivalTime;
    const turnaroundTime = endTime - highestPriority.arrivalTime;

    result.ganttChart.push({
      processId: highestPriority.id,
      startTime,
      endTime,
      duration: highestPriority.burstTime
    });

    completedProcesses.push({
      processId: highestPriority.id,
      arrivalTime: highestPriority.arrivalTime,
      burstTime: highestPriority.burstTime,
      priority: highestPriority.priority,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;

    const index = remainingProcesses.findIndex(p => p.id === highestPriority.id);
    remainingProcesses.splice(index, 1);
  }

  result.processResults = completedProcesses;
  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

// Memory Allocation Algorithms
function simulateFirstFit(memorySize, processes) {
  const memory = Array(memorySize).fill(null);
  const allocations = [];
  const failures = [];

  processes.forEach(process => {
    let allocated = false;
    let consecutiveCount = 0;
    let startIndex = -1;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        if (consecutiveCount === 0) startIndex = i;
        consecutiveCount++;
        
        if (consecutiveCount >= process.size) {
          // Allocate memory
          for (let j = startIndex; j < startIndex + process.size; j++) {
            memory[j] = process.id;
          }
          
          allocations.push({
            processId: process.id,
            size: process.size,
            startAddress: startIndex,
            endAddress: startIndex + process.size - 1,
            allocated: true
          });
          
          allocated = true;
          break;
        }
      } else {
        consecutiveCount = 0;
      }
    }

    if (!allocated) {
      failures.push({
        processId: process.id,
        size: process.size,
        allocated: false,
        reason: 'Insufficient contiguous memory'
      });
    }
  });

  // Calculate fragmentation
  const freeBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === null) {
      if (!currentBlock) {
        currentBlock = { start: i, size: 1 };
      } else {
        currentBlock.size++;
      }
    } else {
      if (currentBlock) {
        freeBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }
  if (currentBlock) freeBlocks.push(currentBlock);

  const totalFreeSpace = freeBlocks.reduce((sum, block) => sum + block.size, 0);
  const externalFragmentation = freeBlocks.length > 0 ? 
    totalFreeSpace - Math.max(...freeBlocks.map(b => b.size), 0) : 0;

  return {
    algorithm: 'First Fit',
    memoryState: memory,
    allocations: [...allocations, ...failures],
    freeBlocks,
    statistics: {
      totalMemory: memorySize,
      allocatedMemory: memorySize - totalFreeSpace,
      freeMemory: totalFreeSpace,
      externalFragmentation,
      successfulAllocations: allocations.length,
      failedAllocations: failures.length
    }
  };
}

function simulateBestFit(memorySize, processes) {
  const memory = Array(memorySize).fill(null);
  const allocations = [];
  const failures = [];

  processes.forEach(process => {
    // Find all free blocks
    const freeBlocks = [];
    let currentBlock = null;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        if (!currentBlock) {
          currentBlock = { start: i, size: 1 };
        } else {
          currentBlock.size++;
        }
      } else {
        if (currentBlock && currentBlock.size >= process.size) {
          freeBlocks.push(currentBlock);
        }
        currentBlock = null;
      }
    }
    if (currentBlock && currentBlock.size >= process.size) {
      freeBlocks.push(currentBlock);
    }

    if (freeBlocks.length > 0) {
      // Find best fit (smallest block that can accommodate the process)
      const bestBlock = freeBlocks.reduce((best, current) => 
        current.size < best.size ? current : best
      );

      // Allocate memory
      for (let j = bestBlock.start; j < bestBlock.start + process.size; j++) {
        memory[j] = process.id;
      }

      allocations.push({
        processId: process.id,
        size: process.size,
        startAddress: bestBlock.start,
        endAddress: bestBlock.start + process.size - 1,
        allocated: true,
        blockSize: bestBlock.size
      });
    } else {
      failures.push({
        processId: process.id,
        size: process.size,
        allocated: false,
        reason: 'No suitable block found'
      });
    }
  });

  // Calculate statistics similar to First Fit
  const freeBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === null) {
      if (!currentBlock) {
        currentBlock = { start: i, size: 1 };
      } else {
        currentBlock.size++;
      }
    } else {
      if (currentBlock) {
        freeBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }
  if (currentBlock) freeBlocks.push(currentBlock);

  const totalFreeSpace = freeBlocks.reduce((sum, block) => sum + block.size, 0);

  return {
    algorithm: 'Best Fit',
    memoryState: memory,
    allocations: [...allocations, ...failures],
    freeBlocks,
    statistics: {
      totalMemory: memorySize,
      allocatedMemory: memorySize - totalFreeSpace,
      freeMemory: totalFreeSpace,
      successfulAllocations: allocations.length,
      failedAllocations: failures.length
    }
  };
}

function simulateWorstFit(memorySize, processes) {
  // Similar to Best Fit but selects the largest available block
  const memory = Array(memorySize).fill(null);
  const allocations = [];
  const failures = [];

  processes.forEach(process => {
    const freeBlocks = [];
    let currentBlock = null;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        if (!currentBlock) {
          currentBlock = { start: i, size: 1 };
        } else {
          currentBlock.size++;
        }
      } else {
        if (currentBlock && currentBlock.size >= process.size) {
          freeBlocks.push(currentBlock);
        }
        currentBlock = null;
      }
    }
    if (currentBlock && currentBlock.size >= process.size) {
      freeBlocks.push(currentBlock);
    }

    if (freeBlocks.length > 0) {
      // Find worst fit (largest block)
      const worstBlock = freeBlocks.reduce((worst, current) => 
        current.size > worst.size ? current : worst
      );

      // Allocate memory
      for (let j = worstBlock.start; j < worstBlock.start + process.size; j++) {
        memory[j] = process.id;
      }

      allocations.push({
        processId: process.id,
        size: process.size,
        startAddress: worstBlock.start,
        endAddress: worstBlock.start + process.size - 1,
        allocated: true,
        blockSize: worstBlock.size
      });
    } else {
      failures.push({
        processId: process.id,
        size: process.size,
        allocated: false,
        reason: 'No suitable block found'
      });
    }
  });

  // Calculate statistics
  const freeBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === null) {
      if (!currentBlock) {
        currentBlock = { start: i, size: 1 };
      } else {
        currentBlock.size++;
      }
    } else {
      if (currentBlock) {
        freeBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }
  if (currentBlock) freeBlocks.push(currentBlock);

  const totalFreeSpace = freeBlocks.reduce((sum, block) => sum + block.size, 0);

  return {
    algorithm: 'Worst Fit',
    memoryState: memory,
    allocations: [...allocations, ...failures],
    freeBlocks,
    statistics: {
      totalMemory: memorySize,
      allocatedMemory: memorySize - totalFreeSpace,
      freeMemory: totalFreeSpace,
      successfulAllocations: allocations.length,
      failedAllocations: failures.length
    }
  };
}

// Page Replacement Algorithms
function simulateFIFO(pageFrames, referenceString) {
  const frames = Array(pageFrames).fill(null);
  const steps = [];
  let pageFaults = 0;
  let hits = 0;
  let pointer = 0;

  referenceString.forEach((page, index) => {
    const framesCopy = [...frames];
    let isHit = frames.includes(page);

    if (isHit) {
      hits++;
    } else {
      pageFaults++;
      frames[pointer] = page;
      pointer = (pointer + 1) % pageFrames;
    }

    steps.push({
      step: index + 1,
      page: page,
      frames: [...frames],
      isHit: isHit,
      isFault: !isHit,
      replacedPage: !isHit && framesCopy[pointer % pageFrames] !== null ? 
        framesCopy[pointer % pageFrames] : null
    });
  });

  return {
    algorithm: 'FIFO',
    pageFrames,
    referenceString,
    steps,
    statistics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits: hits,
      hitRatio: (hits / referenceString.length * 100).toFixed(2) + '%',
      faultRatio: (pageFaults / referenceString.length * 100).toFixed(2) + '%'
    }
  };
}

function simulateLRU(pageFrames, referenceString) {
  const frames = [];
  const steps = [];
  let pageFaults = 0;
  let hits = 0;

  referenceString.forEach((page, index) => {
    let isHit = false;
    let replacedPage = null;

    // Check if page is already in frames
    const existingIndex = frames.findIndex(frame => frame.page === page);
    
    if (existingIndex !== -1) {
      // Hit - update last used time
      frames[existingIndex].lastUsed = index;
      isHit = true;
      hits++;
    } else {
      // Miss - page fault
      pageFaults++;
      
      if (frames.length < pageFrames) {
        // Frame available
        frames.push({ page: page, lastUsed: index });
      } else {
        // Replace LRU page
        const lruIndex = frames.reduce((minIndex, current, currentIndex) => 
          current.lastUsed < frames[minIndex].lastUsed ? currentIndex : minIndex, 0);
        
        replacedPage = frames[lruIndex].page;
        frames[lruIndex] = { page: page, lastUsed: index };
      }
    }

    steps.push({
      step: index + 1,
      page: page,
      frames: frames.map(f => f.page),
      isHit: isHit,
      isFault: !isHit,
      replacedPage: replacedPage
    });
  });

  return {
    algorithm: 'LRU',
    pageFrames,
    referenceString,
    steps,
    statistics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits: hits,
      hitRatio: (hits / referenceString.length * 100).toFixed(2) + '%',
      faultRatio: (pageFaults / referenceString.length * 100).toFixed(2) + '%'
    }
  };
}

function simulateOptimal(pageFrames, referenceString) {
  const frames = Array(pageFrames).fill(null);
  const steps = [];
  let pageFaults = 0;
  let hits = 0;

  referenceString.forEach((page, index) => {
    let isHit = frames.includes(page);
    let replacedPage = null;

    if (isHit) {
      hits++;
    } else {
      pageFaults++;
      
      // Find empty frame
      const emptyIndex = frames.indexOf(null);
      
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
      } else {
        // Find optimal page to replace
        let replaceIndex = 0;
        let farthestNext = -1;

        frames.forEach((framePage, frameIndex) => {
          // Find when this page will be used next
          let nextUse = referenceString.length; // Default to end if not found
          
          for (let i = index + 1; i < referenceString.length; i++) {
            if (referenceString[i] === framePage) {
              nextUse = i;
              break;
            }
          }

          if (nextUse > farthestNext) {
            farthestNext = nextUse;
            replaceIndex = frameIndex;
          }
        });

        replacedPage = frames[replaceIndex];
        frames[replaceIndex] = page;
      }
    }

    steps.push({
      step: index + 1,
      page: page,
      frames: [...frames],
      isHit: isHit,
      isFault: !isHit,
      replacedPage: replacedPage
    });
  });

  return {
    algorithm: 'Optimal',
    pageFrames,
    referenceString,
    steps,
    statistics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits: hits,
      hitRatio: (hits / referenceString.length * 100).toFixed(2) + '%',
      faultRatio: (pageFaults / referenceString.length * 100).toFixed(2) + '%'
    }
  };
}

module.exports = router;

// routes/progress.js
const express = require('express');
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's overall progress
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all modules with user progress
    const modules = await Module.find({ isPublished: true })
      .select('title slug category difficulty estimatedTime order')
      .sort({ order: 1 });

    const progressData = await Progress.find({ user: userId })
      .populate('module', 'title slug category');

    // Create progress map
    const progressMap = {};
    progressData.forEach(p => {
      if (p.module) {
        progressMap[p.module._id.toString()] = p;
      }
    });

    // Combine modules with progress
    const modulesWithProgress = modules.map(module => {
      const progress = progressMap[module._id.toString()];
      return {
        ...module.toObject(),
        progress: progress ? {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          timeSpent: progress.timeSpent,
          sections: progress.sections,
          lastAccessed: progress.lastAccessed
        } : {
          status: 'not-started',
          completionPercentage: 0,
          timeSpent: 0,
          sections: {
            theory: { completed: false, timeSpent: 0 },
            simulator: { completed: false, timeSpent: 0, interactions: 0 },
            quiz: { completed: false, bestScore: 0, attempts: 0 }
          },
          lastAccessed: null
        }
      };
    });

    // Calculate overall statistics
    const totalModules = modules.length;
    const completedModules = progressData.filter(p => p.status === 'completed').length;
    const inProgressModules = progressData.filter(p => p.status === 'in-progress').length;
    const totalTimeSpent = progressData.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageCompletion = totalModules > 0 ? 
      progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / totalModules : 0;

    // Get recent quiz attempts
    const recentQuizzes = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title')
      .populate({
        path: 'quiz',
        populate: {
          path: 'module',
          select: 'title slug'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get weak areas and strengths
    const allWeakAreas = progressData.reduce((areas, p) => [...areas, ...p.weakAreas], []);
    const allStrengths = progressData.reduce((areas, p) => [...areas, ...p.strengths], []);

    const weakAreasCount = {};
    const strengthsCount = {};

    allWeakAreas.forEach(area => {
      weakAreasCount[area] = (weakAreasCount[area] || 0) + 1;
    });

    allStrengths.forEach(area => {
      strengthsCount[area] = (strengthsCount[area] || 0) + 1;
    });

    const topWeakAreas = Object.entries(weakAreasCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    const topStrengths = Object.entries(strengthsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    res.json({
      modules: modulesWithProgress,
      statistics: {
        totalModules,
        completedModules,
        inProgressModules,
        notStartedModules: totalModules - completedModules - inProgressModules,
        totalTimeSpent,
        averageCompletion: Math.round(averageCompletion),
        completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
      },
      recentActivity: {
        recentQuizzes: recentQuizzes.map(quiz => ({
          id: quiz._id,
          title: quiz.quiz?.title || 'Unknown Quiz',
          module: quiz.quiz?.module?.title || 'Unknown Module',
          moduleSlug: quiz.quiz?.module?.slug,
          score: quiz.percentage,
          passed: quiz.passed,
          completedAt: quiz.completedAt,
          timeSpent: quiz.timeSpent
        }))
      },
      insights: {
        weakAreas: topWeakAreas,
        strengths: topStrengths
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed progress for a specific module
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      module: req.params.moduleId
    }).populate('module', 'title slug category difficulty estimatedTime');

    if (!progress) {
      const module = await Module.findById(req.params.moduleId)
        .select('title slug category difficulty estimatedTime');
      
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }

      return res.json({
        module,
        progress: {
          status: 'not-started',
          completionPercentage: 0,
          timeSpent: 0,
          sections: {
            theory: { completed: false, timeSpent: 0 },
            simulator: { completed: false, timeSpent: 0, interactions: 0 },
            quiz: { completed: false, bestScore: 0, attempts: 0 }
          },
          weakAreas: [],
          strengths: [],
          lastAccessed: null
        }
      });
    }

    // Get quiz attempts for this module
    const quizAttempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: { $exists: true }
    }).populate({
      path: 'quiz',
      match: { module: req.params.moduleId },
      select: 'title module'
    }).sort({ createdAt: -1 });

    const validAttempts = quizAttempts.filter(attempt => attempt.quiz !== null);

    res.json({
      module: progress.module,
      progress: {
        status: progress.status,
        completionPercentage: progress.completionPercentage,
        timeSpent: progress.timeSpent,
        sections: progress.sections,
        weakAreas: progress.weakAreas,
        strengths: progress.strengths,
        lastAccessed: progress.lastAccessed,
        completedAt: progress.completedAt
      },
      quizHistory: validAttempts.map(attempt => ({
        id: attempt._id,
        score: attempt.percentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt
      }))
    });

  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update learning insights
router.put('/insights/:moduleId', auth, async (req, res) => {
  try {
    const { weakAreas, strengths } = req.body;

    let progress = await Progress.findOne({
      user: req.user._id,
      module: req.params.moduleId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        module: req.params.moduleId
      });
    }

    if (weakAreas && Array.isArray(weakAreas)) {
      progress.weakAreas = [...new Set([...progress.weakAreas, ...weakAreas])];
    }

    if (strengths && Array.isArray(strengths)) {
      progress.strengths = [...new Set([...progress.strengths, ...strengths])];
    }

    await progress.save();

    res.json({ message: 'Insights updated successfully' });
  } catch (error) {
    console.error('Update insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// routes/learningPath.js
const express = require('express');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized learning path
router.get('/recommend', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userLevel = req.user.preferences.difficulty;

    // Get user's progress
    const userProgress = await Progress.find({ user: userId })
      .populate('module', 'title slug category difficulty prerequisites');

    // Get all modules
    const allModules = await Module.find({ isPublished: true })
      .populate('prerequisites', 'title slug')
      .sort({ order: 1 });

    // Create progress map
    const progressMap = {};
    userProgress.forEach(p => {
      if (p.module) {
        progressMap[p.module._id.toString()] = p;
      }
    });

    // Analyze user performance
    const recentQuizzes = await QuizAttempt.find({ user: userId })
      .populate({
        path: 'quiz',
        populate: { path: 'module', select: 'category' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate performance by category
    const categoryPerformance = {};
    recentQuizzes.forEach(attempt => {
      if (attempt.quiz && attempt.quiz.module) {
        const category = attempt.quiz.module.category;
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = { total: 0, scores: [] };
        }
        categoryPerformance[category].scores.push(attempt.percentage);
        categoryPerformance[category].total++;
      }
    });

    // Calculate average scores per category
    Object.keys(categoryPerformance).forEach(category => {
      const scores = categoryPerformance[category].scores;
      categoryPerformance[category].average = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Generate recommendations
    const recommendations = [];

    // 1. Next logical modules (based on prerequisites and completion)
    const completedModules = userProgress
      .filter(p => p.status === 'completed')
      .map(p => p.module._id.toString());

    const inProgressModules = userProgress
      .filter(p => p.status === 'in-progress')
      .map(p => p.module._id.toString());

    allModules.forEach(module => {
      const moduleId = module._id.toString();
      const progress = progressMap[moduleId];
      
      // Skip if already completed
      if (completedModules.includes(moduleId)) return;

      let score = 0;
      let reason = [];

      // Check prerequisites
      const prerequisitesMet = module.prerequisites.every(prereq => 
        completedModules.includes(prereq._id.toString())
      );

      if (!prerequisitesMet) return; // Skip if prerequisites not met

      // Scoring logic
      
      // 1. Continue in-progress modules (high priority)
      if (inProgressModules.includes(moduleId)) {
        score += 50;
        reason.push('Continue your current progress');
      }

      // 2. Match user's difficulty preference
      if (module.difficulty === userLevel) {
        score += 20;
        reason.push(`Matches your ${userLevel} level`);
      } else if (userLevel === 'beginner' && module.difficulty === 'intermediate') {
        score += 10;
        reason.push('Next step in difficulty');
      } else if (userLevel === 'intermediate' && module.difficulty === 'advanced') {
        score += 10;
        reason.push('Next step in difficulty');
      }

      // 3. Weak areas (high priority)
      const allWeakAreas = userProgress.reduce((areas, p) => [...areas, ...p.weakAreas], []);
      const moduleCategory = module.category;
      
      if (allWeakAreas.some(area => area.toLowerCase().includes(moduleCategory.toLowerCase()))) {
        score += 30;
        reason.push('Addresses your weak areas');
      }

      // 4. Low performance in category
      if (categoryPerformance[moduleCategory] && categoryPerformance[moduleCategory].average < 70) {
        score += 25;
        reason.push('Improve performance in this area');
      }

      // 5. Sequential order preference
      const moduleOrder = module.order;
      const completedOrders = userProgress
        .filter(p => p.status === 'completed' && p.module)
        .map(p => p.module.order);
      
      if (completedOrders.length > 0) {
        const maxCompletedOrder = Math.max(...completedOrders);
        if (moduleOrder === maxCompletedOrder + 1) {
          score += 15;
          reason.push('Next in sequence');
        }
      }

      // 6. Time since last activity in category
      const categoryProgress = userProgress.filter(p => 
        p.module && p.module.category === moduleCategory
      );
      
      if (categoryProgress.length > 0) {
        const lastAccessed = Math.max(...categoryProgress.map(p => 
          new Date(p.lastAccessed || 0).getTime()
        ));
        const daysSinceAccess = (Date.now() - lastAccessed) / (1000 * 60 * 60 * 24);
        
        if (daysSinceAccess > 7) {
          score += 10;
          reason.push('Review recommended');
        }
      }

      if (score > 0) {
        recommendations.push({
          module: {
            id: module._id,
            title: module.title,
            slug: module.slug,
            category: module.category,
            difficulty: module.difficulty,
            estimatedTime: module.estimatedTime,
            description: module.description
          },
          score,
          priority: score > 40 ? 'high' : score > 20 ? 'medium' : 'low',
          reasons: reason,
          currentProgress: progress ? {
            status: progress.status,
            completionPercentage: progress.completionPercentage,
            timeSpent: progress.timeSpent
          } : null
        });
      }
    });

    // Sort by score and limit
    recommendations.sort((a, b) => b.score - a.score);

    // Group recommendations
    const highPriority = recommendations.filter(r => r.priority === 'high').slice(0, 3);
    const mediumPriority = recommendations.filter(r => r.priority === 'medium').slice(0, 5);
    const lowPriority = recommendations.filter(r => r.priority === 'low').slice(0, 3);

    // Generate study plan
    const studyPlan = generateStudyPlan(highPriority, mediumPriority, userLevel);

    res.json({
      recommendations: {
        highPriority,
        mediumPriority,
        lowPriority
      },
      studyPlan,
      insights: {
        categoryPerformance,
        weakAreas: userProgress.reduce((areas, p) => [...areas, ...p.weakAreas], []),
        completionRate: allModules.length > 0 ? 
          Math.round((completedModules.length / allModules.length) * 100) : 0,
        averageScore: req.user.stats.averageScore
      }
    });

  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate study plan helper function
function generateStudyPlan(highPriority, mediumPriority, userLevel) {
  const plan = {
    thisWeek: [],
    nextWeek: [],
    thisMonth: []
  };

  let totalTime = 0;
  const maxWeeklyTime = userLevel === 'beginner' ? 180 : userLevel === 'intermediate' ? 240 : 300; // minutes

  // This week - focus on high priority
  highPriority.forEach((rec, index) => {
    if (totalTime + rec.module.estimatedTime <= maxWeeklyTime && index < 2) {
      plan.thisWeek.push({
        ...rec,
        suggestedTime: rec.module.estimatedTime,
        day: index === 0 ? 'Monday-Tuesday' : 'Wednesday-Thursday'
      });
      totalTime += rec.module.estimatedTime;
    }
  });

  // Next week - remaining high priority + medium priority
  totalTime = 0;
  const remainingHigh = highPriority.slice(plan.thisWeek.length);
  const nextWeekCandidates = [...remainingHigh, ...mediumPriority.slice(0, 3)];

  nextWeekCandidates.forEach((rec, index) => {
    if (totalTime + rec.module.estimatedTime <= maxWeeklyTime && index < 3) {
      plan.nextWeek.push({
        ...rec,
        suggestedTime: rec.module.estimatedTime,
        day: ['Monday-Tuesday', 'Wednesday-Thursday', 'Friday-Weekend'][index]
      });
      totalTime += rec.module.estimatedTime;
    }
  });

  // This month - broader view
  const allRecommendations = [...highPriority, ...mediumPriority];
  const monthlyGoal = Math.min(allRecommendations.length, userLevel === 'beginner' ? 4 : 6);
  
  plan.thisMonth = allRecommendations.slice(0, monthlyGoal).map(rec => ({
    ...rec,
    suggestedWeek: Math.ceil((plan.thisMonth.length + 1) / 2)
  }));

  return plan;
}

// Update user learning preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { difficulty, learningStyle, voiceEnabled } = req.body;

    if (difficulty) {
      req.user.preferences.difficulty = difficulty;
    }
    if (learningStyle) {
      req.user.preferences.learningStyle = learningStyle;
    }
    if (typeof voiceEnabled === 'boolean') {
      req.user.preferences.voiceEnabled = voiceEnabled;
    }

    await req.user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: req.user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// routes/users.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email && email !== req.user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { difficulty, learningStyle, voiceEnabled } = req.body;

    const user = await User.findById(req.user._id);
    
    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      user.preferences.difficulty = difficulty;
    }
    
    if (learningStyle && ['visual', 'auditory', 'kinesthetic', 'mixed'].includes(learningStyle)) {
      user.preferences.learningStyle = learningStyle;
    }
    
    if (typeof voiceEnabled === 'boolean') {
      user.preferences.voiceEnabled = voiceEnabled;
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ achievements: user.achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add achievement (internal use)
router.post('/achievements', auth, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const user = await User.findById(req.user._id);
    
    // Check if achievement already exists
    const existingAchievement = user.achievements.find(a => a.name === name);
    if (existingAchievement) {
      return res.status(400).json({ message: 'Achievement already earned' });
    }

    user.achievements.push({
      name,
      description,
      icon,
      earnedAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Achievement earned!',
      achievement: user.achievements[user.achievements.length - 1]
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// scripts/seedData.js
const mongoose = require('mongoose');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/os-learning-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed database...');

    // Clear existing data
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@oslp.com',
      password: 'Admin123!',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Seed modules
    const modules = [
      {
        title: 'Introduction to Operating Systems',
        slug: 'intro-to-os',
        description: 'Learn the fundamentals of operating systems, their purpose, and basic concepts.',
        category: 'process-management',
        difficulty: 'beginner',
        estimatedTime: 45,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'An operating system (OS) is system software that manages computer hardware and software resources.',
            concepts: [
              {
                title: 'What is an Operating System?',
                explanation: 'An OS acts as an intermediary between users and computer hardware.',
                examples: ['Windows', 'macOS', 'Linux', 'Android'],
                diagrams: []
              },
              {
                title: 'Functions of OS',
                explanation: 'Main functions include process management, memory management, file management, and I/O management.',
                examples: ['Task Manager', 'File Explorer', 'Device Manager'],
                diagrams: []
              }
            ],
            summary: 'Operating systems provide essential services for computer systems to function efficiently.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <stdio.h>\n#include <unistd.h>\n\nint main() {\n    printf("Process ID: %d\\n", getpid());\n    return 0;\n}',
              explanation: 'Simple C program to get process ID using system call'
            }
          ],
          resources: [
            {
              title: 'OS Concepts by Silberschatz',
              type: 'book',
              url: '#',
              description: 'Comprehensive textbook on operating systems'
            }
          ]
        },
        simulator: {
          type: 'cpu-scheduling',
          config: { algorithms: ['fcfs', 'sjf', 'round-robin'] }
        },
        order: 1,
        createdBy: adminUser._id,
        tags: ['basics', 'introduction', 'fundamentals']
      },
      {
        title: 'Process Management',
        slug: 'process-management',
        description: 'Understanding processes, process states, and process control blocks.',
        category: 'process-management',
        difficulty: 'beginner',
        estimatedTime: 60,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'A process is a program in execution. Process management involves creating, scheduling, and terminating processes.',
            concepts: [
              {
                title: 'Process States',
                explanation: 'Processes can be in different states: new, ready, running, waiting, and terminated.',
                examples: ['Running process', 'Blocked process', 'Ready queue'],
                diagrams: []
              },
              {
                title: 'Process Control Block (PCB)',
                explanation: 'PCB contains information about a process including process ID, state, program counter, and registers.',
                examples: ['Process ID: 1234', 'State: Running', 'Priority: 5'],
                diagrams: []
              }
            ],
            summary: 'Process management is crucial for multitasking and system efficiency.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <sys/types.h>\n#include <unistd.h>\n\nint main() {\n    pid_t pid = fork();\n    if (pid == 0) {\n        // Child process\n        printf("Child process\\n");\n    } else {\n        // Parent process\n        printf("Parent process\\n");\n    }\n    return 0;\n}',
              explanation: 'Creating a new process using fork() system call'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'cpu-scheduling',
          config: { algorithms: ['fcfs', 'sjf', 'round-robin', 'priority'] }
        },
        order: 2,
        createdBy: adminUser._id,
        tags: ['processes', 'PCB', 'states']
      },
      {
        title: 'CPU Scheduling Algorithms',
        slug: 'cpu-scheduling',
        description: 'Learn various CPU scheduling algorithms like FCFS, SJF, Round Robin, and Priority scheduling.',
        category: 'cpu-scheduling',
        difficulty: 'intermediate',
        estimatedTime: 90,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'CPU scheduling determines which process runs next on the CPU to maximize system efficiency.',
            concepts: [
              {
                title: 'First Come First Served (FCFS)',
                explanation: 'Processes are executed in the order they arrive. Simple but can cause convoy effect.',
                examples: ['P1 arrives first, executes first', 'Non-preemptive'],
                diagrams: []
              },
              {
                title: 'Shortest Job First (SJF)',
                explanation: 'Process with shortest burst time executes first. Optimal for average waiting time.',
                examples: ['P1: 6ms, P2: 8ms, P3: 7ms → P1, P3, P2'],
                diagrams: []
              },
              {
                title: 'Round Robin (RR)',
                explanation: 'Each process gets equal time quantum. Preemptive and fair.',
                examples: ['Time quantum = 4ms', 'Preemptive scheduling'],
                diagrams: []
              }
            ],
            summary: 'Different scheduling algorithms optimize for different criteria like waiting time, response time, and fairness.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '// FCFS Scheduling\nvoid fcfs(struct process proc[], int n) {\n    int waiting_time = 0;\n    for(int i = 0; i < n; i++) {\n        proc[i].waiting_time = waiting_time;\n        waiting_time += proc[i].burst_time;\n    }\n}',
              explanation: 'Implementation of FCFS scheduling algorithm'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'cpu-scheduling',
          config: { algorithms: ['fcfs', 'sjf', 'round-robin', 'priority'] }
        },
        order: 3,
        createdBy: adminUser._id,
        tags: ['scheduling', 'algorithms', 'CPU']
      },
      {
        title: 'Deadlocks and Synchronization',
        slug: 'deadlocks-sync',
        description: 'Understanding deadlocks, their conditions, prevention, and synchronization mechanisms.',
        category: 'deadlock-sync',
        difficulty: 'advanced',
        estimatedTime: 120,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'Deadlock occurs when processes are blocked forever, each waiting for the other to release resources.',
            concepts: [
              {
                title: 'Deadlock Conditions',
                explanation: 'Four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
                examples: ['Two processes, two resources', 'Each holds one, needs the other'],
                diagrams: []
              },
              {
                title: 'Semaphores',
                explanation: 'Semaphores are integer variables used for process synchronization.',
                examples: ['Binary semaphore (mutex)', 'Counting semaphore'],
                diagrams: []
              },
              {
                title: 'Monitors',
                explanation: 'High-level synchronization construct that provides mutual exclusion automatically.',
                examples: ['Condition variables', 'Wait and signal operations'],
                diagrams: []
              }
            ],
            summary: 'Proper synchronization prevents deadlocks and ensures data consistency in concurrent systems.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <semaphore.h>\n\nsem_t mutex;\n\nvoid critical_section() {\n    sem_wait(&mutex);  // P operation\n    // Critical section code\n    printf("In critical section\\n");\n    sem_post(&mutex);  // V operation\n}',
              explanation: 'Using semaphore for mutual exclusion'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'deadlock-detection',
          config: { maxProcesses: 5, maxResources: 4 }
        },
        order: 4,
        createdBy: adminUser._id,
        tags: ['deadlock', 'synchronization', 'semaphores']
      },
      {
        title: 'Memory Management',
        slug: 'memory-management',
        description: 'Learn about memory allocation, paging, segmentation, and virtual memory.',
        category: 'memory-management',
        difficulty: 'intermediate',
        estimatedTime: 100,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'Memory management involves allocating and deallocating memory space for processes efficiently.',
            concepts: [
              {
                title: 'Paging',
                explanation: 'Memory is divided into fixed-size blocks called pages. Enables non-contiguous allocation.',
                examples: ['Page size: 4KB', 'Page table mapping', 'Virtual to physical address'],
                diagrams: []
              },
              {
                title: 'Segmentation',
                explanation: 'Memory is divided into variable-size segments based on logical divisions.',
                examples: ['Code segment', 'Data segment', 'Stack segment'],
                diagrams: []
              },
              {
                title: 'Virtual Memory',
                explanation: 'Technique that allows execution of processes larger than main memory.',
                examples: ['Page replacement', 'Demand paging', 'Thrashing'],
                diagrams: []
              }
            ],
            summary: 'Memory management techniques optimize memory usage and enable multiprogramming.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <stdlib.h>\n\nint main() {\n    // Dynamic memory allocation\n    int *ptr = (int*)malloc(sizeof(int) * 10);\n    if (ptr != NULL) {\n        // Use allocated memory\n        free(ptr);  // Free memory\n    }\n    return 0;\n}',
              explanation: 'Dynamic memory allocation and deallocation'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'memory-allocation',
          config: { algorithms: ['first-fit', 'best-fit', 'worst-fit'] }
        },
        order: 5,
        createdBy: adminUser._id,
        tags: ['memory', 'paging', 'virtual-memory']
      },
      {
        title: 'File Systems',
        slug: 'file-systems',
        description: 'Understanding file organization, directory structures, and file allocation methods.',
        category: 'file-systems',
        difficulty: 'intermediate',
        estimatedTime: 80,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'File systems organize and manage files on storage devices efficiently.',
            concepts: [
              {
                title: 'File Allocation Methods',
                explanation: 'Different methods to allocate disk space: contiguous, linked, and indexed allocation.',
                examples: ['Contiguous: fast access', 'Linked: no external fragmentation', 'Indexed: random access'],
                diagrams: []
              },
              {
                title: 'Directory Structure',
                explanation: 'Hierarchical organization of files and directories.',
                examples: ['Single-level', 'Two-level', 'Tree structure'],
                diagrams: []
              },
              {
                title: 'File System Interface',
                explanation: 'System calls for file operations like create, read, write, delete.',
                examples: ['open()', 'read()', 'write()', 'close()'],
                diagrams: []
              }
            ],
            summary: 'File systems provide organized storage and retrieval of data on persistent storage.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("example.txt", "w");\n    if (fp != NULL) {\n        fprintf(fp, "Hello, File System!\\n");\n        fclose(fp);\n    }\n    return 0;\n}',
              explanation: 'Basic file operations in C'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'file-allocation',
          config: { methods: ['contiguous', 'linked', 'indexed'] }
        },
        order: 6,
        createdBy: adminUser._id,
        tags: ['files', 'directories', 'storage']
      }
    ];

    const createdModules = await Module.insertMany(modules);
    console.log(`📚 Created ${createdModules.length} modules`);

    // Create quizzes for each module
    const quizzes = [
      {
        title: 'Introduction to Operating Systems Quiz',
        description: 'Test your knowledge of basic OS concepts',
        module: createdModules[0]._id,
        questions: [
          {
            question: 'What is the primary function of an operating system?',
            type: 'multiple-choice',
            options: [
              { text: 'To manage hardware and software resources', isCorrect: true },
              { text: 'To create applications', isCorrect: false },
              { text: 'To provide internet connectivity', isCorrect: false },
              { text: 'To store data permanently', isCorrect: false }
            ],
            explanation: 'The primary function of an OS is to manage computer hardware and software resources and provide services to applications.',
            difficulty: 'easy',
            points: 1,
            hints: ['Think about what OS does between user and hardware'],
            tags: ['basics', 'functions']
          },
          {
            question: 'Which of the following is NOT a type of operating system?',
            type: 'multiple-choice',
            options: [
              { text: 'Batch Operating System', isCorrect: false },
              { text: 'Real-time Operating System', isCorrect: false },
              { text: 'Distributed Operating System', isCorrect: false },
              { text: 'Application Operating System', isCorrect: true }
            ],
            explanation: 'Application Operating System is not a recognized type of OS. The main types include batch, time-sharing, real-time, and distributed systems.',
            difficulty: 'medium',
            points: 2,
            hints: ['Consider the standard classifications of OS types'],
            tags: ['types', 'classification']
          }
        ],
        timeLimit: 15,
        passingScore: 70,
        difficulty: 'beginner'
      },
      {
        title: 'Process Management Quiz',
        description: 'Test your understanding of processes and their management',
        module: createdModules[1]._id,
        questions: [
          {
            question: 'What information is stored in a Process Control Block (PCB)?',
            type: 'multiple-choice',
            options: [
              { text: 'Process ID, state, and program counter', isCorrect: true },
              { text: 'Only the process ID', isCorrect: false },
              { text: 'Only the program code', isCorrect: false },
              { text: 'System hardware information', isCorrect: false }
            ],
            explanation: 'PCB stores various information about a process including process ID, current state, program counter, CPU registers, memory management information, and I/O status.',
            difficulty: 'medium',
            points: 2,
            hints: ['Think about what OS needs to know about each process'],
            tags: ['PCB', 'process-info']
          },
          {
            question: 'In which state is a process when it is waiting for I/O completion?',
            type: 'multiple-choice',
            options: [
              { text: 'Running', isCorrect: false },
              { text: 'Ready', isCorrect: false },
              { text: 'Waiting/Blocked', isCorrect: true },
              { text: 'Terminated', isCorrect: false }
            ],
            explanation: 'When a process is waiting for I/O completion, it is in the waiting or blocked state until the I/O operation completes.',
            difficulty: 'easy',
            points: 1,
            hints: ['Consider what happens when process cannot proceed'],
            tags: ['states', 'io-wait']
          }
        ],
        timeLimit: 20,
        passingScore: 70,
        difficulty: 'beginner'
      },
      {
        title: 'CPU Scheduling Quiz',
        description: 'Test your knowledge of various CPU scheduling algorithms',
        module: createdModules[2]._id,
        questions: [
          {
            question: 'Which scheduling algorithm can cause the convoy effect?',
            type: 'multiple-choice',
            options: [
              { text: 'Round Robin', isCorrect: false },
              { text: 'Shortest Job First', isCorrect: false },
              { text: 'First Come First Served', isCorrect: true },
              { text: 'Priority Scheduling', isCorrect: false }
            ],
            explanation: 'FCFS can cause convoy effect when short processes wait behind long processes, leading to poor average waiting time.',
            difficulty: 'medium',
            points: 2,
            hints: ['Think about what happens when long processes execute first'],
            tags: ['FCFS', 'convoy-effect']
          },
          {
            question: 'What is the time complexity of SJF scheduling in terms of average waiting time?',
            type: 'multiple-choice',
            options: [
              { text: 'It gives maximum average waiting time', isCorrect: false },
              { text: 'It gives minimum average waiting time', isCorrect: true },
              { text: 'It gives random average waiting time', isCorrect: false },
              { text: 'Time complexity is not related to waiting time', isCorrect: false }
            ],
            explanation: 'SJF scheduling algorithm gives the minimum average waiting time for a given set of processes.',
            difficulty: 'hard',
            points: 3,
            hints: ['Consider the mathematical proof of SJF optimality'],
            tags: ['SJF', 'optimal', 'waiting-time']
          }
        ],
        timeLimit: 25,
        passingScore: 70,
        difficulty: 'intermediate'
      }
    ];

    // Add more quizzes for remaining modules
    for (let i = 3; i < createdModules.length; i++) {
      quizzes.push({
        title: `${createdModules[i].title} Quiz`,
        description: `Test your understanding of ${createdModules[i].title.toLowerCase()}`,
        module: createdModules[i]._id,
        questions: [
          {
            question: `What is a key concept in ${createdModules[i].title}?`,
            type: 'multiple-choice',
            options: [
              { text: 'Concept A', isCorrect: true },
              { text: 'Concept B', isCorrect: false },
              { text: 'Concept C', isCorrect: false },
              { text: 'Concept D', isCorrect: false }
            ],
            explanation: `This tests basic understanding of ${createdModules[i].title}.`,
            difficulty: 'medium',
            points: 2,
            hints: ['Review the module content'],
            tags: [createdModules[i].category]
          }
        ],
        timeLimit: 20,
        passingScore: 70,
        difficulty: createdModules[i].difficulty
      });
    }

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`🧩 Created ${createdQuizzes.length} quizzes`);

    console.log('✅ Database seeded successfully!');
    console.log(`
📊 Summary:
- Admin User: admin@oslp.com (password: Admin123!)
- Modules: ${createdModules.length}
- Quizzes: ${createdQuizzes.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the seed function
if (require.main === module) {
  seedData();
}

module.exports = seedData;

// .env (Environment Variables Template)
// Copy this to .env file and fill in your values
/*
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/os-learning-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:3000

# Optional: For production
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/os-learning-platform
# JWT_SECRET=generate-a-secure-random-string-for-production
*/

// README.md
/*
# OS Learning Platform - Backend

A comprehensive backend for an AI-powered Operating Systems learning platform with interactive features, adaptive quizzes, and intelligent simulators.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (student, instructor, admin)
- Secure password hashing with bcrypt
- Google OAuth integration ready

### 📚 Learning Modules
- Structured OS curriculum covering:
  - Process Management
  - CPU Scheduling Algorithms
  - Deadlock & Synchronization
  - Memory Management
  - File Systems
  - I/O Management
- Rich content with theory, code examples, and resources
- Prerequisite tracking and sequential learning paths

### 🧩 Adaptive Quizzes
- Multiple question types (MCQ, True/False, Fill-in-blanks)
- Adaptive difficulty based on performance
- Detailed explanations and hints
- Progress tracking and analytics
- Automatic scoring and feedback

### 🤖 AI-Powered Chatbot
- Context-aware OS tutor
- Natural language explanations
- Code debugging assistance
- Personalized learning suggestions
- Integration with OpenAI GPT models

### 🎯 Interactive Simulators
- **CPU Scheduling**: FCFS, SJF, Round Robin, Priority
- **Memory Allocation**: First-fit, Best-fit, Worst-fit
- **Page Replacement**: FIFO, LRU, Optimal
- Real-time visualization data
- Step-by-step execution tracking

### 📊 Learning Analytics
- Comprehensive progress tracking
- Performance insights and weak area identification
- Personalized learning path recommendations
- Achievement system and gamification
- Time tracking and study analytics

### 🔄 Personalized Learning Paths
- AI-driven module recommendations
- Adaptive difficulty adjustment
- Learning style preferences
- Study plan generation
- Performance-based content suggestion

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **AI Integration**: OpenAI GPT API
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Joi and express-validator
- **Logging**: Morgan
- **Development**: Nodemon for hot reloading

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- OpenAI API key (optional, has fallback)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd os-learning-backend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```bash
   # Start MongoDB locally or use MongoDB Atlas
   npm run seed  # Populate with sample data
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/me           - Get current user
```

### Module Endpoints
```
GET    /api/modules                - Get all modules
GET    /api/modules/:slug          - Get specific module
PUT    /api/modules/:id/progress   - Update module progress
```

### Quiz Endpoints
```
GET    /api/quizzes/module/:moduleId    - Get quiz for module
POST   /api/quizzes/:quizId/start       - Start quiz attempt
PUT    /api/quizzes/attempt/:id/answer  - Submit quiz answer
PUT    /api/quizzes/attempt/:id/submit  - Submit complete quiz
```

### Simulator Endpoints
```
POST   /api/simulators/cpu-scheduling      - CPU scheduling simulation
POST   /api/simulators/memory-allocation   - Memory allocation simulation
POST   /api/simulators/page-replacement    - Page replacement simulation
```

### Chatbot Endpoints
```
POST   /api/chatbot/chat                 - Chat with AI tutor
GET    /api/chatbot/history/:sessionId   - Get chat history
DELETE /api/chatbot/history/:sessionId   - Clear chat history
```

### Progress & Analytics
```
GET    /api/progress/dashboard           - User dashboard data
GET    /api/progress/module/:moduleId    - Module-specific progress
PUT    /api/progress/insights/:moduleId  - Update learning insights
```

### Learning Path
```
GET    /api/learning-path/recommend      - Get personalized recommendations
PUT    /api/learning-path/preferences    - Update learning preferences
```

## Database Schema

### Core Models
- **User**: Authentication, preferences, stats, achievements
- **Module**: Learning content, simulators, prerequisites
- **Quiz**: Questions, options, explanations, metadata
- **QuizAttempt**: User quiz submissions and scores
- **Progress**: Module completion tracking
- **ChatHistory**: AI tutor conversation logs

## Simulator Algorithms

### CPU Scheduling
- **FCFS**: First Come First Served with convoy effect analysis
- **SJF**: Shortest Job First with optimal waiting time
- **Round Robin**: Time quantum-based preemptive scheduling
- **Priority**: Priority-based scheduling with aging

### Memory Management
- **First Fit**: First available block allocation
- **Best Fit**: Smallest suitable block allocation
- **Worst Fit**: Largest available block allocation
- Fragmentation analysis and memory utilization metrics

### Page Replacement
- **FIFO**: First In First Out replacement
- **LRU**: Least Recently Used with access tracking
- **Optimal**: Belady's optimal algorithm
- Hit/miss ratio calculation and performance comparison

## AI Features

### Chatbot Capabilities
- Context-aware responses based on current module
- Explanation of OS concepts in simple terms
- Code debugging and explanation
- Adaptive responses based on user level
- Fallback responses when AI service unavailable

### Learning Path Intelligence
- Performance analysis across modules
- Weak area identification
- Personalized study plans
- Difficulty progression recommendations
- Time-based learning optimization

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication with expiration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Environment-based configuration

## Development

### Project Structure
```
├── models/           # Mongoose schemas
├── routes/           # Express route handlers  
├── middleware/       # Custom middleware
├── scripts/          # Database seeding
├── server.js         # Main application entry
└── package.json      # Dependencies and scripts
```

### Available Scripts
```bash
npm start        # Production server
npm run dev      # Development with nodemon
npm run seed     # Seed database with sample data
```

### Environment Variables
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/os-learning-platform
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins
5. Configure rate limiting for production load
6. Set up logging and monitoring

### Docker Support (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Testing

The backend includes comprehensive error handling and validation. For testing:

1. **API Testing**: Use Postman or similar tools
2. **Database Testing**: Run seed script to populate test data
3. **Integration Testing**: Test with frontend application

## Performance Optimization

- Database indexing for frequently queried fields
- Efficient aggregation pipelines for analytics
- Response caching for static content
- Connection pooling for database
- Compression middleware for responses

## Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app API support
- [ ] Video content integration
- [ ] Peer learning features
- [ ] Advanced AI tutoring capabilities
- [ ] Integration with external learning platforms

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**Happy Learning! 🚀**
*/