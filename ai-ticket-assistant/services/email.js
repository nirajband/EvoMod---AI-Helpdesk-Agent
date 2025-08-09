const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  }

  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@aisupport.com',
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendTicketCreatedNotification({ userEmail, userName, ticketNumber, subject, estimatedResponse }) {
    const emailSubject = `Ticket Created: ${ticketNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Support Ticket Created</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your support ticket has been successfully created and is being processed by our AI system.</p>
            
            <div class="ticket-info">
              <h3>Ticket Details</h3>
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Estimated Response Time:</strong> ${estimatedResponse}</p>
            </div>

            <p>Our AI has automatically:</p>
            <ul>
              <li>✅ Categorized your ticket</li>
              <li>✅ Assigned priority level</li>
              <li>✅ Matched you with the best available expert</li>
              <li>✅ Generated initial analysis</li>
            </ul>

            <p>You'll receive an email notification when a team member responds to your ticket.</p>
            
            <a href="${process.env.FRONTEND_URL}/ticket/${ticketNumber}" class="btn">View Ticket</a>
            
            <div class="footer">
              <p>Thank you for choosing AI Support!</p>
              <p>This email was sent automatically. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Ticket Created: ${ticketNumber}

Hello ${userName},

Your support ticket has been successfully created and is being processed by our AI system.

Ticket Details:
- Ticket Number: ${ticketNumber}
- Subject: ${subject}
- Estimated Response Time: ${estimatedResponse}

Our AI has automatically categorized your ticket, assigned priority, and matched you with the best available expert.

You'll receive an email notification when a team member responds to your ticket.

View your ticket: ${process.env.FRONTEND_URL}/ticket/${ticketNumber}

Thank you for choosing AI Support!
    `;

    return this.sendEmail(userEmail, emailSubject, html, text);
  }

  async sendTicketAssignedNotification({ recipientEmail, ticketNumber, subject, priority }) {
    const emailSubject = `New Ticket Assignment: ${ticketNumber}`;
    
    const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .priority { padding: 4px 12px; border-radius: 20px; font-weight: bold; color: white; background: ${priorityColor}; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Ticket Assignment</h1>
          </div>
          <div class="content">
            <p>You have been assigned a new support ticket!</p>
            
            <div class="ticket-info">
              <h3>Ticket Details</h3>
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Priority:</strong> <span class="priority">${priority.toUpperCase()}</span></p>
            </div>

            <p>This ticket was automatically assigned to you based on your skills and current workload.</p>
            
            <a href="${process.env.FRONTEND_URL}/ticket/${ticketNumber}" class="btn">View & Respond</a>
            
            <div class="footer">
              <p>AI Support System - Intelligent Ticket Management</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
New Ticket Assignment: ${ticketNumber}

You have been assigned a new support ticket!

Ticket Details:
- Ticket Number: ${ticketNumber}
- Subject: ${subject}
- Priority: ${priority.toUpperCase()}

This ticket was automatically assigned to you based on your skills and current workload.

View and respond: ${process.env.FRONTEND_URL}/ticket/${ticketNumber}

AI Support System - Intelligent Ticket Management
    `;

    return this.sendEmail(recipientEmail, emailSubject, html, text);
  }

  async sendTicketUpdatedNotification({ recipientEmail, ticketNumber, subject, status, updatedBy }) {
    const emailSubject = `Ticket Update: ${ticketNumber}`;
    
    const statusColor = {
      'open': '#3b82f6',
      'in-progress': '#f59e0b', 
      'resolved': '#10b981',
      'closed': '#6b7280'
    }[status] || '#6b7280';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .status { padding: 4px 12px; border-radius: 20px; font-weight: bold; color: white; background: ${statusColor}; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Ticket Update</h1>
          </div>
          <div class="content">
            <p>Your support ticket has been updated!</p>
            
            <div class="ticket-info">
              <h3>Ticket Details</h3>
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>New Status:</strong> <span class="status">${status.toUpperCase()}</span></p>
              <p><strong>Updated By:</strong> ${updatedBy}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/ticket/${ticketNumber}" class="btn">View Ticket</a>
            
            <div class="footer">
              <p>AI Support System - Intelligent Ticket Management</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Ticket Update: ${ticketNumber}

Your support ticket has been updated!

Ticket Details:
- Ticket Number: ${ticketNumber}
- Subject: ${subject}
- New Status: ${status.toUpperCase()}
- Updated By: ${updatedBy}

View ticket: ${process.env.FRONTEND_URL}/ticket/${ticketNumber}

AI Support System - Intelligent Ticket Management
    `;

    return this.sendEmail(recipientEmail, emailSubject, html, text);
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();