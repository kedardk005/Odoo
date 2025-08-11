const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class ReportService {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.ensureReportsDirectory();
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Generate PDF Report
  async generatePDF(data, reportType, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `${reportType}_${Date.now()}.pdf`;
        const filepath = path.join(this.reportsDir, filename);
        
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        
        doc.pipe(fs.createWriteStream(filepath));

        // Header
        doc.fontSize(20)
           .text('Rental Management System', 50, 50);
        
        doc.fontSize(16)
           .text(options.title || 'Report', 50, 80);
           
        doc.fontSize(12)
           .text(`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`, 50, 110);

        doc.moveTo(50, 130)
           .lineTo(550, 130)
           .stroke();

        let yPosition = 150;

        // Report-specific content
        switch (reportType) {
          case 'revenue':
            yPosition = this.addRevenueContent(doc, data, yPosition);
            break;
          case 'customers':
            yPosition = this.addCustomersContent(doc, data, yPosition);
            break;
          case 'products':
            yPosition = this.addProductsContent(doc, data, yPosition);
            break;
          case 'orders':
            yPosition = this.addOrdersContent(doc, data, yPosition);
            break;
          default:
            doc.text('No specific content for this report type', 50, yPosition);
        }

        // Footer
        doc.fontSize(10)
           .text('© Rental Management System', 50, 750, { align: 'center' });

        doc.end();

        doc.on('end', () => {
          resolve({
            filename,
            filepath,
            url: `/reports/${filename}`
          });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  addRevenueContent(doc, data, yPosition) {
    doc.fontSize(14).text('Revenue Summary', 50, yPosition);
    yPosition += 30;

    doc.fontSize(12);
    doc.text(`Total Revenue: ₹${data.totalRevenue || 0}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Period: ${data.startDate} to ${data.endDate}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Total Orders: ${data.totalOrders || 0}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Average Order Value: ₹${data.averageOrderValue || 0}`, 50, yPosition);
    yPosition += 30;

    // Revenue by month table
    if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
      doc.fontSize(14).text('Monthly Revenue Breakdown', 50, yPosition);
      yPosition += 20;
      
      doc.fontSize(10);
      doc.text('Month', 50, yPosition);
      doc.text('Revenue', 200, yPosition);
      doc.text('Orders', 350, yPosition);
      yPosition += 15;

      data.monthlyRevenue.forEach(item => {
        doc.text(item.month, 50, yPosition);
        doc.text(`₹${item.revenue}`, 200, yPosition);
        doc.text(item.orders.toString(), 350, yPosition);
        yPosition += 15;
      });
    }

    return yPosition + 20;
  }

  addCustomersContent(doc, data, yPosition) {
    doc.fontSize(14).text('Customer Report', 50, yPosition);
    yPosition += 30;

    doc.fontSize(12);
    doc.text(`Total Customers: ${data.totalCustomers || 0}`, 50, yPosition);
    yPosition += 20;
    doc.text(`New Customers This Month: ${data.newCustomers || 0}`, 50, yPosition);
    yPosition += 30;

    // Top customers table
    if (data.topCustomers && data.topCustomers.length > 0) {
      doc.fontSize(14).text('Top Customers', 50, yPosition);
      yPosition += 20;
      
      doc.fontSize(10);
      doc.text('Name', 50, yPosition);
      doc.text('Email', 200, yPosition);
      doc.text('Total Spent', 400, yPosition);
      yPosition += 15;

      data.topCustomers.forEach(customer => {
        doc.text(`${customer.firstName} ${customer.lastName}`, 50, yPosition);
        doc.text(customer.email, 200, yPosition);
        doc.text(`₹${customer.totalSpent}`, 400, yPosition);
        yPosition += 15;
      });
    }

    return yPosition + 20;
  }

  addProductsContent(doc, data, yPosition) {
    doc.fontSize(14).text('Product Performance Report', 50, yPosition);
    yPosition += 30;

    doc.fontSize(12);
    doc.text(`Total Products: ${data.totalProducts || 0}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Active Products: ${data.activeProducts || 0}`, 50, yPosition);
    yPosition += 30;

    // Most rented products
    if (data.mostRented && data.mostRented.length > 0) {
      doc.fontSize(14).text('Most Rented Products', 50, yPosition);
      yPosition += 20;
      
      doc.fontSize(10);
      doc.text('Product Name', 50, yPosition);
      doc.text('Category', 250, yPosition);
      doc.text('Times Rented', 400, yPosition);
      yPosition += 15;

      data.mostRented.forEach(product => {
        doc.text(product.name, 50, yPosition);
        doc.text(product.category, 250, yPosition);
        doc.text(product.timesRented.toString(), 400, yPosition);
        yPosition += 15;
      });
    }

    return yPosition + 20;
  }

  addOrdersContent(doc, data, yPosition) {
    doc.fontSize(14).text('Orders Report', 50, yPosition);
    yPosition += 30;

    doc.fontSize(12);
    doc.text(`Total Orders: ${data.totalOrders || 0}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Completed Orders: ${data.completedOrders || 0}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Pending Orders: ${data.pendingOrders || 0}`, 50, yPosition);
    yPosition += 30;

    // Recent orders
    if (data.recentOrders && data.recentOrders.length > 0) {
      doc.fontSize(14).text('Recent Orders', 50, yPosition);
      yPosition += 20;
      
      doc.fontSize(10);
      doc.text('Order No.', 50, yPosition);
      doc.text('Customer', 150, yPosition);
      doc.text('Amount', 300, yPosition);
      doc.text('Status', 400, yPosition);
      doc.text('Date', 480, yPosition);
      yPosition += 15;

      data.recentOrders.forEach(order => {
        doc.text(order.orderNumber, 50, yPosition);
        doc.text(`${order.customer.firstName} ${order.customer.lastName}`, 150, yPosition);
        doc.text(`₹${order.totalAmount}`, 300, yPosition);
        doc.text(order.status, 400, yPosition);
        doc.text(moment(order.createdAt).format('DD/MM/YY'), 480, yPosition);
        yPosition += 15;
      });
    }

    return yPosition + 20;
  }

  // Generate Excel Report
  async generateExcel(data, reportType, options = {}) {
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Rental Management System';
    workbook.lastModifiedBy = 'System';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(options.title || 'Report');

    // Header styling
    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
      alignment: { horizontal: 'center' }
    };

    // Report-specific content
    switch (reportType) {
      case 'revenue':
        this.addExcelRevenueContent(worksheet, data, headerStyle);
        break;
      case 'customers':
        this.addExcelCustomersContent(worksheet, data, headerStyle);
        break;
      case 'products':
        this.addExcelProductsContent(worksheet, data, headerStyle);
        break;
      case 'orders':
        this.addExcelOrdersContent(worksheet, data, headerStyle);
        break;
    }

    const filename = `${reportType}_${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);
    
    await workbook.xlsx.writeFile(filepath);

    return {
      filename,
      filepath,
      url: `/reports/${filename}`
    };
  }

  addExcelRevenueContent(worksheet, data, headerStyle) {
    // Title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'Revenue Report';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Summary
    worksheet.getCell('A3').value = 'Total Revenue:';
    worksheet.getCell('B3').value = data.totalRevenue || 0;
    worksheet.getCell('A4').value = 'Total Orders:';
    worksheet.getCell('B4').value = data.totalOrders || 0;
    worksheet.getCell('A5').value = 'Average Order Value:';
    worksheet.getCell('B5').value = data.averageOrderValue || 0;

    // Monthly breakdown
    if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
      let startRow = 7;
      worksheet.getCell(`A${startRow}`).value = 'Month';
      worksheet.getCell(`B${startRow}`).value = 'Revenue';
      worksheet.getCell(`C${startRow}`).value = 'Orders';
      
      ['A', 'B', 'C'].forEach(col => {
        worksheet.getCell(`${col}${startRow}`).style = headerStyle;
      });

      data.monthlyRevenue.forEach((item, index) => {
        const row = startRow + 1 + index;
        worksheet.getCell(`A${row}`).value = item.month;
        worksheet.getCell(`B${row}`).value = item.revenue;
        worksheet.getCell(`C${row}`).value = item.orders;
      });
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
  }

  addExcelCustomersContent(worksheet, data, headerStyle) {
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'Customer Report';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A3').value = 'Total Customers:';
    worksheet.getCell('B3').value = data.totalCustomers || 0;

    if (data.topCustomers && data.topCustomers.length > 0) {
      let startRow = 5;
      const headers = ['First Name', 'Last Name', 'Email', 'Total Spent', 'Orders Count'];
      
      headers.forEach((header, index) => {
        const col = String.fromCharCode(65 + index); // A, B, C, D, E
        worksheet.getCell(`${col}${startRow}`).value = header;
        worksheet.getCell(`${col}${startRow}`).style = headerStyle;
      });

      data.topCustomers.forEach((customer, index) => {
        const row = startRow + 1 + index;
        worksheet.getCell(`A${row}`).value = customer.firstName;
        worksheet.getCell(`B${row}`).value = customer.lastName;
        worksheet.getCell(`C${row}`).value = customer.email;
        worksheet.getCell(`D${row}`).value = customer.totalSpent;
        worksheet.getCell(`E${row}`).value = customer.ordersCount;
      });
    }

    worksheet.columns.forEach(column => {
      column.width = 18;
    });
  }

  addExcelProductsContent(worksheet, data, headerStyle) {
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Product Performance Report';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    if (data.mostRented && data.mostRented.length > 0) {
      let startRow = 3;
      const headers = ['Product Name', 'Category', 'SKU', 'Times Rented', 'Revenue Generated', 'Utilization %'];
      
      headers.forEach((header, index) => {
        const col = String.fromCharCode(65 + index);
        worksheet.getCell(`${col}${startRow}`).value = header;
        worksheet.getCell(`${col}${startRow}`).style = headerStyle;
      });

      data.mostRented.forEach((product, index) => {
        const row = startRow + 1 + index;
        worksheet.getCell(`A${row}`).value = product.name;
        worksheet.getCell(`B${row}`).value = product.category;
        worksheet.getCell(`C${row}`).value = product.sku;
        worksheet.getCell(`D${row}`).value = product.timesRented;
        worksheet.getCell(`E${row}`).value = product.revenue;
        worksheet.getCell(`F${row}`).value = product.utilization;
      });
    }

    worksheet.columns.forEach(column => {
      column.width = 20;
    });
  }

  addExcelOrdersContent(worksheet, data, headerStyle) {
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'Orders Report';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    if (data.recentOrders && data.recentOrders.length > 0) {
      let startRow = 3;
      const headers = ['Order Number', 'Customer', 'Email', 'Total Amount', 'Status', 'Created Date', 'Rental Period'];
      
      headers.forEach((header, index) => {
        const col = String.fromCharCode(65 + index);
        worksheet.getCell(`${col}${startRow}`).value = header;
        worksheet.getCell(`${col}${startRow}`).style = headerStyle;
      });

      data.recentOrders.forEach((order, index) => {
        const row = startRow + 1 + index;
        worksheet.getCell(`A${row}`).value = order.orderNumber;
        worksheet.getCell(`B${row}`).value = `${order.customer.firstName} ${order.customer.lastName}`;
        worksheet.getCell(`C${row}`).value = order.customer.email;
        worksheet.getCell(`D${row}`).value = order.totalAmount;
        worksheet.getCell(`E${row}`).value = order.status;
        worksheet.getCell(`F${row}`).value = moment(order.createdAt).format('DD/MM/YYYY');
        worksheet.getCell(`G${row}`).value = `${moment(order.rentalStartDate).format('DD/MM')} - ${moment(order.rentalEndDate).format('DD/MM')}`;
      });
    }

    worksheet.columns.forEach(column => {
      column.width = 18;
    });
  }

  // Generate CSV Report
  async generateCSV(data, reportType, options = {}) {
    let csvContent = '';
    
    switch (reportType) {
      case 'revenue':
        csvContent = this.generateRevenueCSV(data);
        break;
      case 'customers':
        csvContent = this.generateCustomersCSV(data);
        break;
      case 'products':
        csvContent = this.generateProductsCSV(data);
        break;
      case 'orders':
        csvContent = this.generateOrdersCSV(data);
        break;
    }

    const filename = `${reportType}_${Date.now()}.csv`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, csvContent, 'utf8');

    return {
      filename,
      filepath,
      url: `/reports/${filename}`
    };
  }

  generateRevenueCSV(data) {
    let csv = 'Revenue Report\n';
    csv += `Generated,${moment().format('DD/MM/YYYY HH:mm')}\n\n`;
    csv += `Total Revenue,₹${data.totalRevenue || 0}\n`;
    csv += `Total Orders,${data.totalOrders || 0}\n`;
    csv += `Average Order Value,₹${data.averageOrderValue || 0}\n\n`;

    if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
      csv += 'Month,Revenue,Orders\n';
      data.monthlyRevenue.forEach(item => {
        csv += `${item.month},${item.revenue},${item.orders}\n`;
      });
    }

    return csv;
  }

  generateCustomersCSV(data) {
    let csv = 'Customer Report\n';
    csv += `Generated,${moment().format('DD/MM/YYYY HH:mm')}\n\n`;
    csv += `Total Customers,${data.totalCustomers || 0}\n\n`;

    if (data.topCustomers && data.topCustomers.length > 0) {
      csv += 'First Name,Last Name,Email,Total Spent,Orders Count\n';
      data.topCustomers.forEach(customer => {
        csv += `${customer.firstName},${customer.lastName},${customer.email},${customer.totalSpent},${customer.ordersCount}\n`;
      });
    }

    return csv;
  }

  generateProductsCSV(data) {
    let csv = 'Product Performance Report\n';
    csv += `Generated,${moment().format('DD/MM/YYYY HH:mm')}\n\n`;

    if (data.mostRented && data.mostRented.length > 0) {
      csv += 'Product Name,Category,SKU,Times Rented,Revenue Generated,Utilization %\n';
      data.mostRented.forEach(product => {
        csv += `${product.name},${product.category},${product.sku},${product.timesRented},${product.revenue},${product.utilization}\n`;
      });
    }

    return csv;
  }

  generateOrdersCSV(data) {
    let csv = 'Orders Report\n';
    csv += `Generated,${moment().format('DD/MM/YYYY HH:mm')}\n\n`;

    if (data.recentOrders && data.recentOrders.length > 0) {
      csv += 'Order Number,Customer,Email,Total Amount,Status,Created Date,Rental Period\n';
      data.recentOrders.forEach(order => {
        csv += `${order.orderNumber},"${order.customer.firstName} ${order.customer.lastName}",${order.customer.email},${order.totalAmount},${order.status},${moment(order.createdAt).format('DD/MM/YYYY')},"${moment(order.rentalStartDate).format('DD/MM')} - ${moment(order.rentalEndDate).format('DD/MM')}"\n`;
      });
    }

    return csv;
  }

  // Clean up old report files
  async cleanupOldReports(daysOld = 7) {
    try {
      const files = fs.readdirSync(this.reportsDir);
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old reports:', error);
    }
  }
}

const reportService = new ReportService();
module.exports = reportService;