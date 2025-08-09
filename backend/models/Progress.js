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
