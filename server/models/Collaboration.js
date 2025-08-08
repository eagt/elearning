const mongoose = require('mongoose');

const CollaborationSchema = new mongoose.Schema({
  // Content being collaborated on
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
  
  // Tenant the content belongs to
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  
  // Collaboration owner
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Collaboration members
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['editor', 'reviewer', 'commenter'],
      default: 'commenter'
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: false
      },
      canComment: {
        type: Boolean,
        default: true
      },
      canInvite: {
        type: Boolean,
        default: false
      },
      canDelete: {
        type: Boolean,
        default: false
      }
    },
    status: {
      type: String,
      required: true,
      enum: ['invited', 'accepted', 'declined'],
      default: 'invited'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }],
  
  // Collaboration settings
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoAccept: {
      type: Boolean,
      default: false
    },
    notifyOnChanges: {
      type: Boolean,
      default: true
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    allowVersionHistory: {
      type: Boolean,
      default: true
    }
  },
  
  // Collaboration status
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  
  // Collaboration timeline
  timeline: [{
    action: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // Version history
  versions: [{
    versionNumber: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: String,
      required: true
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Comments and feedback
  comments: [{
    userId: {
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
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    position: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    replies: [{
      userId: {
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
  
  // Tasks and assignments
  tasks: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo'
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
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
CollaborationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add a member to the collaboration
CollaborationSchema.methods.addMember = function(userId, role = 'commenter', permissions = {}) {
  // Check if user is already a member
  const existingMember = this.members.find(member => member.userId.toString() === userId.toString());
  
  if (existingMember) {
    // Update existing member
    existingMember.role = role;
    existingMember.permissions = { ...existingMember.permissions, ...permissions };
    existingMember.status = 'invited';
    existingMember.invitedAt = Date.now();
    existingMember.respondedAt = null;
  } else {
    // Add new member
    const defaultPermissions = {
      canEdit: role === 'editor',
      canComment: true,
      canInvite: role === 'editor',
      canDelete: false
    };
    
    this.members.push({
      userId,
      role,
      permissions: { ...defaultPermissions, ...permissions },
      status: 'invited',
      invitedAt: Date.now()
    });
  }
  
  // Add to timeline
  this.timeline.push({
    action: 'member_invited',
    userId: this.ownerId,
    details: { invitedUserId: userId, role }
  });
  
  return this.save();
};

// Method to accept an invitation
CollaborationSchema.methods.acceptInvitation = function(userId) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  
  if (member && member.status === 'invited') {
    member.status = 'accepted';
    member.respondedAt = Date.now();
    
    // Add to timeline
    this.timeline.push({
      action: 'invitation_accepted',
      userId,
      details: {}
    });
    
    return this.save();
  }
  
  throw new Error('Invitation not found or already responded');
};

// Method to decline an invitation
CollaborationSchema.methods.declineInvitation = function(userId) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  
  if (member && member.status === 'invited') {
    member.status = 'declined';
    member.respondedAt = Date.now();
    
    // Add to timeline
    this.timeline.push({
      action: 'invitation_declined',
      userId,
      details: {}
    });
    
    return this.save();
  }
  
  throw new Error('Invitation not found or already responded');
};

// Method to remove a member
CollaborationSchema.methods.removeMember = function(userId, removedByUserId) {
  const memberIndex = this.members.findIndex(m => m.userId.toString() === userId.toString());
  
  if (memberIndex !== -1) {
    this.members.splice(memberIndex, 1);
    
    // Add to timeline
    this.timeline.push({
      action: 'member_removed',
      userId: removedByUserId,
      details: { removedUserId: userId }
    });
    
    return this.save();
  }
  
  throw new Error('Member not found');
};

// Method to add a comment
CollaborationSchema.methods.addComment = function(userId, text, position = null) {
  this.comments.push({
    userId,
    text,
    position
  });
  
  // Add to timeline
  this.timeline.push({
    action: 'comment_added',
    userId,
    details: { commentText: text.substring(0, 100) }
  });
  
  return this.save();
};

// Method to add a reply to a comment
CollaborationSchema.methods.addReply = function(commentIndex, userId, text) {
  if (this.comments[commentIndex]) {
    this.comments[commentIndex].replies.push({
      userId,
      text
    });
    
    // Add to timeline
    this.timeline.push({
      action: 'reply_added',
      userId,
      details: { commentIndex, replyText: text.substring(0, 100) }
    });
    
    return this.save();
  }
  
  throw new Error('Comment not found');
};

// Method to resolve a comment
CollaborationSchema.methods.resolveComment = function(commentIndex, userId) {
  if (this.comments[commentIndex]) {
    this.comments[commentIndex].resolved = true;
    this.comments[commentIndex].resolvedBy = userId;
    this.comments[commentIndex].resolvedAt = Date.now();
    
    // Add to timeline
    this.timeline.push({
      action: 'comment_resolved',
      userId,
      details: { commentIndex }
    });
    
    return this.save();
  }
  
  throw new Error('Comment not found');
};

// Method to add a task
CollaborationSchema.methods.addTask = function(title, description, assignedTo, assignedBy, priority = 'medium', dueDate = null) {
  this.tasks.push({
    title,
    description,
    assignedTo,
    assignedBy,
    priority,
    dueDate
  });
  
  // Add to timeline
  this.timeline.push({
    action: 'task_added',
    userId: assignedBy,
    details: { 
      taskTitle: title, 
      assignedTo, 
      priority 
    }
  });
  
  return this.save();
};

// Method to update a task
CollaborationSchema.methods.updateTask = function(taskIndex, updates, updatedBy) {
  if (this.tasks[taskIndex]) {
    const oldStatus = this.tasks[taskIndex].status;
    
    // Update task
    Object.keys(updates).forEach(key => {
      this.tasks[taskIndex][key] = updates[key];
    });
    
    // If status changed to completed, set completedAt
    if (updates.status === 'completed' && oldStatus !== 'completed') {
      this.tasks[taskIndex].completedAt = Date.now();
    }
    
    // Add to timeline
    this.timeline.push({
      action: 'task_updated',
      userId: updatedBy,
      details: { 
        taskIndex, 
        updates,
        oldStatus
      }
    });
    
    return this.save();
  }
  
  throw new Error('Task not found');
};

// Method to create a new version
CollaborationSchema.methods.createVersion = function(userId, changes, snapshot) {
  // Get the latest version number
  const latestVersion = this.versions.length > 0 
    ? Math.max(...this.versions.map(v => v.versionNumber))
    : 0;
  
  // Mark all previous versions as not current
  this.versions.forEach(version => {
    version.isCurrent = false;
  });
  
  // Add new version
  this.versions.push({
    versionNumber: latestVersion + 1,
    userId,
    changes,
    snapshot,
    isCurrent: true
  });
  
  // Add to timeline
  this.timeline.push({
    action: 'version_created',
    userId,
    details: { 
      versionNumber: latestVersion + 1,
      changes: changes.substring(0, 100)
    }
  });
  
  return this.save();
};

// Method to check if user is a member
CollaborationSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && 
    member.status === 'accepted'
  );
};

// Method to check if user is the owner
CollaborationSchema.methods.isOwner = function(userId) {
  return this.ownerId.toString() === userId.toString();
};

// Method to check if user has permission
CollaborationSchema.methods.hasPermission = function(userId, permission) {
  // Owner has all permissions
  if (this.isOwner(userId)) {
    return true;
  }
  
  // Check if user is an active member
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString() && 
    m.status === 'accepted'
  );
  
  if (member) {
    return member.permissions[permission] || false;
  }
  
  return false;
};

// Static method to find collaborations by user
CollaborationSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { ownerId: userId },
      { 'members.userId': userId, 'members.status': 'accepted' }
    ]
  }).populate('ownerId', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email')
    .populate('contentId');
};

module.exports = mongoose.model('Collaboration', CollaborationSchema);