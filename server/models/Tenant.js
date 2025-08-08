const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tenant name'],
    trim: true,
    maxlength: [100, 'Tenant name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a tenant slug'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  logo: {
    type: String,
    default: 'default-logo.png'
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  contactEmail: {
    type: String,
    required: [true, 'Please add a contact email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: {
    type: String,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  address: {
    street: {
      type: String,
      maxlength: [100, 'Street address cannot be more than 100 characters']
    },
    city: {
      type: String,
      maxlength: [50, 'City cannot be more than 50 characters']
    },
    state: {
      type: String,
      maxlength: [50, 'State cannot be more than 50 characters']
    },
    zipCode: {
      type: String,
      maxlength: [20, 'Zip code cannot be more than 20 characters']
    },
    country: {
      type: String,
      maxlength: [50, 'Country cannot be more than 50 characters']
    }
  },
  settings: {
    allowRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    },
    defaultUserRole: {
      type: String,
      enum: ['creator', 'learner'],
      default: 'learner'
    },
    maxUsers: {
      type: Number,
      default: 100
    },
    maxStorage: {
      type: Number,
      default: 5000 // in MB
    },
    customBranding: {
      primaryColor: {
        type: String,
        default: '#1A237E'
      },
      secondaryColor: {
        type: String,
        default: '#00ACC1'
      },
      accentColor: {
        type: String,
        default: '#FF6E40'
      },
      logo: {
        type: String,
        default: 'default-logo.png'
      },
      favicon: {
        type: String,
        default: 'favicon.ico'
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      default: 'active'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete users, courses, presentations, quizzes, and screenshots when a tenant is deleted
TenantSchema.pre('remove', async function(next) {
  await this.model('User').deleteMany({ tenantId: this._id });
  await this.model('Course').deleteMany({ tenantId: this._id });
  await this.model('Presentation').deleteMany({ tenantId: this._id });
  await this.model('Quiz').deleteMany({ tenantId: this._id });
  await this.model('Screenshot').deleteMany({ tenantId: this._id });
  next();
});

// Virtual for users count
TenantSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'tenantId',
  justOne: false,
  count: true
});

// Virtual for courses count
TenantSchema.virtual('courseCount', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'tenantId',
  justOne: false,
  count: true
});

// Virtual for active subscription status
TenantSchema.virtual('isSubscriptionActive').get(function() {
  if (!this.subscription.endDate) return true;
  return new Date() < this.subscription.endDate;
});

module.exports = mongoose.model('Tenant', TenantSchema);