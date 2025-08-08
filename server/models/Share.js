const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  // Content being shared
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Course', 'Presentation', 'Quiz', 'Tutorial']
  },
  
  // Who is sharing the content
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tenant the content belongs to
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  
  // Sharing settings
  shareType: {
    type: String,
    required: true,
    enum: ['link', 'email', 'user', 'group', 'public'],
    default: 'link'
  },
  
  // Share recipients (for email, user, and group shares)
  recipients: [{
    type: String
  }],
  
  // Share permissions
  permissions: {
    canView: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canComment: {
      type: Boolean,
      default: true
    },
    canShare: {
      type: Boolean,
      default: false
    },
    canDownload: {
      type: Boolean,
      default: false
    }
  },
  
  // Share settings
  settings: {
    requireLogin: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      default: ''
    },
    expirationDate: {
      type: Date,
      default: null
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    showAnalytics: {
      type: Boolean,
      default: false
    }
  },
  
  // Share statistics
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: null
    }
  },
  
  // Share status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Share token (for link shares)
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Comments on shared content
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
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
ShareSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate share token if not provided
ShareSchema.pre('save', function(next) {
  if (this.shareType === 'link' && !this.shareToken) {
    this.shareToken = generateShareToken();
  }
  next();
});

// Method to check if share is expired
ShareSchema.methods.isExpired = function() {
  if (!this.settings.expirationDate) {
    return false;
  }
  return new Date() > this.settings.expirationDate;
};

// Method to check if user has permission
ShareSchema.methods.hasPermission = function(permission, userId = null) {
  // If share is expired, no permissions
  if (this.isExpired()) {
    return false;
  }
  
  // Check if share is active
  if (!this.isActive) {
    return false;
  }
  
  // Check specific permission
  return this.permissions[permission] || false;
};

// Method to add a comment
ShareSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text: text
  });
  this.statistics.comments += 1;
  return this.save();
};

// Method to add a reply to a comment
ShareSchema.methods.addReply = function(commentIndex, userId, text) {
  if (this.comments[commentIndex]) {
    this.comments[commentIndex].replies.push({
      user: userId,
      text: text
    });
    return this.save();
  }
  throw new Error('Comment not found');
};

// Method to record a view
ShareSchema.methods.recordView = function(userId = null) {
  this.statistics.views += 1;
  this.statistics.lastAccessed = new Date();
  
  // If user ID is provided, check if it's a unique view
  // In a real implementation, you would track unique viewers separately
  // For simplicity, we'll just increment unique views for now
  if (userId) {
    this.statistics.uniqueViews += 1;
  }
  
  return this.save();
};

// Method to record a download
ShareSchema.methods.recordDownload = function() {
  this.statistics.downloads += 1;
  return this.save();
};

// Static method to find active share by token
ShareSchema.statics.findByToken = function(token) {
  return this.findOne({ shareToken: token, isActive: true });
};

// Helper function to generate share token
function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

module.exports = mongoose.model('Share', ShareSchema);