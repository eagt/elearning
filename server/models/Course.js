const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
    maxlength: [1000, 'Course description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  thumbnail: {
    type: String,
    default: 'default-course-thumbnail.jpg'
  },
  category: {
    type: String,
    required: [true, 'Please add a course category'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
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
  presentations: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Presentation'
  }],
  quizzes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz'
  }],
  tutorials: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Tutorial'
  }],
  prerequisites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
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

// Virtual for course's full URL
CourseSchema.virtual('url').get(function() {
  return `/courses/${this._id}`;
});

// Virtual for course's duration in hours
CourseSchema.virtual('durationInHours').get(function() {
  return (this.duration / 60).toFixed(1);
});

// Virtual for course's formatted price
CourseSchema.virtual('formattedPrice').get(function() {
  if (this.isFree) {
    return 'Free';
  }
  return `${this.currency} ${this.price.toFixed(2)}`;
});

// Virtual for course's progress for a user
CourseSchema.virtual('progress', {
  ref: 'UserProgress',
  localField: '_id',
  foreignField: 'courseId',
  justOne: true
});

// Virtual for course's reviews
CourseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'courseId',
  justOne: false
});

// Cascade delete presentations, quizzes, and tutorials when a course is deleted
CourseSchema.pre('remove', async function(next) {
  await this.model('Presentation').deleteMany({ _id: { $in: this.presentations } });
  await this.model('Quiz').deleteMany({ _id: { $in: this.quizzes } });
  await this.model('Tutorial').deleteMany({ _id: { $in: this.tutorials } });
  await this.model('UserProgress').deleteMany({ courseId: this._id });
  await this.model('Review').deleteMany({ courseId: this._id });
  next();
});

// Update updatedAt field on save
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', CourseSchema);