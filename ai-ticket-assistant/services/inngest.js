const { Inngest } = require('inngest');

// Create Inngest client
const inngest = new Inngest({
  id: 'ai-ticket-system',
  name: 'AI Ticket Management System',
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.NODE_ENV !== 'production'
});

module.exports = { inngest };