import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
// import { format } from "date-fns";

// Simple date formatter to avoid dependency issues
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email configuration missing. Email features will be disabled.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const emailService = {
  async sendQuotationEmail(quotation: any, customer: any) {
    const transporter = createTransporter();
    if (!transporter) return;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: customer.email,
      subject: `Rental Quotation - ${quotation.quotationNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Rental Quotation</h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Quotation Details</h3>
            <p><strong>Quotation Number:</strong> ${quotation.quotationNumber}</p>
            <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
            <p><strong>Rental Period:</strong> ${formatDate(new Date(quotation.startDate))} - ${formatDate(new Date(quotation.endDate))}</p>
            <p><strong>Total Amount:</strong> ₹${quotation.totalAmount}</p>
            <p><strong>Security Deposit:</strong> ₹${quotation.securityDeposit}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Items:</h3>
            ${quotation.items.map((item: any) => `
              <div style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 10px 0;">
                <p><strong>${item.product.name}</strong></p>
                <p>Quantity: ${item.quantity} | Rate: ₹${item.rate} | Total: ₹${item.totalAmount}</p>
              </div>
            `).join('')}
          </div>

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Valid Until:</strong> ${formatDate(new Date(quotation.validUntil))}</p>
            <p>Please review and confirm your rental requirements. Contact us if you have any questions.</p>
          </div>

          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Best regards,<br>RentPro Team</p>
          </footer>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Quotation email sent to ${customer.email}`);
    } catch (error) {
      console.error("Error sending quotation email:", error);
    }
  },

  async sendOrderConfirmationEmail(order: any, customer: any) {
    const transporter = createTransporter();
    if (!transporter) return;

    // Generate PDF invoice
    const pdfBuffer = await this.generateInvoicePDF(order, customer);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Order Confirmation</h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your rental order has been confirmed!</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
            <p><strong>Rental Period:</strong> ${formatDate(new Date(order.startDate))} - ${formatDate(new Date(order.endDate))}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Rental Items:</h3>
            ${order.items.map((item: any) => `
              <div style="border-left: 4px solid #10b981; padding-left: 16px; margin: 10px 0;">
                <p><strong>${item.product.name}</strong></p>
                <p>Quantity: ${item.quantity} | Daily Rate: ₹${item.dailyRate}</p>
              </div>
            `).join('')}
          </div>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Next Steps:</h3>
            <ol>
              <li>Complete payment processing</li>
              <li>Prepare for pickup/delivery on ${formatDate(new Date(order.startDate))}</li>
              <li>Return items by ${formatDate(new Date(order.endDate))}</li>
            </ol>
          </div>

          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Thank you for choosing RentPro!<br>Contact us if you have any questions.</p>
          </footer>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${customer.email}`);
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
    }
  },

  async sendPaymentConfirmationEmail(payment: any, order: any, customer: any) {
    const transporter = createTransporter();
    if (!transporter) return;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: customer.email,
      subject: `Payment Confirmed - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Payment Confirmation</h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payment Successfully Processed!</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Payment Amount:</strong> ₹${payment.amount}</p>
            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
            <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
            <p><strong>Payment Date:</strong> ${formatDate(new Date(payment.paidAt))}</p>
          </div>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Rental is Confirmed</h3>
            <p>Your rental equipment will be ready for pickup/delivery on ${formatDate(new Date(order.startDate))}.</p>
            <p>Please ensure someone is available to receive the equipment.</p>
          </div>

          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Thank you for your payment!<br>RentPro Team</p>
          </footer>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Payment confirmation email sent to ${customer.email}`);
    } catch (error) {
      console.error("Error sending payment confirmation email:", error);
    }
  },

  async sendReminderEmail(order: any, customer: any, type: 'pickup' | 'return') {
    const transporter = createTransporter();
    if (!transporter) return;

    const isPickup = type === 'pickup';
    const date = isPickup ? order.startDate : order.endDate;
    const action = isPickup ? 'pickup' : 'return';

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: customer.email,
      subject: `Reminder: ${action.charAt(0).toUpperCase() + action.slice(1)} Due - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">${action.charAt(0).toUpperCase() + action.slice(1)} Reminder</h2>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Reminder: Equipment ${action} scheduled</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Scheduled Date:</strong> ${formatDate(new Date(date))}</p>
            ${isPickup ? 
              '<p>Your rental equipment is ready for pickup/delivery.</p>' :
              '<p>Please ensure your rental equipment is ready for return pickup.</p>'
            }
          </div>

          <div style="margin: 20px 0;">
            <h3>Items:</h3>
            ${order.items.map((item: any) => `
              <div style="border-left: 4px solid #f59e0b; padding-left: 16px; margin: 10px 0;">
                <p><strong>${item.product.name}</strong> - Quantity: ${item.quantity}</p>
              </div>
            `).join('')}
          </div>

          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Contact us if you need to reschedule.<br>RentPro Team</p>
          </footer>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`${action} reminder email sent to ${customer.email}`);
    } catch (error) {
      console.error(`Error sending ${action} reminder email:`, error);
    }
  },

  async generateInvoicePDF(order: any, customer: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('RentPro Invoice', { align: 'center' });
      doc.moveDown();

      // Company Info
      doc.fontSize(12)
         .text('RentPro Equipment Rental', { align: 'left' })
         .text('Professional Equipment Solutions')
         .text('Email: support@rentpro.com')
         .text('Phone: +91 9876543210');
      
      doc.moveDown();

      // Invoice Details
      doc.text(`Invoice Number: ${order.orderNumber}`, { align: 'right' })
         .text(`Date: ${formatDate(new Date())}`, { align: 'right' })
         .moveDown();

      // Customer Details
      doc.text('Bill To:', { underline: true })
         .text(`${customer.firstName} ${customer.lastName}`)
         .text(`Email: ${customer.email}`)
         .text(`Phone: ${customer.phone || 'N/A'}`)
         .moveDown();

      // Rental Period
      doc.text('Rental Period:', { underline: true })
         .text(`From: ${formatDate(new Date(order.startDate))}`)
         .text(`To: ${formatDate(new Date(order.endDate))}`)
         .moveDown();

      // Items Table Header
      doc.text('Items:', { underline: true })
         .moveDown(0.5);

      const tableTop = doc.y;
      doc.text('Item', 50, tableTop)
         .text('Qty', 250, tableTop)
         .text('Rate', 300, tableTop)
         .text('Amount', 400, tableTop);

      // Draw line under header
      doc.moveTo(50, tableTop + 15)
         .lineTo(500, tableTop + 15)
         .stroke();

      // Items
      let yPosition = tableTop + 25;
      order.items.forEach((item: any) => {
        doc.text(item.product.name, 50, yPosition)
           .text(item.quantity.toString(), 250, yPosition)
           .text(`₹${item.dailyRate}`, 300, yPosition)
           .text(`₹${item.totalAmount}`, 400, yPosition);
        yPosition += 20;
      });

      // Totals
      doc.moveDown();
      const totalsY = doc.y + 20;
      
      doc.text('Subtotal:', 300, totalsY)
         .text(`₹${order.totalAmount}`, 400, totalsY);
      
      doc.text('Security Deposit:', 300, totalsY + 20)
         .text(`₹${order.securityDeposit}`, 400, totalsY + 20);
      
      doc.fontSize(14)
         .text('Total Amount:', 300, totalsY + 50, { underline: true })
         .text(`₹${(parseFloat(order.totalAmount) + parseFloat(order.securityDeposit)).toFixed(2)}`, 400, totalsY + 50, { underline: true });

      // Footer
      doc.fontSize(10)
         .moveDown(3)
         .text('Terms & Conditions:', { underline: true })
         .text('• Security deposit will be refunded upon safe return of equipment')
         .text('• Late return charges apply after grace period')
         .text('• Customer is responsible for any damage or loss')
         .text('• Payment due upon confirmation of order');

      doc.end();
    });
  }
};