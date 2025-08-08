const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  presentationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Presentation'
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  tutorialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutorial'
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    enum: ['course', 'presentation', 'quiz', 'tutorial'],
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  quizAttempts: [{
    attemptDate: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    passed: {
      type: Boolean,
      default: false
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: {
        type: Boolean,
        default: false
      }
    }]
  }],
  slidesViewed: [{
    slideId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  }],
  stepsCompleted: [{
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  }],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const SystemMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  newUsers: {
    type: Number,
    default: 0
  },
  contentViews: {
    type: Number,
    default: 0
  },
  contentCompletions: {
    type: Number,
    default: 0
  },
  courseCompletions: {
    type: Number,
    default: 0
  },
  presentationCompletions: {
    type: Number,
    default: 0
  },
  quizCompletions: {
    type: Number,
    default: 0
  },
  tutorialCompletions: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ContentEngagementSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    enum: ['course', 'presentation', 'quiz', 'tutorial'],
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number,
    default: 0
  },
  averageProgress: {
    type: Number,
    default: 0
  },
  dropOffPoints: [{
    point: String,
    count: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
UserProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

ContentEngagementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
UserProgressSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  this.lastAccessed = Date.now();
  
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = Date.now();
  } else if (this.progress > 0 && this.status === 'not-started') {
    this.status = 'in-progress';
  }
  
  return this.save();
};

UserProgressSchema.methods.addTimeSpent = function(time) {
  this.timeSpent += time;
  this.lastAccessed = Date.now();
  return this.save();
};

UserProgressSchema.methods.recordSlideView = function(slideId, timeSpent = 0) {
  const existingSlide = this.slidesViewed.find(s => s.slideId.toString() === slideId.toString());
  
  if (existingSlide) {
    existingSlide.timeSpent += timeSpent;
  } else {
    this.slidesViewed.push({
      slideId,
      timeSpent
    });
  }
  
  this.lastAccessed = Date.now();
  return this.save();
};

UserProgressSchema.methods.recordStepCompletion = function(stepId, timeSpent = 0) {
  const existingStep = this.stepsCompleted.find(s => s.stepId.toString() === stepId.toString());
  
  if (!existingStep) {
    this.stepsCompleted.push({
      stepId,
      timeSpent
    });
  } else {
    existingStep.timeSpent += timeSpent;
  }
  
  this.lastAccessed = Date.now();
  return this.save();
};

UserProgressSchema.methods.addQuizAttempt = function(answers, score, passed) {
  this.quizAttempts.push({
    attemptDate: Date.now(),
    score,
    passed,
    answers
  });
  
  this.lastAccessed = Date.now();
  
  if (passed && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = Date.now();
    this.progress = 100;
  }
  
  return this.save();
};

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
const SystemMetrics = mongoose.model('SystemMetrics', SystemMetricsSchema);
const ContentEngagement = mongoose.model('ContentEngagement', ContentEngagementSchema);

module.exports = {
  UserProgress,
  SystemMetrics,
  ContentEngagement
};