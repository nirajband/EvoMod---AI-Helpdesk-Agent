// routes/admin.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Ticket = require('../models/ticket');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const highPriorityTickets = await Ticket.countDocuments({ priority: 'high', status: { $ne: 'closed' } });

    // Get recent activity
    const recentActivity = await Ticket.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .select('title status updatedAt user');

    const activityFormatted = recentActivity.map(ticket => ({
      description: `Ticket "${ticket.title}" was ${ticket.status}`,
      timestamp: ticket.updatedAt.toLocaleDateString()
    }));

    res.json({
      totalUsers,
      totalTickets,
      pendingTickets,
      resolvedTickets,
      highPriorityTickets,
      recentActivity: activityFormatted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      role,
      password: hashedPassword
    });
    
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;