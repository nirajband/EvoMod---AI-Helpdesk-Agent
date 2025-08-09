const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technical Issue',
      'Account Problem',
      'Feature Request',
      'Bug Report',
      'General Inquiry',
      'Billing',
      'Security',
      'Performance',
      'Integration',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  aiCategory: {
    type: String,
    trim: true
  },
  aiPriority: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  aiSummary: {
    type: String,
    trim: true,
    maxlength: [1000, 'AI summary cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  responseTime: {
    type: Number // in minutes
  },
  resolutionTime: {
    type: Number // in minutes
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, priority: 1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ createdAt: -1 });

// Generate ticket number before saving
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ 
      ticketNumber: new RegExp(`^TK-${year}-`) 
    });
    this.ticketNumber = `TK-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Update response and resolution times
ticketSchema.pre('save', function(next) {
  const now = new Date();
  
  // Calculate response time when first assigned or commented by moderator/admin
  if (this.isModified('assignedTo') && this.assignedTo && !this.responseTime) {
    this.responseTime = Math.round((now - this.createdAt) / (1000 * 60)); // minutes
  }
  
  // Calculate resolution time when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = now;
    this.resolutionTime = Math.round((now - this.createdAt) / (1000 * 60)); // minutes
  }
  
  // Set closed date when status changes to closed
  if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
    this.closedAt = now;
  }
  
  next();
});

// Instance methods
ticketSchema.methods.assignTo = function(moderatorId, assignedBy) {
  this.assignedTo = moderatorId;
  this.assignedAt = new Date();
  this.assignedBy = assignedBy;
  this.status = 'in-progress';
  return this.save();
};

ticketSchema.methods.addComment = function(userId, message, isInternal = false) {
  this.comments.push({
    user: userId,
    message: message.trim(),
    isInternal,
    createdAt: new Date()
  });
  return this.save();
};

ticketSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

ticketSchema.methods.addSatisfactionRating = function(rating, feedback) {
  this.satisfaction = {
    rating,
    feedback: feedback ? feedback.trim() : '',
    submittedAt: new Date()
  };
  return this.save();
};

// Static methods
ticketSchema.statics.getStats = async function(userId, role) {
  const matchQuery = role === 'user' ? { user: userId } : {};
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0
  };

  stats.forEach(stat => {
    result.totalTickets += stat.count;
    switch (stat._id) {
      case 'open':
        result.openTickets = stat.count;
        break;
      case 'in-progress':
        result.inProgressTickets = stat.count;
        break;
      case 'resolved':
        result.resolvedTickets = stat.count;
        break;
      case 'closed':
        result.closedTickets = stat.count;
        break;
    }
  });

  // For backwards compatibility
  result.pendingTickets = result.openTickets + result.inProgressTickets;

  return result;
};

ticketSchema.statics.getRecentTickets = function(userId, role, limit = 5) {
  const query = role === 'user' ? { user: userId } : {};
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

ticketSchema.statics.getAssignedTickets = function(moderatorId) {
  return this.find({ assignedTo: moderatorId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

// Transform output
ticketSchema.methods.toJSON = function() {
  const ticket = this.toObject();
  
  // Filter comments for non-internal users
  if (ticket.comments) {
    ticket.comments = ticket.comments.filter(comment => !comment.isInternal);
  }
  
  return ticket;
};

module.exports = mongoose.model('Ticket', ticketSchema);