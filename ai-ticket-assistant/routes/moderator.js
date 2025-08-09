const express = require('express');
const Ticket = require('../models/ticket');
const User = require('../models/User');
const { isModerator } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @desc    Get moderator dashboard stats
// @route   GET /api/moderator/stats
// @access  Private (Moderators/Admins)
router.get('/stats', isModerator, asyncHandler(async (req, res) => {
  // Get assigned tickets stats
  const assignedStats = await Ticket.aggregate([
    {
      $match: {
        assignedTo: req.user._id
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get all tickets stats for admins
  const allStats = req.user.role === 'admin' ? await Ticket.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]) : [];

  // Get recent activity
  const recentTickets = await Ticket.find({
    $or: [
      { assignedTo: req.user._id },
      ...(req.user.role === 'admin' ? [{ assignedTo: { $exists: false } }] : [])
    ]
  })
  .populate('user', 'name email')
  .sort({ updatedAt: -1 })
  .limit(5);

  // Get workload
  const activeTickets = await Ticket.countDocuments({
    assignedTo: req.user._id,
    status: { $in: ['open', 'in-progress'] }
  });

  // Calculate response times
  const responseTimeStats = await Ticket.aggregate([
    {
      $match: {
        assignedTo: req.user._id,
        responseTime: { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseTime' },
        totalTickets: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    assigned: {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    },
    system: req.user.role === 'admin' ? {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    } : null,
    activeTickets,
    averageResponseTime: responseTimeStats[0]?.avgResponseTime || 0,
    recentTickets
  };

  // Process assigned stats
  assignedStats.forEach(stat => {
    stats.assigned.total += stat.count;
    switch (stat._id) {
      case 'open':
        stats.assigned.open = stat.count;
        break;
      case 'in-progress':
        stats.assigned.inProgress = stat.count;
        break;
      case 'resolved':
        stats.assigned.resolved = stat.count;
        break;
      case 'closed':
        stats.assigned.closed = stat.count;
        break;
    }
  });

  // Process system stats for admins
  if (req.user.role === 'admin' && stats.system) {
    allStats.forEach(stat => {
      stats.system.total += stat.count;
      switch (stat._id) {
        case 'open':
          stats.system.open = stat.count;
          break;
        case 'in-progress':
          stats.system.inProgress = stat.count;
          break;
        case 'resolved':
          stats.system.resolved = stat.count;
          break;
        case 'closed':
          stats.system.closed = stat.count;
          break;
      }
    });
  }

  res.json(stats);
}));

// @desc    Get assigned tickets
// @route   GET /api/moderator/tickets
// @access  Private (Moderators/Admins)
router.get('/tickets', isModerator, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const { status, priority, category, search } = req.query;

  // Build query based on role
  let query = {};
  
  if (req.user.role === 'moderator') {
    // Moderators see assigned tickets + unassigned tickets
    query = {
      $or: [
        { assignedTo: req.user._id },
        { assignedTo: { $exists: false } }
      ]
    };
  }
  // Admins see all tickets (no filter needed)

  // Apply additional filters
  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }
  if (category) {
    query.category = category;
  }
  if (search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ]
    });
  }

  const tickets = await Ticket.find(query)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await Ticket.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    tickets,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasMore: page < totalPages
    }
  });
}));

// @desc    Get unassigned tickets
// @route   GET /api/moderator/unassigned
// @access  Private (Moderators/Admins)
router.get('/unassigned', isModerator, asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({
    assignedTo: { $exists: false },
    status: 'open'
  })
  .populate('user', 'name email')
  .sort({ priority: 1, createdAt: -1 }) // High priority first
  .limit(20);

  res.json({ tickets });
}));

// @desc    Bulk assign tickets
// @route   PUT /api/moderator/bulk-assign
// @access  Private (Moderators/Admins)
router.put('/bulk-assign', isModerator, asyncHandler(async (req, res) => {
  const { ticketIds, moderatorId } = req.body;

  if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({
      message: 'Ticket IDs array is required'
    });
  }

  if (!moderatorId) {
    return res.status(400).json({
      message: 'Moderator ID is required'
    });
  }

  // Verify moderator exists
  const moderator = await User.findById(moderatorId);
  if (!moderator || !['moderator', 'admin'].includes(moderator.role)) {
    return res.status(400).json({
      message: 'Invalid moderator'
    });
  }

  // Update tickets
  const result = await Ticket.updateMany(
    { 
      _id: { $in: ticketIds },
      assignedTo: { $exists: false } // Only assign unassigned tickets
    },
    {
      $set: {
        assignedTo: moderatorId,
        assignedAt: new Date(),
        assignedBy: req.user._id,
        status: 'in-progress'
      }
    }
  );

  res.json({
    message: `${result.modifiedCount} tickets assigned successfully`,
    assignedCount: result.modifiedCount
  });
}));

// @desc    Get moderator performance metrics
// @route   GET /api/moderator/metrics
// @access  Private (Moderators/Admins)
router.get('/metrics', isModerator, asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const matchQuery = {
    assignedTo: req.user._id,
    updatedAt: { $gte: startDate }
  };

  // Get resolution metrics
  const metrics = await Ticket.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalTickets: { $sum: 1 },
        resolvedTickets: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
          }
        },
        avgResponseTime: {
          $avg: {
            $cond: [{ $ne: ['$responseTime', null] }, '$responseTime', null]
          }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [{ $ne: ['$resolutionTime', null] }, '$resolutionTime', null]
          }
        }
      }
    }
  ]);

  // Get satisfaction ratings
  const satisfactionStats = await Ticket.aggregate([
    {
      $match: {
        assignedTo: req.user._id,
        'satisfaction.rating': { $exists: true },
        updatedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$satisfaction.rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  const result = {
    period,
    totalTickets: metrics[0]?.totalTickets || 0,
    resolvedTickets: metrics[0]?.resolvedTickets || 0,
    resolutionRate: metrics[0]?.totalTickets 
      ? ((metrics[0].resolvedTickets / metrics[0].totalTickets) * 100).toFixed(1)
      : 0,
    avgResponseTime: Math.round(metrics[0]?.avgResponseTime || 0),
    avgResolutionTime: Math.round(metrics[0]?.avgResolutionTime || 0),
    satisfaction: {
      avgRating: satisfactionStats[0]?.avgRating 
        ? Number(satisfactionStats[0].avgRating.toFixed(1))
        : null,
      totalRatings: satisfactionStats[0]?.totalRatings || 0
    }
  };

  res.json(result);
}));

// @desc    Get ticket activity feed
// @route   GET /api/moderator/activity
// @access  Private (Moderators/Admins)
router.get('/activity', isModerator, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  // Get recently updated tickets assigned to this moderator
  const activities = await Ticket.find({
    $or: [
      { assignedTo: req.user._id },
      ...(req.user.role === 'admin' ? [{}] : [])
    ]
  })
  .populate('user', 'name email')
  .populate('assignedTo', 'name email')
  .populate('comments.user', 'name email')
  .sort({ updatedAt: -1 })
  .limit(limit);

  // Transform to activity feed format
  const activityFeed = activities.map(ticket => ({
    id: ticket._id,
    type: 'ticket_update',
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    user: ticket.user,
    assignedTo: ticket.assignedTo,
    lastComment: ticket.comments.length > 0 ? ticket.comments[ticket.comments.length - 1] : null,
    updatedAt: ticket.updatedAt
  }));

  res.json({ activities: activityFeed });
}));

module.exports = router;