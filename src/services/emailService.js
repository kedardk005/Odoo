const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async loadTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');

      // Simple template variable replacement
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(placeholder, data[key] || '');
      });

      return template;
    } catch (error) {
      console.error(`Failed to load template ${templateName}:`, error);
      // Return a basic template
      return this.getBasicTemplate(data);
    }
  }

  getBasicTemplate(data = {}) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Rental Management System</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
              .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
              .content { margin: 20px 0; line-height: 1.6; color: #555; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
              .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Rental Management System</h1>
              </div>
              <div class="content">
                  ${data.content || '<p>Thank you for using our rental management system.</p>'}
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  async sendEmail({ to, subject, template, data = {}, html, text, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      let htmlContent = html;
      
      if (template && !html) {
        htmlContent = await this.loadTemplate(template, data);
      } else if (!html && !text) {
        htmlContent = this.getBasicTemplate(data);
      }

      const mailOptions = {
        from: `"Rental Management System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
        text: text || data.content,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Rental Management System',
      template: 'welcome',
      data: {
        firstName: user.firstName,
        email: user.email,
        content: `
          <h2>Welcome, ${user.firstName}!</h2>
          <p>Thank you for registering with our Rental Management System. You can now browse and rent products online.</p>
          <p>Your account details:</p>
          <ul>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
          </ul>
          <p>Get started by browsing our product catalog and making your first rental.</p>
        `
      }
    });
  }

  async sendPasswordResetEmail(user, resetLink) {
    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password_reset',
      data: {
        firstName: user.firstName,
        resetLink,
        content: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.firstName},</p>
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          <p><a href="${resetLink}" class="btn">Reset Password</a></p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        `
      }
    });
  }

  async sendOrderConfirmation(user, order) {
    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: 'order_confirmation',
      data: {
        firstName: user.firstName,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        content: `
          <h2>Order Confirmed!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your rental order has been confirmed. Here are the details:</p>
          <ul>
              <li><strong>Order Number:</strong> ${order.orderNumber}</li>
              <li><strong>Total Amount:</strong> ₹${order.totalAmount}</li>
              <li><strong>Rental Start:</strong> ${new Date(order.rentalStartDate).toLocaleDateString()}</li>
              <li><strong>Rental End:</strong> ${new Date(order.rentalEndDate).toLocaleDateString()}</li>
          </ul>
          <p>We'll send you updates about pickup and delivery schedules.</p>
        `
      }
    });
  }

  async sendPaymentReminder(user, invoice) {
    return this.sendEmail({
      to: user.email,
      subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
      template: 'payment_reminder',
      data: {
        firstName: user.firstName,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        dueDate: new Date(invoice.dueDate).toLocaleDateString(),
        content: `
          <h2>Payment Reminder</h2>
          <p>Hi ${user.firstName},</p>
          <p>This is a friendly reminder that your payment is due soon:</p>
          <ul>
              <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
              <li><strong>Amount Due:</strong> ₹${invoice.balanceAmount || invoice.totalAmount}</li>
              <li><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</li>
          </ul>
          <p>Please make your payment to avoid any late fees.</p>
        `
      }
    });
  }

  async sendReturnReminder(user, order) {
    return this.sendEmail({
      to: user.email,
      subject: `Return Reminder - ${order.orderNumber}`,
      template: 'return_reminder',
      data: {
        firstName: user.firstName,
        orderNumber: order.orderNumber,
        returnDate: new Date(order.rentalEndDate).toLocaleDateString(),
        content: `
          <h2>Return Reminder</h2>
          <p>Hi ${user.firstName},</p>
          <p>This is a reminder that your rental is due for return:</p>
          <ul>
              <li><strong>Order Number:</strong> ${order.orderNumber}</li>
              <li><strong>Return Date:</strong> ${new Date(order.rentalEndDate).toLocaleDateString()}</li>
          </ul>
          <p>Please ensure all items are returned on time to avoid late fees.</p>
        `
      }
    });
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is working properly' };
    } catch (error) {
      console.error('Email service test failed:', error);
      return { success: false, message: error.message };
    }
  }
}

const emailService = new EmailService();

module.exports = {
  sendEmail: emailService.sendEmail.bind(emailService),
  sendWelcomeEmail: emailService.sendWelcomeEmail.bind(emailService),
  sendPasswordResetEmail: emailService.sendPasswordResetEmail.bind(emailService),
  sendOrderConfirmation: emailService.sendOrderConfirmation.bind(emailService),
  sendPaymentReminder: emailService.sendPaymentReminder.bind(emailService),
  sendReturnReminder: emailService.sendReturnReminder.bind(emailService),
  testConnection: emailService.testConnection.bind(emailService)
};