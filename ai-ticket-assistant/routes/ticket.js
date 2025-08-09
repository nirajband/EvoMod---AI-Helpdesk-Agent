const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Ticket = require('../models/ticket');
const User = require('../models/User');
const { authorize, isModerator } = require('../middleware/auth');
const { inngest } = require('../services/inngest');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/tickets');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `ticket-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5
  }
});

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
router.post('/', upload.array('attachments', 5), asyncHandler(async (req, res) => {
  const { subject, description, category, priority } = req.body;

  // Validation
  if (!subject || !description || !category) {
    return res.status(400).json({
      message: 'Subject, description, and category are required'
    });
  }

  if (subject.length > 200) {
    return res.status(400).json({
      message: 'Subject cannot exceed 200 characters'
    });
  }

  if (description.length > 5000) {
    return res.status(400).json({
      message: 'Description cannot exceed 5000 characters'
    });
  }

  // Process attachments
  const attachments = req.files ? req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype
  })) : [];

  try {
    // Create ticket
    const ticket = await Ticket.create({
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium',
      user: req.user.id,
      attachments
    });

    // Populate user information
    await ticket.populate('user', 'name email');

    // Trigger AI processing via Inngest
    await inngest.send({
      name: 'ticket/created',
      data: {
        ticketId: ticket._id.toString(),
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name
      }
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    // Clean up uploaded files if ticket creation fails
    if (req.files) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }
    throw error;
  }
}));

// @desc    Get user's tickets or all tickets (for moderators/admins)
// @route   GET /api/tickets
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
  const skip = (page - 1) * limit;

  const { status, category, priority, search } = req.query;

  // Build query
  let query = {};
  
  // Users can only see their own tickets
  if (req.user.role === 'user') {
    query.user = req.user.id;
  }
  // Moderators see assigned tickets + unassigned tickets
  else if (req.user.role === 'moderator') {
    query.$or = [
      { assignedTo: req.user.id },
      { assignedTo: { $exists: false } }
    ];
  }
  // Admins see all tickets (no additional filter needed)

  // Apply filters
  if (status) {
    query.status = status;
  }
  if (category) {
    query.category = category;
  }
  if (priority) {
    query.priority = priority;
  }
  if (search) {
    query.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ticketNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Get tickets with pagination
  const tickets = await Ticket.find(query)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
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

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await Ticket.getStats(req.user.id, req.user.role);
  
  res.json(stats);
}));

