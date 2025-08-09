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
