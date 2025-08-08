const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: 'default-quiz-thumbnail.jpg'
  },
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  tags: [{
    type: String
  }],
  questions: [{
    type: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'drag-drop', 'matching', 'essay']
    },
    question: {
      type: String,
      required: true
    },
    options: [{
      text: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    correctAnswer: {
      type: String,
      default: ''
    },
    explanation: {
      type: String,
      default: ''
    },
    points: {
      type: Number,
      default: 1
    },
    order: {
      type: Number,
      default: 0
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'video', 'audio']
      },
      url: {
        type: String,
        required: true
      },
      caption: {
        type: String,
        default: ''
      }
    }]
  }],
  settings: {
    timeLimit: {
      type: Number,
      default: 0 // 0 means no time limit
    },
    allowRetakes: {
      type: Boolean,
      default: true
    },
    maxRetakes: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    showResults: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showExplanation: {
      type: Boolean,
      default: true
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    passPercentage: {
      type: Number,
      default: 70
    },
    allowPause: {
      type: Boolean,
      default: true
    },
    randomizeQuestionOrder: {
      type: Boolean,
      default: false
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  estimatedTime: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  prerequisites: [{
    type: String
  }],
  learningObjectives: [{
    type: String
  }],
  targetAudience: [{
    type: String
  }],
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
  presentations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Presentation'
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
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

// Update the updatedAt field on save
QuizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);