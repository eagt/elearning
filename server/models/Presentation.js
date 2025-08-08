const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a slide title'],
    trim: true,
    maxlength: [100, 'Slide title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add slide content'],
    trim: true,
    maxlength: [5000, 'Slide content cannot be more than 5000 characters']
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  textColor: {
    type: String,
    default: '#212121'
  },
  layout: {
    type: String,
    enum: ['title', 'content', 'two-column', 'image-left', 'image-right', 'full-image'],
    default: 'content'
  },
  order: {
    type: Number,
    required: [true, 'Please add slide order']
  },
  hotspots: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Hotspot'
  }],
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right', 'center'],
      default: 'center'
    },
    size: {
      width: {
        type: Number,
        default: 100
      },
      height: {
        type: Number,
        default: 100
      }
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Slide notes cannot be more than 1000 characters']
  },
  animation: {
    type: String,
    enum: ['none', 'fade', 'slide', 'zoom', 'flip'],
    default: 'fade'
  },
  transition: {
    type: String,
    enum: ['none', 'fade', 'slide', 'zoom', 'flip'],
    default: 'fade'
  },
  duration: {
    type: Number, // in seconds
    default: 0 // 0 means manual advance
  }
}, { _id: false });

const HotspotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a hotspot title'],
    trim: true,
    maxlength: [100, 'Hotspot title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Hotspot description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'link', 'branch', 'media', 'quiz'],
    required: true
  },
  position: {
    x: {
      type: Number,
      required: true,
      min: [0, 'X position cannot be less than 0'],
      max: [100, 'X position cannot be more than 100']
    },
    y: {
      type: Number,
      required: true,
      min: [0, 'Y position cannot be less than 0'],
      max: [100, 'Y position cannot be more than 100']
    }
  },
  size: {
    width: {
      type: Number,
      default: 20
    },
    height: {
      type: Number,
      default: 20
    }
  },
  shape: {
    type: String,
    enum: ['rectangle', 'circle', 'polygon'],
    default: 'rectangle'
  },
  style: {
    backgroundColor: {
      type: String,
      default: 'rgba(0, 172, 193, 0.7)'
    },
    borderColor: {
      type: String,
      default: '#00ACC1'
    },
    borderWidth: {
      type: Number,
      default: 2
    },
    textColor: {
      type: String,
      default: '#FFFFFF'
    },
    icon: {
      type: String,
      default: 'info'
    }
  },
  action: {
    type: {
      type: String,
      enum: ['popup', 'navigate', 'open-link', 'play-media', 'start-quiz'],
      required: true
    },
    target: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    slideId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Slide'
    },
    url: {
      type: String,
      trim: true
    },
    mediaId: {
      type: mongoose.Schema.ObjectId
    },
    quizId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: [true, 'Please add hotspot order']
  }
}, { _id: false });

const BranchingScenarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a scenario name'],
    trim: true,
    maxlength: [100, 'Scenario name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Scenario description cannot be more than 500 characters']
  },
  startSlideId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Slide',
    required: true
  },
  endSlideIds: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Slide'
  }],
  conditions: [{
    slideId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Slide',
      required: true
    },
    hotspotId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Hotspot',
      required: true
    },
    targetSlideId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Slide',
      required: true
    },
    condition: {
      type: String,
      enum: ['always', 'quiz-score', 'user-input', 'time-spent'],
      default: 'always'
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const PresentationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a presentation title'],
    trim: true,
    maxlength: [100, 'Presentation title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a presentation description'],
    trim: true,
    maxlength: [1000, 'Presentation description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  thumbnail: {
    type: String,
    default: 'default-presentation-thumbnail.jpg'
  },
  category: {
    type: String,
    required: [true, 'Please add a presentation category'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  slides: [SlideSchema],
  branchingScenarios: [BranchingScenarioSchema],
  settings: {
    autoAdvance: {
      type: Boolean,
      default: false
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    allowNavigation: {
      type: Boolean,
      default: true
    },
    showSlideNumbers: {
      type: Boolean,
      default: true
    },
    showSlideTitles: {
      type: Boolean,
      default: true
    },
    enableHotspots: {
      type: Boolean,
      default: true
    },
    enableBranching: {
      type: Boolean,
      default: true
    },
    enableQuizzes: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['default', 'dark', 'light', 'minimal'],
      default: 'default'
    },
    navigationStyle: {
      type: String,
      enum: ['dots', 'arrows', 'thumbnails', 'progress'],
      default: 'arrows'
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
  viewCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageCompletionTime: {
    type: Number, // in minutes
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  estimatedTime: {
    type: Number, // in minutes
    required: [true, 'Please add estimated time']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  tenantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  courses: [{
    type: mongoose.Schema.ObjectId,
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for presentation's full URL
PresentationSchema.virtual('url').get(function() {
  return `/presentations/${this._id}`;
});

// Virtual for presentation's slide count
PresentationSchema.virtual('slideCount').get(function() {
  return this.slides.length;
});

// Virtual for presentation's hotspot count
PresentationSchema.virtual('hotspotCount').get(function() {
  let count = 0;
  this.slides.forEach(slide => {
    count += slide.hotspots.length;
  });
  return count;
});

// Virtual for presentation's branching scenario count
PresentationSchema.virtual('branchingScenarioCount').get(function() {
  return this.branchingScenarios.length;
});

// Virtual for presentation's progress for a user
PresentationSchema.virtual('progress', {
  ref: 'UserProgress',
  localField: '_id',
  foreignField: 'presentationId',
  justOne: true
});

// Virtual for presentation's likes
PresentationSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'presentationId',
  justOne: false
});

// Virtual for presentation's reviews
PresentationSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'presentationId',
  justOne: false
});

// Cascade delete user progress, likes, and reviews when a presentation is deleted
PresentationSchema.pre('remove', async function(next) {
  await this.model('UserProgress').deleteMany({ presentationId: this._id });
  await this.model('Like').deleteMany({ presentationId: this._id });
  await this.model('Review').deleteMany({ presentationId: this._id });
  next();
});

// Update updatedAt field on save
PresentationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Presentation', PresentationSchema);