// @desc    Get recent tickets
// @route   GET /api/tickets/recent
// @access  Private
router.get('/recent', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 5, 10);
  const tickets = await Ticket.getRecentTickets(req.user.id, req.user.role, limit);
  
  res.json(tickets);
}));

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('user', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('comments.user', 'name email role');

  if (!ticket) {
    return res.status(404).json({
      message: 'Ticket not found'
    });
  }

  // Check permissions
  const canView = 
    req.user.role === 'admin' ||
    ticket.user._id.toString() === req.user.id ||
    (req.user.role === 'moderator' && ticket.assignedTo?._id.toString() === req.user.id);

  if (!canView) {
    return res.status(403).json({
      message: 'Access denied'
    });
  }

  res.json({ ticket });
}));

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
router.put('/:id', isModerator, asyncHandler(async (req, res) => {
  const { status, priority, assignedTo } = req.body;
  
  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      message: 'Ticket not found'
    });
  }

  // Check permissions
  const canUpdate = 
    req.user.role === 'admin' ||
    ticket.assignedTo?.toString() === req.user.id ||
    !ticket.assignedTo; // Unassigned tickets can be updated by any moderator

  if (!canUpdate) {
    return res.status(403).json({
      message: 'Access denied'
    });
  }

  // Update fields
  if (status && ['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
    ticket.status = status;
  }
  
  if (priority && ['low', 'medium', 'high'].includes(priority)) {
    ticket.priority = priority;
  }
  
  if (assignedTo) {
    const moderator = await User.findById(assignedTo);
    if (!moderator || !['moderator', 'admin'].includes(moderator.role)) {
      return res.status(400).json({
        message: 'Invalid moderator ID'
      });
    }
    await ticket.assignTo(assignedTo, req.user.id);
  }
  
  if (!assignedTo) {
    await ticket.save();
  }

  // Populate and return updated ticket
  await ticket.populate('user', 'name email');
  await ticket.populate('assignedTo', 'name email');

  res.json({
    message: 'Ticket updated successfully',
    ticket
  });
}));

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
router.post('/:id/comments', asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({
      message: 'Comment message is required'
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      message: 'Comment cannot exceed 2000 characters'
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      message: 'Ticket not found'
    });
  }

  // Check permissions
  const canComment = 
    req.user.role === 'admin' ||
    ticket.user.toString() === req.user.id ||
    (req.user.role === 'moderator' && ticket.assignedTo?.toString() === req.user.id);

  if (!canComment) {
    return res.status(403).json({
      message: 'Access denied'
    });
  }

  // Only moderators/admins can add internal comments
  const isInternalComment = isInternal && ['moderator', 'admin'].includes(req.user.role);

  await ticket.addComment(req.user.id, message.trim(), isInternalComment);
  
  // Populate the ticket with updated comments
  await ticket.populate('comments.user', 'name email role');

  res.status(201).json({
    message: 'Comment added successfully',
    comment: ticket.comments[ticket.comments.length - 1]
  });
}));

// @desc    Assign ticket to moderator
// @route   PUT /api/tickets/:id/assign
// @access  Private (Moderators/Admins)
router.put('/:id/assign', isModerator, asyncHandler(async (req, res) => {
  const { moderatorId } = req.body;
  
  if (!moderatorId) {
    return res.status(400).json({
      message: 'Moderator ID is required'
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      message: 'Ticket not found'
    });
  }

  // Verify moderator exists and has correct role
  const moderator = await User.findById(moderatorId);
  if (!moderator || !['moderator', 'admin'].includes(moderator.role)) {
    return res.status(400).json({
      message: 'Invalid moderator'
    });
  }

  await ticket.assignTo(moderatorId, req.user.id);
  await ticket.populate('assignedTo', 'name email');

  // Send notification
  await inngest.send({
    name: 'ticket/assigned',
    data: {
      ticketId: ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      moderatorId: moderatorId,
      moderatorEmail: moderator.email,
      assignedBy: req.user.name
    }
  });

  res.json({
    message: 'Ticket assigned successfully',
    ticket
  });
}));

// @desc    Add satisfaction rating
// @route   POST /api/tickets/:id/satisfaction
// @access  Private (Ticket owner only)
router.post('/:id/satisfaction', asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: 'Rating must be between 1 and 5'
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      message: 'Ticket not found'
    });
  }

  // Only ticket owner can rate
  if (ticket.user.toString() !== req.user.id) {
    return res.status(403).json({
      message: 'Only ticket owner can provide satisfaction rating'
    });
  }

  // Only resolved or closed tickets can be rated
  if (!['resolved', 'closed'].includes(ticket.status)) {
    return res.status(400).json({
      message: 'Can only rate resolved or closed tickets'
    });
  }

  await ticket.addSatisfactionRating(rating, feedback);

  res.json({
    message: 'Satisfaction rating added successfully',
    satisfaction: ticket.satisfaction
  });
}));

// @desc    Delete ticket (Admin only)
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      message: 'Ticket not found'
    });
  }

  // Delete associated files
  if (ticket.attachments && ticket.attachments.length > 0) {
    for (const attachment of ticket.attachments) {
      try {
        await fs.unlink(attachment.path);
      } catch (error) {
        console.error('Error deleting attachment:', error);
      }
    }
  }

  await ticket.deleteOne();

  res.json({
    message: 'Ticket deleted successfully'
  });
}));

module.exports = router;