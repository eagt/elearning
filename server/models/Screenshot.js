const mongoose = require('mongoose');

const ScreenshotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  annotations: [{
    type: {
      type: String,
      enum: ['rectangle', 'circle', 'arrow', 'text', 'highlight'],
      required: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#FF0000'
    },
    fontSize: {
      type: Number,
      default: 16
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    order: {
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
    default: 1
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
  tutorials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutorial'
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
ScreenshotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Screenshot', ScreenshotSchema);