const { Op } = require('sequelize');
const Product = require('../models/Product');
const { validateRequired, validatePrice, validateQuantity, validateSKU, validateImageFile } = require('../utils/validation');
const fs = require('fs').promises;
const path = require('path');

const productController = {
  // Get all products with filters and pagination
  getAllProducts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        minPrice,
        maxPrice,
        available = true,
        search,
        sortBy = 'createdAt',
        order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {
        is_rentable: true
      };

      if (available === 'true') {
        whereClause.availableQuantity = { [Op.gt]: 0 };
      }

      if (category) {
        whereClause.category = category;
      }

      if (minPrice || maxPrice) {
        whereClause.basePrice = {};
        if (minPrice) whereClause.basePrice[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.basePrice[Op.lte] = parseFloat(maxPrice);
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { category: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.contains]: [search] } }
        ];
      }

      const { count, rows: products } = await Product.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy === 'createdAt' ? 'created_at' : sortBy, order.toUpperCase()]],
        attributes: {
          exclude: ['created_at', 'updated_at']
        }
      });

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findByPk(id);

      if (!product || !product.is_rentable) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message
      });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        sku,
        totalQuantity,
        basePrice,
        hourlyRate,
        dailyRate,
        weeklyRate,
        monthlyRate,
        yearlyRate,
        securityDeposit,
        lateFeePerDay,
        minRentalDuration,
        maxRentalDuration,
        rentalUnit,
        specifications,
        condition,
        location,
        tags
      } = req.body;

      // Validation
      const requiredFields = ['name', 'category', 'sku', 'totalQuantity', 'basePrice'];
      const missing = validateRequired(requiredFields, req.body);
      
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missing.join(', ')}`
        });
      }

      if (!validateSKU(sku)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SKU format. Use alphanumeric characters, hyphens, and underscores only (3-20 chars)'
        });
      }

      if (!validatePrice(basePrice)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid base price'
        });
      }

      if (!validateQuantity(totalQuantity)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }

      // Check if SKU already exists
      const existingSKU = await Product.findOne({ where: { sku } });
      if (existingSKU) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }

      // Handle image uploads
      let images = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const validation = validateImageFile(file);
          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              message: validation.message
            });
          }
          images.push(`/uploads/products/${file.filename}`);
        }
      }

      // Create product
      const product = await Product.create({
        name,
        description,
        category,
        sku: sku.toUpperCase(),
        totalQuantity: parseInt(totalQuantity),
        availableQuantity: parseInt(totalQuantity),
        basePrice: parseFloat(basePrice),
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        dailyRate: dailyRate ? parseFloat(dailyRate) : null,
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : null,
        monthlyRate: monthlyRate ? parseFloat(monthlyRate) : null,
        yearlyRate: yearlyRate ? parseFloat(yearlyRate) : null,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
        lateFeePerDay: lateFeePerDay ? parseFloat(lateFeePerDay) : 0,
        minRentalDuration: minRentalDuration ? parseInt(minRentalDuration) : 1,
        maxRentalDuration: maxRentalDuration ? parseInt(maxRentalDuration) : 8760,
        rentalUnit: rentalUnit || 'day',
        images,
        specifications: specifications ? JSON.parse(specifications) : {},
        condition: condition || 'good',
        location,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : []
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const {
        name,
        description,
        category,
        sku,
        totalQuantity,
        basePrice,
        hourlyRate,
        dailyRate,
        weeklyRate,
        monthlyRate,
        yearlyRate,
        securityDeposit,
        lateFeePerDay,
        minRentalDuration,
        maxRentalDuration,
        rentalUnit,
        specifications,
        condition,
        location,
        tags
      } = req.body;

      // Validate SKU if changed
      if (sku && sku !== product.sku) {
        if (!validateSKU(sku)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid SKU format'
          });
        }

        const existingSKU = await Product.findOne({ 
          where: { 
            sku: sku.toUpperCase(),
            id: { [Op.ne]: id }
          }
        });
        
        if (existingSKU) {
          return res.status(400).json({
            success: false,
            message: 'SKU already exists'
          });
        }
      }

      // Handle new image uploads
      let newImages = [...(product.images || [])];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const validation = validateImageFile(file);
          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              message: validation.message
            });
          }
          newImages.push(`/uploads/products/${file.filename}`);
        }
      }

      const updateData = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (sku !== undefined) updateData.sku = sku.toUpperCase();
      if (totalQuantity !== undefined) {
        updateData.totalQuantity = parseInt(totalQuantity);
        // Adjust available quantity proportionally
        const usedQuantity = product.totalQuantity - product.availableQuantity;
        updateData.availableQuantity = Math.max(0, parseInt(totalQuantity) - usedQuantity);
      }
      if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
      if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate ? parseFloat(hourlyRate) : null;
      if (dailyRate !== undefined) updateData.dailyRate = dailyRate ? parseFloat(dailyRate) : null;
      if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate ? parseFloat(weeklyRate) : null;
      if (monthlyRate !== undefined) updateData.monthlyRate = monthlyRate ? parseFloat(monthlyRate) : null;
      if (yearlyRate !== undefined) updateData.yearlyRate = yearlyRate ? parseFloat(yearlyRate) : null;
      if (securityDeposit !== undefined) updateData.securityDeposit = parseFloat(securityDeposit);
      if (lateFeePerDay !== undefined) updateData.lateFeePerDay = parseFloat(lateFeePerDay);
      if (minRentalDuration !== undefined) updateData.minRentalDuration = parseInt(minRentalDuration);
      if (maxRentalDuration !== undefined) updateData.maxRentalDuration = parseInt(maxRentalDuration);
      if (rentalUnit !== undefined) updateData.rentalUnit = rentalUnit;
      if (specifications !== undefined) updateData.specifications = JSON.parse(specifications);
      if (condition !== undefined) updateData.condition = condition;
      if (location !== undefined) updateData.location = location;
      if (tags !== undefined) updateData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;

      updateData.images = newImages;

      await product.update(updateData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

          // Soft delete by setting is_rentable to false
    await product.update({ is_rentable: false });

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }
  },

  // Update product status
  updateProductStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { is_rentable } = req.body;

      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updateData = {};
      if (is_rentable !== undefined) updateData.is_rentable = is_rentable;
      if (isRentable !== undefined) updateData.isRentable = isRentable;

      await product.update(updateData);

      res.json({
        success: true,
        message: 'Product status updated successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Update product status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product status',
        error: error.message
      });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice, available = true } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const whereClause = {
        is_rentable: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { category: { [Op.iLike]: `%${q}%` } },
          { tags: { [Op.contains]: [q] } }
        ]
      };

      if (available === 'true') {
        whereClause.availableQuantity = { [Op.gt]: 0 };
      }

      if (category) {
        whereClause.category = category;
      }

      if (minPrice || maxPrice) {
        whereClause.basePrice = {};
        if (minPrice) whereClause.basePrice[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.basePrice[Op.lte] = parseFloat(maxPrice);
      }

      const products = await Product.findAll({
        where: whereClause,
        limit: 20,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'description', 'category', 'basePrice', 'images', 'availableQuantity']
      });

      res.json({
        success: true,
        data: { 
          products,
          totalFound: products.length
        }
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search products',
        error: error.message
      });
    }
  },

  // Get categories
  getCategories: async (req, res) => {
    try {
      const ProductCategory = require('../models/ProductCategory');
      
      const categories = await ProductCategory.findAll({
        attributes: ['category_id', 'category_name', 'description'],
        raw: true
      });

      const categoryList = categories.map(item => ({
        id: item.category_id,
        name: item.category_name,
        description: item.description
      }));

      res.json({
        success: true,
        data: { categories: categoryList }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      const { limit = 6 } = req.query;

      const products = await Product.findAll({
        where: {
          is_rentable: true
        },
        order: [
          ['created_at', 'DESC']
        ],
        limit: parseInt(limit),
        attributes: {
          exclude: ['created_at', 'updated_at']
        }
      });

      res.json({
        success: true,
        data: { products }
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured products',
        error: error.message
      });
    }
  },

  // Check availability
  checkAvailability: async (req, res) => {
    try {
      const { productId, startDate, endDate, quantity = 1 } = req.query;

      if (!productId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, start date, and end date are required'
        });
      }

      const product = await Product.findByPk(productId);

      if (!product || !product.is_rentable) {
        return res.status(404).json({
          success: false,
          message: 'Product not available for rental'
        });
      }

      // TODO: Check existing reservations for the date range
      // This would involve querying OrderItems for the product in the date range
      
      const isAvailable = product.availableQuantity >= parseInt(quantity);

      res.json({
        success: true,
        data: {
          available: isAvailable,
          availableQuantity: product.availableQuantity,
          requestedQuantity: parseInt(quantity),
          productName: product.name
        }
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: error.message
      });
    }
  },

  // Upload product images
  uploadProductImages: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided'
        });
      }

      let newImages = [...(product.images || [])];
      
      for (const file of req.files) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: validation.message
          });
        }
        newImages.push(`/uploads/products/${file.filename}`);
      }

      await product.update({ images: newImages });

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: { 
          product,
          uploadedImages: req.files.length
        }
      });
    } catch (error) {
      console.error('Upload images error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  },

  // Delete product image
  deleteProductImage: async (req, res) => {
    try {
      const { id, imageId } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const imageIndex = parseInt(imageId);
      if (imageIndex < 0 || imageIndex >= product.images.length) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      const imagePath = product.images[imageIndex];
      const newImages = product.images.filter((_, index) => index !== imageIndex);

      await product.update({ images: newImages });

      // Try to delete the physical file
      try {
        const fullPath = path.join(process.cwd(), 'uploads', 'products', path.basename(imagePath));
        await fs.unlink(fullPath);
      } catch (fileError) {
        console.warn('Could not delete image file:', fileError.message);
      }

      res.json({
        success: true,
        message: 'Image deleted successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message
      });
    }
  },

  // Get product inventory
  getProductInventory: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          totalQuantity: product.totalQuantity,
          availableQuantity: product.availableQuantity,
          reservedQuantity: product.reservedQuantity,
          utilizationRate: ((product.totalQuantity - product.availableQuantity) / product.totalQuantity * 100).toFixed(2)
        }
      });
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory',
        error: error.message
      });
    }
  },

  // Update inventory
  updateInventory: async (req, res) => {
    try {
      const { id } = req.params;
      const { totalQuantity, availableQuantity, notes } = req.body;

      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updateData = {};
      
      if (totalQuantity !== undefined) {
        if (!validateQuantity(totalQuantity)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid total quantity'
          });
        }
        updateData.totalQuantity = parseInt(totalQuantity);
      }

      if (availableQuantity !== undefined) {
        if (!validateQuantity(availableQuantity)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid available quantity'
          });
        }
        
        if (availableQuantity > (updateData.totalQuantity || product.totalQuantity)) {
          return res.status(400).json({
            success: false,
            message: 'Available quantity cannot exceed total quantity'
          });
        }
        
        updateData.availableQuantity = parseInt(availableQuantity);
        updateData.reservedQuantity = (updateData.totalQuantity || product.totalQuantity) - parseInt(availableQuantity);
      }

      await product.update(updateData);

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: { 
          product,
          notes
        }
      });
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory',
        error: error.message
      });
    }
  },

  // Get product reservations
  getProductReservations: async (req, res) => {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;
      
      const RentalOrderItem = require('../models/RentalOrderItem');
      const RentalOrder = require('../models/RentalOrder');
      const User = require('../models/User');
      
      let whereClause = {
        product_id: id,
        '$order.status$': {
          [Op.in]: ['confirmed', 'in_progress']
        }
      };

      if (start_date && end_date) {
        whereClause[Op.and] = [
          {
            start_date: { [Op.lte]: new Date(end_date) }
          },
          {
            end_date: { [Op.gte]: new Date(start_date) }
          }
        ];
      }

      const reservations = await RentalOrderItem.findAll({
        where: whereClause,
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [
              {
                model: User,
                as: 'customer',
                attributes: ['user_id', 'full_name', 'phone_number']
              }
            ]
          }
        ],
        order: [['start_date', 'ASC']]
      });
      
      res.json({
        success: true,
        data: {
          productId: id,
          reservations: reservations.map(item => ({
            order_id: item.order_id,
            customer: item.order.customer.full_name,
            phone: item.order.customer.phone_number,
            quantity: item.quantity,
            start_date: item.start_date,
            end_date: item.end_date,
            status: item.order.status
          }))
        }
      });
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservations',
        error: error.message
      });
    }
  },

  // Configure rental settings for product
  configureRentalSettings: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        rental_units,
        min_rental_period,
        max_rental_period,
        rental_price_per_unit,
        requires_deposit,
        deposit_amount,
        late_fee_per_day
      } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updateData = {};
      if (rental_units) updateData.rental_units = rental_units;
      if (min_rental_period) updateData.min_rental_period = parseInt(min_rental_period);
      if (max_rental_period) updateData.max_rental_period = parseInt(max_rental_period);
      if (rental_price_per_unit) updateData.rental_price_per_unit = parseFloat(rental_price_per_unit);
      if (requires_deposit !== undefined) updateData.requires_deposit = requires_deposit;
      if (deposit_amount) updateData.deposit_amount = parseFloat(deposit_amount);
      if (late_fee_per_day) updateData.late_fee_per_day = parseFloat(late_fee_per_day);

      await product.update(updateData);

      res.json({
        success: true,
        message: 'Rental settings updated successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Configure rental settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to configure rental settings',
        error: error.message
      });
    }
  },

  // Get rental pricing for product
  getRentalPricing: async (req, res) => {
    try {
      const { id } = req.params;
      const { duration, period_type, customer_group } = req.query;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Calculate pricing based on duration and period type
      let basePrice = parseFloat(product.rental_price_per_unit) || parseFloat(product.base_price) || 0;
      let totalPrice = basePrice;

      if (duration && period_type) {
        // Duration multiplier based on period type
        const multipliers = {
          'hour': 1,
          'day': product.rental_units === 'hour' ? 24 : 1,
          'week': product.rental_units === 'day' ? 7 : (product.rental_units === 'hour' ? 168 : 1),
          'month': product.rental_units === 'day' ? 30 : (product.rental_units === 'hour' ? 720 : 1),
          'year': product.rental_units === 'day' ? 365 : (product.rental_units === 'hour' ? 8760 : 1)
        };

        const multiplier = multipliers[period_type] || 1;
        totalPrice = basePrice * multiplier * parseInt(duration);
      }

      // Check for applicable discounts based on customer group or duration
      let discount = 0;
      if (parseInt(duration) >= 7) discount = 0.05; // 5% for weekly rentals
      if (parseInt(duration) >= 30) discount = 0.10; // 10% for monthly rentals

      const discountAmount = totalPrice * discount;
      const finalPrice = totalPrice - discountAmount;

      res.json({
        success: true,
        data: {
          product_id: id,
          product_name: product.name,
          base_price_per_unit: basePrice,
          rental_duration: duration,
          rental_period_type: period_type,
          subtotal: totalPrice,
          discount_percentage: discount * 100,
          discount_amount: discountAmount,
          final_price: finalPrice,
          deposit_required: product.requires_deposit,
          deposit_amount: parseFloat(product.deposit_amount) || 0,
          late_fee_per_day: parseFloat(product.late_fee_per_day) || 0
        }
      });
    } catch (error) {
      console.error('Get rental pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate rental pricing',
        error: error.message
      });
    }
  },

  // Get availability calendar for product
  getAvailabilityCalendar: async (req, res) => {
    try {
      const { id } = req.params;
      const { start_date, end_date, view_type = 'month' } = req.query;

      const productAvailabilityController = require('./productAvailabilityController');
      
      // Redirect to the specialized availability controller
      req.query.product_id = id;
      return await productAvailabilityController.getProductAvailabilityCalendar(req, res);
    } catch (error) {
      console.error('Get availability calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch availability calendar',
        error: error.message
      });
    }
  },

  // Check detailed availability for date range
  checkDetailedAvailability: async (req, res) => {
    try {
      const { id } = req.params;
      const { start_date, end_date, quantity = 1 } = req.body;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const productAvailabilityController = require('./productAvailabilityController');
      
      // Use the specialized availability controller
      req.body.product_id = id;
      return await productAvailabilityController.checkAvailability(req, res);
    } catch (error) {
      console.error('Check detailed availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: error.message
      });
    }
  }
};

module.exports = productController;