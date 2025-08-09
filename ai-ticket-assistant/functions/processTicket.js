const { inngest } = require('../services/inngest');
const Ticket = require('../models/ticket');
const User = require('../models/User');
const geminiService = require('../services/gemini');

const processTicket = inngest.createFunction(
  { 
    id: 'process-ticket',
    name: 'Process Ticket with AI'
  },
  { event: 'ticket/created' },
  async ({ event, step }) => {
    const { ticketId, subject, description, category } = event.data;

    // Step 1: AI Analysis
    const analysis = await step.run('ai-analysis', async () => {
      console.log(`Starting AI analysis for ticket ${ticketId}`);
      
      try {
        const aiAnalysis = await geminiService.analyzeTicket(subject, description, category);
        console.log('AI Analysis completed:', aiAnalysis);
        return aiAnalysis;
      } catch (error) {
        console.error('AI Analysis failed:', error);
        throw error;
      }
    });

    // Step 2: Update ticket with AI analysis
    const updatedTicket = await step.run('update-ticket', async () => {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      // Update ticket with AI analysis
      ticket.aiCategory = analysis.aiCategory;
      ticket.aiPriority = analysis.aiPriority;
      ticket.aiSummary = analysis.aiSummary;
      ticket.tags = analysis.suggestedTags;

      // Update priority if AI suggests higher priority
      if (analysis.aiPriority === 'high' && ticket.priority !== 'high') {
        ticket.priority = analysis.aiPriority;
      }

      await ticket.save();
      console.log(`Ticket ${ticketId} updated with AI analysis`);
      
      return {
        ticket,
        requiredSkills: analysis.requiredSkills
      };
    });

    // Step 3: Find suitable moderator
    const assignedModerator = await step.run('find-moderator', async () => {
      const { requiredSkills } = updatedTicket;
      
      if (!requiredSkills || requiredSkills.length === 0) {
        console.log('No specific skills required, using admin fallback');
        return null;
      }

      try {
        // Find moderators with matching skills
        const suitableModerators = await User.findModeratorsBySkills(requiredSkills);
        
        if (suitableModerators.length === 0) {
          console.log('No moderators found with required skills:', requiredSkills);
          return null;
        }

        // Sort by workload (tickets assigned) - find least busy moderator
        const moderatorsWithWorkload = await Promise.all(
          suitableModerators.map(async (moderator) => {
            const workload = await Ticket.countDocuments({
              assignedTo: moderator._id,
              status: { $in: ['open', 'in-progress'] }
            });
            return {
              ...moderator.toObject(),
              currentWorkload: workload
            };
          })
        );

        // Sort by workload (ascending) and select the least busy
        moderatorsWithWorkload.sort((a, b) => a.currentWorkload - b.currentWorkload);
        
        const selectedModerator = moderatorsWithWorkload[0];
        console.log(`Selected moderator: ${selectedModerator.name} (workload: ${selectedModerator.currentWorkload})`);
        
        return selectedModerator;
      } catch (error) {
        console.error('Error finding suitable moderator:', error);
        return null;
      }
    });

    // Step 4: Assign ticket or fallback to admin
    await step.run('assign-ticket', async () => {
      const ticket = await Ticket.findById(ticketId);
      
      if (assignedModerator) {
        // Assign to selected moderator
        await ticket.assignTo(assignedModerator._id, 'system');
        
        // Send assignment notification
        await inngest.send({
          name: 'notification/send',
          data: {
            type: 'ticket_assigned',
            recipientId: assignedModerator._id,
            recipientEmail: assignedModerator.email,
            ticketId: ticket._id.toString(),
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            priority: ticket.priority
          }
        });
        
        console.log(`Ticket ${ticketId} assigned to ${assignedModerator.name}`);
      } else {
        // Fallback: Find admin for assignment
        const admin = await User.findOne({ role: 'admin', isActive: true });
        
        if (admin) {
          await ticket.assignTo(admin._id, 'system');
          
          await inngest.send({
            name: 'notification/send',
            data: {
              type: 'ticket_assigned_fallback',
              recipientId: admin._id,
              recipientEmail: admin.email,
              ticketId: ticket._id.toString(),
              ticketNumber: ticket.ticketNumber,
              subject: ticket.subject,
              priority: ticket.priority,
              reason: 'No moderator available with required skills'
            }
          });
          
          console.log(`Ticket ${ticketId} assigned to admin ${admin.name} (fallback)`);
        } else {
          console.log(`Ticket ${ticketId} remains unassigned - no admin found`);
        }
      }
    });

    // Step 5: Send user confirmation notification
    await step.run('notify-user', async () => {
      await inngest.send({
        name: 'notification/send',
        data: {
          type: 'ticket_created',
          recipientEmail: event.data.userEmail,
          userName: event.data.userName,
          ticketId: ticketId,
          ticketNumber: updatedTicket.ticket.ticketNumber,
          subject: subject,
          estimatedResponse: assignedModerator ? '2-4 hours' : '4-8 hours'
        }
      });
      
      console.log(`Confirmation notification sent for ticket ${ticketId}`);
    });

    return {
      success: true,
      ticketId,
      analysis,
      assignedModerator: assignedModerator?.name || 'Admin (fallback)',
      message: 'Ticket processed successfully'
    };
  }
);

module.exports = processTicket;