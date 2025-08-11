const Pricelist = require('../models/Pricelist');
const PricelistItem = require('../models/PricelistItem');
const PricingRule = require('../models/PricingRule');
const Product = require('../models/Product');
const ProductUnit = require('../models/ProductUnit');
const ProductCategory = require('../models/ProductCategory');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const pricelistController = {
  // Get all pricelists
  getAllPricelists: async (req, res) => {
    try {
      const { page = 1, limit = 10, customer_group } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (customer_group) whereClause.customer_group = customer_group;

      const pricelists = await Pricelist.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: PricelistItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'sku_code']
              },
              {
                model: ProductUnit,
                as: 'unit',
                attributes: ['unit_id', 'unit_name']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['pricelist_id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          pricelists: pricelists.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(pricelists.count / limit),
            totalItems: pricelists.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all pricelists error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pricelists',
        error: error.message
      });
    }
  },

  // Create new pricelist
  createPricelist: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { name, description, customer_group, start_date, end_date, items } = req.body;

      if (!name) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Pricelist name is required'
        });
      }

      // Create pricelist
      const pricelist = await Pricelist.create({
        name,
        description,
        customer_group,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null
      }, { transaction });

      // Add pricelist items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const finalPrice = this.calculateFinalPrice(
            item.base_price,
            item.discount_percentage,
            item.discount_amount
          );

          await PricelistItem.create({
            pricelist_id: pricelist.pricelist_id,
            product_id: item.product_id,
            unit_id: item.unit_id,
            base_price: item.base_price,
            discount_percentage: item.discount_percentage || 0,
            discount_amount: item.discount_amount || 0,
            final_price: finalPrice,
            min_quantity: item.min_quantity || 1,
            max_quantity: item.max_quantity,
            is_active: item.is_active !== undefined ? item.is_active : true
          }, { transaction });
        }
      }

      await transaction.commit();

      // Fetch created pricelist with items
      const createdPricelist = await Pricelist.findByPk(pricelist.pricelist_id, {
        include: [
          {
            model: PricelistItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'sku_code']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Pricelist created successfully',
        data: { pricelist: createdPricelist }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create pricelist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create pricelist',
        error: error.message
      });
    }
  },

  // Calculate rental price for a product
  calculateRentalPrice: async (req, res) => {
    try {
      const { product_id, rental_duration, rental_period_type, quantity, customer_group } = req.body;

      if (!product_id || !rental_duration) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and rental duration are required'
        });
      }

      // Find applicable pricelist for customer group
      const pricelist = await Pricelist.findOne({
        where: {
          customer_group: customer_group || 'general',
          [Op.or]: [
            { start_date: null, end_date: null },
            {
              start_date: { [Op.lte]: new Date() },
              end_date: { [Op.gte]: new Date() }
            }
          ]
        },
        include: [
          {
            model: PricelistItem,
            as: 'items',
            where: { product_id, is_active: true }
          }
        ]
      });

      let basePrice = 0;
      let discountPercentage = 0;
      let discountAmount = 0;

      if (pricelist && pricelist.items.length > 0) {
        const item = pricelist.items[0];
        basePrice = parseFloat(item.base_price);
        discountPercentage = parseFloat(item.discount_percentage);
        discountAmount = parseFloat(item.discount_amount);
      } else {
        // Fallback to product base price
        const product = await Product.findByPk(product_id);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
        basePrice = parseFloat(product.base_price) || 0;
      }

      // Apply duration multiplier
      const durationMultiplier = this.getDurationMultiplier(rental_period_type, rental_duration);
      const totalPrice = basePrice * durationMultiplier * (quantity || 1);

      // Apply discounts
      let finalPrice = totalPrice;
      if (discountPercentage > 0) {
        finalPrice = totalPrice * (1 - discountPercentage / 100);
      }
      if (discountAmount > 0) {
        finalPrice = Math.max(0, finalPrice - discountAmount);
      }

      res.json({
        success: true,
        data: {
          product_id,
          rental_duration,
          rental_period_type,
          quantity: quantity || 1,
          basePrice,
          durationMultiplier,
          subtotal: totalPrice,
          discountPercentage,
          discountAmount,
          finalPrice: parseFloat(finalPrice.toFixed(2)),
          priceBreakdown: {
            basePrice,
            totalBeforeDiscount: totalPrice,
            discountApplied: totalPrice - finalPrice,
            finalAmount: finalPrice
          }
        }
      });
    } catch (error) {
      console.error('Calculate rental price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate rental price',
        error: error.message
      });
    }
  },

  // Get pricing rules for a product
  getProductPricing: async (req, res) => {
    try {
      const { productId } = req.params;
      const { customer_group } = req.query;

      const product = await Product.findByPk(productId, {
        include: [
          {
            model: ProductCategory,
            as: 'category'
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Get all applicable pricing rules
      const pricingRules = await PricingRule.findAll({
        where: { product_id: productId },
        include: [
          {
            model: Pricelist,
            as: 'pricelist',
            where: {
              [Op.or]: [
                { customer_group: customer_group || 'general' },
                { customer_group: null }
              ]
            }
          },
          {
            model: ProductUnit,
            as: 'unit'
          }
        ]
      });

      // Get pricelist items
      const pricelistItems = await PricelistItem.findAll({
        where: { product_id: productId, is_active: true },
        include: [
          {
            model: Pricelist,
            as: 'pricelist',
            where: {
              [Op.or]: [
                { customer_group: customer_group || 'general' },
                { customer_group: null }
              ]
            }
          },
          {
            model: ProductUnit,
            as: 'unit'
          }
        ]
      });

      // Generate pricing tiers
      const pricingTiers = this.generatePricingTiers(product, pricingRules, pricelistItems);

      res.json({
        success: true,
        data: {
          product: {
            id: product.product_id,
            name: product.name,
            sku_code: product.sku_code,
            base_price: product.base_price,
            category: product.category?.category_name
          },
          pricingRules,
          pricelistItems,
          pricingTiers,
          availableUnits: await ProductUnit.findAll({ attributes: ['unit_id', 'unit_name'] })
        }
      });
    } catch (error) {
      console.error('Get product pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product pricing',
        error: error.message
      });
    }
  },

  // Bulk update pricing
  bulkUpdatePricing: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { updates, apply_to } = req.body; // updates: [{ product_id, price_change, discount_percentage }]

      if (!updates || !Array.isArray(updates)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      const results = [];

      for (const update of updates) {
        const { product_id, price_change_percentage, discount_percentage, customer_group } = update;

        // Update pricelist items
        if (apply_to === 'pricelist_items') {
          const items = await PricelistItem.findAll({
            where: { 
              product_id,
              is_active: true
            },
            include: [
              {
                model: Pricelist,
                as: 'pricelist',
                where: customer_group ? { customer_group } : {}
              }
            ],
            transaction
          });

          for (const item of items) {
            let newPrice = parseFloat(item.base_price);
            
            if (price_change_percentage) {
              newPrice = newPrice * (1 + price_change_percentage / 100);
            }

            const finalPrice = this.calculateFinalPrice(
              newPrice,
              discount_percentage || item.discount_percentage,
              item.discount_amount
            );

            await item.update({
              base_price: newPrice,
              discount_percentage: discount_percentage || item.discount_percentage,
              final_price: finalPrice
            }, { transaction });

            results.push({
              product_id,
              item_id: item.item_id,
              old_price: parseFloat(item.base_price),
              new_price: newPrice,
              final_price: finalPrice
            });
          }
        }

        // Update product base prices
        if (apply_to === 'products') {
          const product = await Product.findByPk(product_id, { transaction });
          if (product) {
            const oldPrice = parseFloat(product.base_price) || 0;
            const newPrice = oldPrice * (1 + (price_change_percentage || 0) / 100);

            await product.update({
              base_price: newPrice
            }, { transaction });

            results.push({
              product_id,
              old_base_price: oldPrice,
              new_base_price: newPrice
            });
          }
        }
      }

      await transaction.commit();

      res.json({
        success: true,
        message: 'Bulk pricing update completed successfully',
        data: {
          updated_count: results.length,
          results
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Bulk update pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update pricing',
        error: error.message
      });
    }
  },

  // Helper methods
  calculateFinalPrice: (basePrice, discountPercentage = 0, discountAmount = 0) => {
    let finalPrice = parseFloat(basePrice);
    
    if (discountPercentage > 0) {
      finalPrice = finalPrice * (1 - discountPercentage / 100);
    }
    
    if (discountAmount > 0) {
      finalPrice = Math.max(0, finalPrice - discountAmount);
    }
    
    return parseFloat(finalPrice.toFixed(2));
  },

  getDurationMultiplier: (periodType, duration) => {
    const multipliers = {
      'hour': 1,
      'day': 24,
      'week': 24 * 7,
      'month': 24 * 30,
      'year': 24 * 365
    };
    
    const baseMultiplier = multipliers[periodType] || 24;
    return baseMultiplier * duration;
  },

  generatePricingTiers: (product, pricingRules, pricelistItems) => {
    const tiers = [];
    const basePrice = parseFloat(product.base_price) || 0;

    // Common duration periods
    const periods = [
      { type: 'hour', duration: 1, label: '1 Hour' },
      { type: 'day', duration: 1, label: '1 Day' },
      { type: 'day', duration: 7, label: '1 Week' },
      { type: 'day', duration: 30, label: '1 Month' },
      { type: 'day', duration: 365, label: '1 Year' }
    ];

    for (const period of periods) {
      const multiplier = pricelistController.getDurationMultiplier(period.type, period.duration);
      let price = basePrice * multiplier;

      // Apply any applicable discounts from pricelist items
      const applicableItem = pricelistItems.find(item => item.is_active);
      if (applicableItem) {
        price = pricelistController.calculateFinalPrice(
          price,
          applicableItem.discount_percentage,
          applicableItem.discount_amount
        );
      }

      tiers.push({
        period: period.label,
        type: period.type,
        duration: period.duration,
        price: price,
        savings: basePrice * multiplier - price
      });
    }

    return tiers;
  },

  // Get seasonal pricing recommendations
  getSeasonalPricing: async (req, res) => {
    try {
      const { category_id, start_date, end_date } = req.query;

      const activeSeasonalPricelists = await Pricelist.findAll({
        where: {
          start_date: { [Op.lte]: new Date(end_date || Date.now()) },
          end_date: { [Op.gte]: new Date(start_date || Date.now()) }
        },
        include: [
          {
            model: PricelistItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                where: category_id ? { category_id } : {}
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        data: {
          seasonal_pricelists: activeSeasonalPricelists,
          recommendations: {
            peak_season_markup: '15-25%',
            off_season_discount: '10-20%',
            holiday_premium: '20-30%'
          }
        }
      });
    } catch (error) {
      console.error('Get seasonal pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch seasonal pricing',
        error: error.message
      });
    }
  }
};

module.exports = pricelistController;