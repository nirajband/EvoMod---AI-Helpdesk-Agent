// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['user', 'ai', 'moderator'], required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);