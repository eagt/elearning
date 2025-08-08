const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    questionType: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'drag-drop', 'matching', 'essay']
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0 // in seconds
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'paused', 'timeout'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  pausedAt: {
    type: Date
  },
  resumedAt: {
    type: Date
  },
  timeRemaining: {
    type: Number,
    default: 0 // in seconds
  },
  questionOrder: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  optionOrders: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    orders: [{
      optionId: {
        type: mongoose.Schema.Types.ObjectId
      },
      order: {
        type: Number
      }
    }]
  }],
  feedback: {
    type: String,
    default: ''
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate percentage and passed status before saving
QuizAttemptSchema.pre('save', function(next) {
  if (this.score > 0 && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }
  
  // We need to fetch the quiz to get the pass percentage
  // This will be handled in the route when completing the quiz
  next();
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);