const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  ticketCount: {
    type: Number,
    default: 0
  },
  resolvedTickets: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Get user stats
userSchema.methods.getStats = function() {
  return {
    totalTickets: this.ticketCount,
    resolvedTickets: this.resolvedTickets,
    averageResponseTime: this.averageResponseTime,
    successRate: this.ticketCount > 0 ? (this.resolvedTickets / this.ticketCount * 100).toFixed(1) : 0
  };
};

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method to find moderators by skills
userSchema.statics.findModeratorsBySkills = function(skills) {
  return this.find({
    role: { $in: ['moderator', 'admin'] },
    isActive: true,
    skills: { $in: skills }
  }).select('-password');
};

// Static method to get user statistics
userSchema.statics.getSystemStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        averageTickets: { $avg: '$ticketCount' },
        averageResolved: { $avg: '$resolvedTickets' }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('User', userSchema);