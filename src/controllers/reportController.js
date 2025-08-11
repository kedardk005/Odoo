const { sequelize } = require('../config/database');
const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const ProductCategory = require('../models/ProductCategory');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const reportController = {
  // Dashboard overview data
  getDashboardData: async (req, res) => {
    try {
      const { period = '30' } = req.query; // days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const dateFilter = {
        created_at: { [Op.gte]: startDate }
      };

      const [
        totalOrders,
        totalRevenue,
        activeRentals,
        totalCustomers,
        popularProducts,
        revenueByDay,
        ordersByStatus
      ] = await Promise.all([
        RentalOrder.count({ where: dateFilter }),
        RentalOrder.sum('total_amount', { where: { ...dateFilter, status: 'completed' } }),
        RentalOrder.count({ where: { status: 'in_progress' } }),
        User.count({ where: { role_id: { [Op.in]: [sequelize.literal('(SELECT role_id FROM roles WHERE role_name = \'customer\'))')] } } }),
        this.getMostRentedProducts(period),
        this.getRevenueByPeriod(period, 'day'),
        this.getOrdersByStatus(period)
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalOrders,
            totalRevenue: totalRevenue || 0,
            activeRentals,
            totalCustomers,
            averageOrderValue: totalOrders > 0 ? (totalRevenue || 0) / totalOrders : 0
          },
          popularProducts,
          revenueByDay,
          ordersByStatus,
          period: `${period} days`
        }
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: error.message
      });
    }
  },

  // Most rented products report
  getMostRentedProducts: async (period = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const results = await RentalOrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
          [sequelize.fn('COUNT', sequelize.col('RentalOrderItem.order_item_id')), 'rental_count'],
          [sequelize.fn('SUM', sequelize.literal('quantity * unit_price')), 'total_revenue']
        ],
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['product_id', 'name', 'sku_code'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['category_name']
              }
            ]
          },
          {
            model: RentalOrder,
            as: 'order',
            where: {
              created_at: { [Op.gte]: startDate },
              status: { [Op.ne]: 'cancelled' }
            },
            attributes: []
          }
        ],
        group: ['product_id', 'product.product_id', 'product.category.category_id'],
        order: [[sequelize.literal('total_quantity'), 'DESC']],
        limit: 10
      });

      return results.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        sku_code: item.product.sku_code,
        category: item.product.category?.category_name,
        total_quantity_rented: parseInt(item.dataValues.total_quantity),
        rental_count: parseInt(item.dataValues.rental_count),
        total_revenue: parseFloat(item.dataValues.total_revenue || 0)
      }));
    } catch (error) {
      console.error('Get most rented products error:', error);
      return [];
    }
  },

  // Revenue analysis by period
  getRevenueByPeriod: async (period = 30, groupBy = 'day') => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      let dateFormat;
      switch (groupBy) {
        case 'hour': dateFormat = '%Y-%m-%d %H:00:00'; break;
        case 'day': dateFormat = '%Y-%m-%d'; break;
        case 'week': dateFormat = '%Y-%u'; break;
        case 'month': dateFormat = '%Y-%m'; break;
        default: dateFormat = '%Y-%m-%d';
      }

      const results = await RentalOrder.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        where: {
          created_at: { [Op.gte]: startDate },
          status: 'completed'
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat)],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'ASC']]
      });

      return results.map(item => ({
        period: item.dataValues.period,
        order_count: parseInt(item.dataValues.order_count),
        revenue: parseFloat(item.dataValues.revenue || 0)
      }));
    } catch (error) {
      console.error('Get revenue by period error:', error);
      return [];
    }
  },

  // Orders by status analysis
  getOrdersByStatus: async (period = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const results = await RentalOrder.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        where: {
          created_at: { [Op.gte]: startDate }
        },
        group: ['status']
      });

      return results.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count),
        total_amount: parseFloat(item.dataValues.total_amount || 0)
      }));
    } catch (error) {
      console.error('Get orders by status error:', error);
      return [];
    }
  },

  // Top customers report
  getTopCustomers: async (req, res) => {
    try {
      const { period = 30, limit = 10 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const customers = await User.findAll({
        attributes: [
          'user_id',
          'full_name',
          'email',
          [sequelize.fn('COUNT', sequelize.col('orders.order_id')), 'total_orders'],
          [sequelize.fn('SUM', sequelize.col('orders.total_amount')), 'total_spent'],
          [sequelize.fn('AVG', sequelize.col('orders.total_amount')), 'avg_order_value']
        ],
        include: [
          {
            model: RentalOrder,
            as: 'orders',
            where: {
              created_at: { [Op.gte]: startDate },
              status: { [Op.ne]: 'cancelled' }
            },
            attributes: []
          }
        ],
        group: ['user_id'],
        having: sequelize.literal('total_orders > 0'),
        order: [[sequelize.literal('total_spent'), 'DESC']],
        limit: parseInt(limit)
      });

      const formattedCustomers = customers.map(customer => ({
        customer_id: customer.user_id,
        name: customer.full_name,
        email: customer.email,
        total_orders: parseInt(customer.dataValues.total_orders),
        total_spent: parseFloat(customer.dataValues.total_spent || 0),
        avg_order_value: parseFloat(customer.dataValues.avg_order_value || 0)
      }));

      res.json({
        success: true,
        data: {
          customers: formattedCustomers,
          period: `${period} days`
        }
      });
    } catch (error) {
      console.error('Get top customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top customers',
        error: error.message
      });
    }
  },

  // Revenue overview with detailed breakdown
  getRevenueOverview: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const [
        totalRevenue,
        totalOrders,
        revenueByCategory,
        revenueByMonth,
        paymentMethodAnalysis
      ] = await Promise.all([
        RentalOrder.sum('total_amount', { where: { ...dateFilter, status: 'completed' } }),
        RentalOrder.count({ where: { ...dateFilter, status: 'completed' } }),
        this.getRevenueByCategory(dateFilter),
        this.getMonthlyRevenue(dateFilter),
        this.getPaymentMethodAnalysis(dateFilter)
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalRevenue: totalRevenue || 0,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? (totalRevenue || 0) / totalOrders : 0
          },
          revenueByCategory,
          revenueByMonth,
          paymentMethodAnalysis,
          period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
        }
      });
    } catch (error) {
      console.error('Get revenue overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get revenue overview',
        error: error.message
      });
    }
  },

  // Revenue by category
  getRevenueByCategory: async (dateFilter = {}) => {
    try {
      const results = await RentalOrderItem.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.literal('quantity * unit_price')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('RentalOrderItem.order_item_id')), 'order_count']
        ],
        include: [
          {
            model: Product,
            as: 'product',
            attributes: [],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['category_id', 'category_name']
              }
            ]
          },
          {
            model: RentalOrder,
            as: 'order',
            where: { ...dateFilter, status: 'completed' },
            attributes: []
          }
        ],
        group: ['product.category.category_id'],
        order: [[sequelize.literal('revenue'), 'DESC']]
      });

      return results.map(item => ({
        category_id: item.product.category.category_id,
        category_name: item.product.category.category_name,
        revenue: parseFloat(item.dataValues.revenue || 0),
        order_count: parseInt(item.dataValues.order_count)
      }));
    } catch (error) {
      console.error('Get revenue by category error:', error);
      return [];
    }
  },

  // Monthly revenue analysis
  getMonthlyRevenue: async (dateFilter = {}) => {
    try {
      const results = await RentalOrder.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'order_count']
        ],
        where: { ...dateFilter, status: 'completed' },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']]
      });

      return results.map(item => ({
        month: item.dataValues.month,
        revenue: parseFloat(item.dataValues.revenue || 0),
        order_count: parseInt(item.dataValues.order_count)
      }));
    } catch (error) {
      console.error('Get monthly revenue error:', error);
      return [];
    }
  },

  // Payment method analysis
  getPaymentMethodAnalysis: async (dateFilter = {}) => {
    try {
      const results = await Payment.findAll({
        attributes: [
          'method',
          [sequelize.fn('COUNT', sequelize.col('payment_id')), 'transaction_count'],
          [sequelize.fn('SUM', sequelize.col('payment_amount')), 'total_amount']
        ],
        include: [
          {
            model: Invoice,
            as: 'invoice',
            include: [
              {
                model: RentalOrder,
                as: 'order',
                where: dateFilter,
                attributes: []
              }
            ],
            attributes: []
          }
        ],
        where: { status: 'success' },
        group: ['method'],
        order: [[sequelize.literal('total_amount'), 'DESC']]
      });

      return results.map(item => ({
        payment_method: item.method,
        transaction_count: parseInt(item.dataValues.transaction_count),
        total_amount: parseFloat(item.dataValues.total_amount || 0)
      }));
    } catch (error) {
      console.error('Get payment method analysis error:', error);
      return [];
    }
  },

  // Export report to Excel
  exportToExcel: async (req, res) => {
    try {
      const { report_type, startDate, endDate } = req.query;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      let data = [];
      let columns = [];

      switch (report_type) {
        case 'revenue':
          data = await this.getRevenueByCategory({ 
            created_at: startDate && endDate ? { [Op.between]: [new Date(startDate), new Date(endDate)] } : {}
          });
          columns = [
            { header: 'Category', key: 'category_name', width: 20 },
            { header: 'Revenue', key: 'revenue', width: 15 },
            { header: 'Order Count', key: 'order_count', width: 15 }
          ];
          break;

        case 'products':
          data = await this.getMostRentedProducts(30);
          columns = [
            { header: 'Product Name', key: 'product_name', width: 25 },
            { header: 'SKU', key: 'sku_code', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Total Quantity', key: 'total_quantity_rented', width: 15 },
            { header: 'Rental Count', key: 'rental_count', width: 15 },
            { header: 'Total Revenue', key: 'total_revenue', width: 15 }
          ];
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }

      worksheet.columns = columns;
      worksheet.addRows(data);

      // Style the header
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6FA' }
        };
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${report_type}_report.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Export to Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error.message
      });
    }
  },

  // Export report to PDF
  exportToPDF: async (req, res) => {
    try {
      const { report_type, startDate, endDate } = req.query;

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report_type}_report.pdf"`);

      doc.pipe(res);

      // Title
      doc.fontSize(20).text('Rental Management Report', 100, 100);
      doc.fontSize(12).text(`Report Type: ${report_type}`, 100, 130);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 100, 150);

      let yPosition = 200;

      switch (report_type) {
        case 'revenue':
          const revenueData = await this.getRevenueByCategory({
            created_at: startDate && endDate ? { [Op.between]: [new Date(startDate), new Date(endDate)] } : {}
          });
          
          doc.text('Revenue by Category', 100, yPosition);
          yPosition += 30;

          revenueData.forEach((item, index) => {
            doc.text(`${item.category_name}: $${item.revenue.toFixed(2)} (${item.order_count} orders)`, 100, yPosition);
            yPosition += 20;
          });
          break;

        case 'products':
          const productData = await this.getMostRentedProducts(30);
          
          doc.text('Most Rented Products', 100, yPosition);
          yPosition += 30;

          productData.forEach((item, index) => {
            doc.text(`${item.product_name} (${item.sku_code}): ${item.total_quantity_rented} units, $${item.total_revenue.toFixed(2)}`, 100, yPosition);
            yPosition += 20;
          });
          break;
      }

      doc.end();
    } catch (error) {
      console.error('Export to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error.message
      });
    }
  },

  // Get inventory utilization report
  getInventoryUtilization: async (req, res) => {
    try {
      const { period = 30 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const utilizationData = await sequelize.query(`
        SELECT 
          p.product_id,
          p.name,
          p.sku_code,
          pi.quantity_available,
          COALESCE(rental_stats.total_rented, 0) as total_rented,
          COALESCE(rental_stats.rental_days, 0) as rental_days,
          CASE 
            WHEN pi.quantity_available > 0 
            THEN (COALESCE(rental_stats.total_rented, 0) * 100.0 / pi.quantity_available)
            ELSE 0 
          END as utilization_percentage
        FROM products p
        LEFT JOIN product_inventory pi ON p.product_id = pi.product_id
        LEFT JOIN (
          SELECT 
            roi.product_id,
            SUM(roi.quantity) as total_rented,
            COUNT(DISTINCT ro.order_id) as rental_count,
            SUM(DATEDIFF(COALESCE(ro.return_date, NOW()), ro.pickup_date)) as rental_days
          FROM rental_order_items roi
          JOIN rental_orders ro ON roi.order_id = ro.order_id
          WHERE ro.created_at >= :startDate
          AND ro.status != 'cancelled'
          GROUP BY roi.product_id
        ) rental_stats ON p.product_id = rental_stats.product_id
        WHERE p.is_rentable = true
        ORDER BY utilization_percentage DESC
      `, {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          utilization_data: utilizationData,
          period: `${period} days`,
          summary: {
            total_products: utilizationData.length,
            high_utilization: utilizationData.filter(item => item.utilization_percentage > 70).length,
            low_utilization: utilizationData.filter(item => item.utilization_percentage < 30).length
          }
        }
      });
    } catch (error) {
      console.error('Get inventory utilization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory utilization report',
        error: error.message
      });
    }
  }
};

module.exports = reportController;