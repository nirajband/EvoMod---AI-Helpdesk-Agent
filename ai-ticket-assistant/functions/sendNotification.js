const { inngest } = require('../services/inngest');
const emailService = require('../services/email');

const sendNotification = inngest.createFunction(
  {
    id: 'send-notification',
    name: 'Send Email Notification'
  },
  { event: 'notification/send' },
  async ({ event, step }) => {
    const { type, ...data } = event.data;

    return await step.run('send-email', async () => {
      try {
        let result;

        switch (type) {
          case 'ticket_created':
            result = await emailService.sendTicketCreatedNotification({
              userEmail: data.recipientEmail,
              userName: data.userName,
              ticketNumber: data.ticketNumber,
              subject: data.subject,
              estimatedResponse: data.estimatedResponse
            });
            break;

          case 'ticket_assigned':
            result = await emailService.sendTicketAssignedNotification({
              recipientEmail: data.recipientEmail,
              ticketNumber: data.ticketNumber,
              subject: data.subject,
              priority: data.priority
            });
            break;

          case 'ticket_assigned_fallback':
            result = await emailService.sendTicketAssignedNotification({
              recipientEmail: data.recipientEmail,
              ticketNumber: data.ticketNumber,
              subject: `${data.subject} (Fallback Assignment - ${data.reason})`,
              priority: data.priority
            });
            break;

          case 'ticket_updated':
            result = await emailService.sendTicketUpdatedNotification({
              recipientEmail: data.recipientEmail,
              ticketNumber: data.ticketNumber,
              subject: data.subject,
              status: data.status,
              updatedBy: data.updatedBy
            });
            break;

          default:
            throw new Error(`Unknown notification type: ${type}`);
        }

        console.log(`Notification sent successfully: ${type}`);
        return {
          success: true,
          type,
          messageId: result.messageId
        };

      } catch (error) {
        console.error(`Failed to send notification: ${type}`, error);
        
        // Don't throw error to prevent infinite retries for permanent failures
        return {
          success: false,
          type,
          error: error.message
        };
      }
    });
  }
);

module.exports = sendNotification;