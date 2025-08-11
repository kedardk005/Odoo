import nodemailer from "nodemailer";

// Email service configuration
const transporter = nodemailer.createTransporter({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "skillmart.ce@gmail.com",
    pass: "keph uzrw ogtf wqvr"
  }
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailData): Promise<void> {
  try {
    await transporter.sendMail({
      from: "skillmart.ce@gmail.com",
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderData: any) => ({
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Order Confirmed!</h1>
          
          <p>Dear ${orderData.customerName},</p>
          
          <p>Thank you for your rental order. We've successfully received and confirmed your booking.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-bottom: 15px;">Order Details</h2>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Rental Period:</strong> ${new Date(orderData.startDate).toLocaleDateString()} - ${new Date(orderData.endDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${parseFloat(orderData.totalAmount).toLocaleString()}</p>
            <p><strong>Security Deposit:</strong> ₹${parseFloat(orderData.securityDeposit).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-bottom: 10px;">What's Next?</h3>
            <ul style="color: #064e3b; margin: 0; padding-left: 20px;">
              <li>We'll prepare your equipment for pickup/delivery</li>
              <li>You'll receive a notification when your order is ready</li>
              <li>Equipment will be delivered/available for pickup on your start date</li>
            </ul>
          </div>
          
          <p style="margin-top: 20px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              RentPro Team<br>
              Professional Equipment Rentals
            </p>
          </div>
        </div>
      </div>
    `
  }),

  statusUpdate: (orderData: any, newStatus: string) => ({
    subject: `Order Update - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Order Status Update</h1>
          
          <p>Dear ${orderData.customerName},</p>
          
          <p>Your rental order status has been updated.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-bottom: 15px;">Order Details</h2>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>New Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; text-transform: capitalize;">${newStatus}</span></p>
            <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${getStatusMessage(newStatus)}
          
          <p style="margin-top: 20px;">
            Track your order anytime by logging into your account.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              RentPro Team<br>
              Professional Equipment Rentals
            </p>
          </div>
        </div>
      </div>
    `
  }),

  paymentConfirmation: (paymentData: any) => ({
    subject: `Payment Confirmation - ${paymentData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">Payment Confirmed!</h1>
          
          <p>Dear ${paymentData.customerName},</p>
          
          <p>We've successfully received your payment for order ${paymentData.orderNumber}.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-bottom: 15px;">Payment Details</h2>
            <p><strong>Transaction ID:</strong> ${paymentData.paymentId}</p>
            <p><strong>Amount Paid:</strong> ₹${parseFloat(paymentData.amount).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> Razorpay</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="color: #065f46; margin: 0;">
              <strong>✓ Payment Successful</strong><br>
              Your rental order is now confirmed and being prepared.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              RentPro Team<br>
              Professional Equipment Rentals
            </p>
          </div>
        </div>
      </div>
    `
  })
};

function getStatusMessage(status: string): string {
  const messages = {
    confirmed: `
      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="color: #065f46; margin: 0;">
          <strong>✓ Order Confirmed</strong><br>
          Your order has been confirmed and we're preparing your equipment.
        </p>
      </div>
    `,
    delivered: `
      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="color: #065f46; margin: 0;">
          <strong>🚚 Equipment Delivered</strong><br>
          Your rental equipment has been delivered. Enjoy your rental!
        </p>
      </div>
    `,
    returned: `
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #6b7280;">
        <p style="color: #374151; margin: 0;">
          <strong>✓ Equipment Returned</strong><br>
          Thank you for returning the equipment. Your security deposit will be processed shortly.
        </p>
      </div>
    `,
    cancelled: `
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
        <p style="color: #991b1b; margin: 0;">
          <strong>❌ Order Cancelled</strong><br>
          Your order has been cancelled. Any payments will be refunded within 3-5 business days.
        </p>
      </div>
    `
  };
  
  return messages[status as keyof typeof messages] || "";
}