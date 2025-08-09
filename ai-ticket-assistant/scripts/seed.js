const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Moderator = require('../models/User');

dotenv.config();

const seedModerators = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ticket-assistant');
    console.log('Connected to MongoDB');

    // Clear existing moderators
    await Moderator.deleteMany({});
    console.log('Cleared existing moderators');

    // Sample moderators
    const moderators = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        skills: ['technical', 'billing', 'general', 'bug_report', 'feature_request'],
        isActive: true
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123',
        role: 'moderator',
        skills: ['technical', 'bug_report'],
        isActive: true,
        ticketCount: 50,
        resolvedTickets: 45,
        averageResponseTime: 2.5
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'moderator',
        skills: ['billing', 'general'],
        isActive: true,
        ticketCount: 70,
        resolvedTickets: 67,
        averageResponseTime: 1.8
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: 'password123',
        role: 'moderator',
        skills: ['feature_request', 'general'],
        isActive: true,
        ticketCount: 30,
        resolvedTickets: 23,
        averageResponseTime: 3.2
      },
      {
        name: 'David Miller',
        email: 'david@example.com',
        password: 'password123',
        role: 'moderator',
        skills: ['technical', 'billing', 'bug_report'],
        isActive: false,
        ticketCount: 95,
        resolvedTickets: 89,
        averageResponseTime: 2.1
      }
    ];

    // Insert moderators
    const createdModerators = await Moderator.create(moderators);
    console.log(`Created ${createdModerators.length} moderators:`);

    createdModerators.forEach(mod => {
      console.log(`- ${mod.name} (${mod.role}) - Skills: ${mod.skills.join(', ')}`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Moderator: alice@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the seed function
seedModerators();
