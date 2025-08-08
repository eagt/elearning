const mongoose = require('mongoose');

const TutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: 'default-tutorial-thumbnail.jpg'
  },
  screenshots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screenshot'
  }],
  steps: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    screenshot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screenshot'
    },
    order: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 0
    }
  }],
  tags: [String],
  category: {
    type: String,
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number,
    default: 5
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
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
TutorialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total estimated time based on steps
TutorialSchema.methods.calculateTotalTime = function() {
  let totalTime = 0;
  if (this.steps && this.steps.length > 0) {
    this.steps.forEach(step => {
      totalTime += step.duration || 0;
    });
  }
  return totalTime || this.estimatedTime;
};

module.exports = mongoose.model('Tutorial', TutorialSchema);