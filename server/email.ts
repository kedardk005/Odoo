import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

export interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  startDate: string;
  endDate: string;
}

export interface QuotationData {
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  startDate: string;
  endDate: string;
  validUntil: string;
}

// Generate PDF invoice
export function generateInvoicePDF(orderData: OrderData): Buffer {
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  
  // Header
  doc.fontSize(20).text('RentPro Invoice', 50, 50);
  doc.fontSize(12).text(`Order Number: ${orderData.orderNumber}`, 50, 80);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 95);
  
  // Customer details
  doc.text('Bill To:', 50, 130);
  doc.text(orderData.customerName, 50, 145);
  doc.text(orderData.customerEmail, 50, 160);
  
  // Rental period
  doc.text(`Rental Period: ${new Date(orderData.startDate).toLocaleDateString()} - ${new Date(orderData.endDate).toLocaleDateString()}`, 50, 190);
  
  // Items table
  let yPosition = 220;
  doc.text('Item', 50, yPosition);
  doc.text('Qty', 200, yPosition);
  doc.text('Unit Price', 250, yPosition);
  doc.text('Total', 350, yPosition);
  
  yPosition += 20;
  orderData.items.forEach((item) => {
    doc.text(item.name, 50, yPosition);
    doc.text(item.quantity.toString(), 200, yPosition);
    doc.text(`₹${item.unitPrice}`, 250, yPosition);
    doc.text(`₹${item.totalPrice}`, 350, yPosition);
    yPosition += 15;
  });
  
  // Total
  yPosition += 20;
  doc.fontSize(14).text(`Total Amount: ₹${orderData.totalAmount}`, 250, yPosition);
  
  doc.end();
  
  return Buffer.concat(buffers);
}

// Generate PDF quotation
export function generateQuotationPDF(quotationData: QuotationData): Buffer {
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  
  // Header
  doc.fontSize(20).text('RentPro Quotation', 50, 50);
  doc.fontSize(12).text(`Quotation Number: ${quotationData.quotationNumber}`, 50, 80);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 95);
  doc.text(`Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}`, 50, 110);
  
  // Customer details
  doc.text('Quote For:', 50, 140);
  doc.text(quotationData.customerName, 50, 155);
  doc.text(quotationData.customerEmail, 50, 170);
  
  // Rental period
  doc.text(`Rental Period: ${new Date(quotationData.startDate).toLocaleDateString()} - ${new Date(quotationData.endDate).toLocaleDateString()}`, 50, 200);
  
  // Items table
  let yPosition = 230;
  doc.text('Item', 50, yPosition);
  doc.text('Qty', 200, yPosition);
  doc.text('Unit Price', 250, yPosition);
  doc.text('Total', 350, yPosition);
  
  yPosition += 20;
  quotationData.items.forEach((item) => {
    doc.text(item.name, 50, yPosition);
    doc.text(item.quantity.toString(), 200, yPosition);
    doc.text(`₹${item.unitPrice}`, 250, yPosition);
    doc.text(`₹${item.totalPrice}`, 350, yPosition);
    yPosition += 15;
  });
  
  // Total
  yPosition += 20;
  doc.fontSize(14).text(`Total Amount: ₹${quotationData.totalAmount}`, 250, yPosition);
  
  doc.end();
  
  return Buffer.concat(buffers);
}

// Send order confirmation email
export async function sendOrderConfirmation(orderData: OrderData) {
  const pdfBuffer = generateInvoicePDF(orderData);
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: orderData.customerEmail,
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Dear ${orderData.customerName},</p>
      <p>Thank you for your order! Your rental has been confirmed.</p>
      
      <h3>Order Details:</h3>
      <ul>
        <li>Order Number: ${orderData.orderNumber}</li>
        <li>Rental Period: ${new Date(orderData.startDate).toLocaleDateString()} - ${new Date(orderData.endDate).toLocaleDateString()}</li>
        <li>Total Amount: ₹${orderData.totalAmount}</li>
      </ul>
      
      <p>Please find the invoice attached.</p>
      
      <p>Best regards,<br>RentPro Team</p>
    `,
    attachments: [
      {
        filename: `invoice-${orderData.orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

// Send quotation email
export async function sendQuotationEmail(quotationData: QuotationData) {
  const pdfBuffer = generateQuotationPDF(quotationData);
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: quotationData.customerEmail,
    subject: `Quotation - ${quotationData.quotationNumber}`,
    html: `
      <h2>Quotation Request</h2>
      <p>Dear ${quotationData.customerName},</p>
      <p>Thank you for your interest! Please find your quotation details below.</p>
      
      <h3>Quotation Details:</h3>
      <ul>
        <li>Quotation Number: ${quotationData.quotationNumber}</li>
        <li>Rental Period: ${new Date(quotationData.startDate).toLocaleDateString()} - ${new Date(quotationData.endDate).toLocaleDateString()}</li>
        <li>Total Amount: ₹${quotationData.totalAmount}</li>
        <li>Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}</li>
      </ul>
      
      <p>Please review the attached quotation and let us know if you'd like to proceed.</p>
      
      <p>Best regards,<br>RentPro Team</p>
    `,
    attachments: [
      {
        filename: `quotation-${quotationData.quotationNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

// Send payment confirmation email
export async function sendPaymentConfirmation(orderData: OrderData, paymentId: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: orderData.customerEmail,
    subject: `Payment Confirmed - ${orderData.orderNumber}`,
    html: `
      <h2>Payment Confirmation</h2>
      <p>Dear ${orderData.customerName},</p>
      <p>We have received your payment for order ${orderData.orderNumber}.</p>
      
      <h3>Payment Details:</h3>
      <ul>
        <li>Payment ID: ${paymentId}</li>
        <li>Amount: ₹${orderData.totalAmount}</li>
        <li>Date: ${new Date().toLocaleDateString()}</li>
      </ul>
      
      <p>Your rental equipment will be prepared for delivery/pickup as scheduled.</p>
      
      <p>Best regards,<br>RentPro Team</p>
    `
  };

  return transporter.sendMail(mailOptions);
}