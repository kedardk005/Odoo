const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const contractController = {
  // Generate rental contract from order
  generateRentalContract: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { terms_and_conditions, special_conditions } = req.body;

      // Get order details with all related data
      const order = await RentalOrder.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email', 'phone_number', 'address']
          },
          {
            model: RentalOrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'sku_code', 'description', 'late_fee_per_day']
              }
            ]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Rental order not found'
        });
      }

      if (order.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Contract can only be generated for confirmed orders'
        });
      }

      // Generate contract data
      const contractData = {
        contract_number: `CONTRACT-${order.order_id}-${Date.now()}`,
        order_id: orderId,
        customer: order.customer,
        items: order.items,
        rental_details: {
          pickup_date: order.pickup_date,
          return_date: order.return_date,
          total_amount: order.total_amount,
          deposit_amount: order.deposit_amount
        },
        terms_and_conditions: terms_and_conditions || this.getDefaultTermsAndConditions(),
        special_conditions,
        generated_date: new Date(),
        contract_status: 'active'
      };

      // Generate PDF contract
      const pdfBuffer = await this.generateContractPDF(contractData);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="rental_contract_${orderId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Generate rental contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate rental contract',
        error: error.message
      });
    }
  },

  // Generate contract as JSON (for API integration)
  generateContractData: async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await RentalOrder.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'customer'
          },
          {
            model: RentalOrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product'
              }
            ]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Rental order not found'
        });
      }

      const contractData = {
        contract_number: `CONTRACT-${order.order_id}-${Date.now()}`,
        order_details: {
          order_id: order.order_id,
          order_date: order.created_at,
          pickup_date: order.pickup_date,
          return_date: order.return_date,
          status: order.status
        },
        customer_details: {
          name: order.customer.full_name,
          email: order.customer.email,
          phone: order.customer.phone_number,
          address: order.customer.address
        },
        rental_items: order.items.map(item => ({
          product_name: item.product.name,
          product_sku: item.product.sku_code,
          quantity: item.quantity,
          unit_price: item.unit_price,
          rental_duration: item.rental_duration,
          rental_period_type: item.rental_period_type,
          total_amount: parseFloat(item.unit_price) * parseInt(item.quantity)
        })),
        financial_details: {
          subtotal: order.total_amount,
          deposit_amount: order.deposit_amount,
          total_amount: order.total_amount,
          late_fee_structure: order.items.map(item => ({
            product: item.product.name,
            late_fee_per_day: item.product.late_fee_per_day
          }))
        },
        terms_and_conditions: this.getDefaultTermsAndConditions(),
        contract_date: new Date(),
        validity: '30 days from generation'
      };

      res.json({
        success: true,
        data: { contract: contractData }
      });
    } catch (error) {
      console.error('Generate contract data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate contract data',
        error: error.message
      });
    }
  },

  // Generate PDF contract
  generateContractPDF: async (contractData) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(20).text('RENTAL AGREEMENT CONTRACT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Contract Number: ${contractData.contract_number}`, { align: 'right' });
        doc.text(`Date: ${contractData.generated_date.toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);

        // Parties
        doc.fontSize(14).text('PARTIES TO THE AGREEMENT', { underline: true });
        doc.moveDown();
        doc.fontSize(12);
        doc.text('LESSOR (Company):', { continued: true, width: 150 });
        doc.text('Rental Management Company');
        doc.text('Address: [Company Address]');
        doc.text('Phone: [Company Phone]');
        doc.text('Email: [Company Email]');
        doc.moveDown();

        doc.text('LESSEE (Customer):', { continued: true, width: 150 });
        doc.text(contractData.customer.full_name);
        doc.text(`Phone: ${contractData.customer.phone_number}`);
        doc.text(`Email: ${contractData.customer.email}`);
        if (contractData.customer.address) {
          doc.text(`Address: ${contractData.customer.address}`);
        }
        doc.moveDown(2);

        // Rental Details
        doc.fontSize(14).text('RENTAL DETAILS', { underline: true });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Order ID: ${contractData.order_id}`);
        doc.text(`Pickup Date: ${new Date(contractData.rental_details.pickup_date).toLocaleDateString()}`);
        doc.text(`Return Date: ${new Date(contractData.rental_details.return_date).toLocaleDateString()}`);
        doc.moveDown();

        // Items Table
        doc.text('RENTAL ITEMS:', { underline: true });
        doc.moveDown();

        let yPosition = doc.y;
        const tableTop = yPosition;
        const itemCodeX = 50;
        const descriptionX = 150;
        const quantityX = 350;
        const priceX = 400;
        const totalX = 500;

        // Table headers
        doc.text('Item', itemCodeX, yPosition);
        doc.text('Description', descriptionX, yPosition);
        doc.text('Qty', quantityX, yPosition);
        doc.text('Price', priceX, yPosition);
        doc.text('Total', totalX, yPosition);
        doc.moveDown();

        yPosition = doc.y;
        doc.moveTo(itemCodeX, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;

        // Table rows
        contractData.items.forEach(item => {
          const itemTotal = parseFloat(item.unit_price) * parseInt(item.quantity);
          doc.text(item.product.sku_code, itemCodeX, yPosition);
          doc.text(item.product.name, descriptionX, yPosition);
          doc.text(item.quantity.toString(), quantityX, yPosition);
          doc.text(`₹${parseFloat(item.unit_price).toFixed(2)}`, priceX, yPosition);
          doc.text(`₹${itemTotal.toFixed(2)}`, totalX, yPosition);
          yPosition += 20;
        });

        doc.moveTo(itemCodeX, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;

        // Totals
        doc.text(`Total Amount: ₹${parseFloat(contractData.rental_details.total_amount).toFixed(2)}`, totalX - 100, yPosition);
        if (contractData.rental_details.deposit_amount > 0) {
          yPosition += 15;
          doc.text(`Deposit: ₹${parseFloat(contractData.rental_details.deposit_amount).toFixed(2)}`, totalX - 100, yPosition);
        }
        doc.moveDown(2);

        // Terms and Conditions
        doc.addPage();
        doc.fontSize(14).text('TERMS AND CONDITIONS', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        contractData.terms_and_conditions.forEach((term, index) => {
          doc.text(`${index + 1}. ${term}`);
          doc.moveDown(0.5);
        });

        if (contractData.special_conditions) {
          doc.moveDown();
          doc.fontSize(12).text('SPECIAL CONDITIONS:', { underline: true });
          doc.moveDown();
          doc.fontSize(10).text(contractData.special_conditions);
        }

        // Signatures
        doc.moveDown(3);
        doc.fontSize(12);
        doc.text('SIGNATURES:', { underline: true });
        doc.moveDown(2);

        // Create signature areas
        const signatureY = doc.y;
        doc.text('LESSOR:', 50, signatureY);
        doc.text('LESSEE:', 300, signatureY);
        
        doc.moveDown(3);
        const lineY = doc.y;
        doc.moveTo(50, lineY).lineTo(200, lineY).stroke(); // Lessor signature line
        doc.moveTo(300, lineY).lineTo(450, lineY).stroke(); // Lessee signature line
        
        doc.moveDown();
        const dateY = doc.y;
        doc.text('Date: ________________', 50, dateY);
        doc.text('Date: ________________', 300, dateY);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get default terms and conditions
  getDefaultTermsAndConditions: () => {
    return [
      "The Lessee agrees to rent the above-mentioned items for the specified period.",
      "The Lessee is responsible for the care and proper use of all rented items.",
      "Any damage to the rented items will be charged to the Lessee at replacement cost.",
      "Late returns will incur additional charges as specified in the rate schedule.",
      "The Lessee agrees to return all items in the same condition as received, normal wear and tear excepted.",
      "The Lessor reserves the right to inspect rented items at any reasonable time.",
      "The Lessee is liable for any loss or theft of rented items during the rental period.",
      "Payment terms are as agreed upon at the time of rental confirmation.",
      "The Lessee agrees to use rented items only for their intended purpose.",
      "This agreement is governed by the laws of the jurisdiction where the rental takes place.",
      "Any disputes arising from this agreement will be resolved through appropriate legal channels.",
      "The Lessee acknowledges receipt of all items listed in this agreement in good working condition.",
      "The Lessor is not liable for any damages or losses resulting from the use of rented items.",
      "This agreement constitutes the entire agreement between the parties.",
      "Modifications to this agreement must be made in writing and signed by both parties."
    ];
  }
};

module.exports = contractController;