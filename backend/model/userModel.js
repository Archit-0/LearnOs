
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
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
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  progress: {
    completedModules: [{
      moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
      completedAt: { type: Date, default: Date.now },
      score: Number
    }],
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  quizHistory: [{
    module: String,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number, // in seconds
    difficulty: String,
    completedAt: { type: Date, default: Date.now },
    answers: [{
      questionId: String,
      selectedOption: Number,
      isCorrect: Boolean,
      timeSpent: Number
    }]
  }],
  preferences: {
    voiceEnabled: { type: Boolean, default: false },
    ttsEnabled: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  learningPath: {
    recommendedModules: [String],
    weakAreas: [String],
    strengths: [String],
    nextModule: String,
    updatedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);