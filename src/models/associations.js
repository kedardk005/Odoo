const User = require('./User');
const Role = require('./Role');
const Product = require('./Product');
const ProductCategory = require('./ProductCategory');
const ProductUnit = require('./ProductUnit');
const ProductInventory = require('./ProductInventory');
const Pricelist = require('./Pricelist');
const PricelistItem = require('./PricelistItem');
const PricingRule = require('./PricingRule');
const RentalQuotation = require('./RentalQuotation');
const RentalOrder = require('./RentalOrder');
const RentalOrderItem = require('./RentalOrderItem');
const Pickup = require('./Pickup');
const Return = require('./Return');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const Notification = require('./Notification');
const UserNotificationPreference = require('./UserNotificationPreference');
const AuditLog = require('./AuditLog');

const setupAssociations = () => {
  // User and Role associations
  Role.hasMany(User, { 
    foreignKey: 'role_id', 
    as: 'users' 
  });
  User.belongsTo(Role, { 
    foreignKey: 'role_id', 
    as: 'role' 
  });

  // User and Notification Preference associations
  User.hasOne(UserNotificationPreference, { 
    foreignKey: 'user_id', 
    as: 'notificationPreference' 
  });
  UserNotificationPreference.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });

  // Product and Category associations
  ProductCategory.hasMany(Product, { 
    foreignKey: 'category_id', 
    as: 'products' 
  });
  Product.belongsTo(ProductCategory, { 
    foreignKey: 'category_id', 
    as: 'category' 
  });

  // Product and Inventory associations
  Product.hasMany(ProductInventory, { 
    foreignKey: 'product_id', 
    as: 'inventory' 
  });
  ProductInventory.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });

  // Pricelist and PricingRule associations
  Pricelist.hasMany(PricingRule, { 
    foreignKey: 'pricelist_id', 
    as: 'rules' 
  });
  PricingRule.belongsTo(Pricelist, { 
    foreignKey: 'pricelist_id', 
    as: 'pricelist' 
  });

  // Pricelist and PricelistItem associations
  Pricelist.hasMany(PricelistItem, { 
    foreignKey: 'pricelist_id', 
    as: 'items' 
  });
  PricelistItem.belongsTo(Pricelist, { 
    foreignKey: 'pricelist_id', 
    as: 'pricelist' 
  });

  // PricelistItem with Product and Unit
  Product.hasMany(PricelistItem, { 
    foreignKey: 'product_id', 
    as: 'pricelistItems' 
  });
  PricelistItem.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });

  ProductUnit.hasMany(PricelistItem, { 
    foreignKey: 'unit_id', 
    as: 'pricelistItems' 
  });
  PricelistItem.belongsTo(ProductUnit, { 
    foreignKey: 'unit_id', 
    as: 'unit' 
  });

  // PricingRule with Product and Unit
  Product.hasMany(PricingRule, { 
    foreignKey: 'product_id', 
    as: 'pricingRules' 
  });
  PricingRule.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });

  ProductUnit.hasMany(PricingRule, { 
    foreignKey: 'unit_id', 
    as: 'pricingRules' 
  });
  PricingRule.belongsTo(ProductUnit, { 
    foreignKey: 'unit_id', 
    as: 'unit' 
  });

  // Quotation associations
  User.hasMany(RentalQuotation, { 
    foreignKey: 'customer_id', 
    as: 'quotations' 
  });
  RentalQuotation.belongsTo(User, { 
    foreignKey: 'customer_id', 
    as: 'customer' 
  });

  // Order associations
  User.hasMany(RentalOrder, { 
    foreignKey: 'customer_id', 
    as: 'orders' 
  });
  RentalOrder.belongsTo(User, { 
    foreignKey: 'customer_id', 
    as: 'customer' 
  });

  RentalQuotation.hasMany(RentalOrder, { 
    foreignKey: 'quotation_id', 
    as: 'orders' 
  });
  RentalOrder.belongsTo(RentalQuotation, { 
    foreignKey: 'quotation_id', 
    as: 'quotation' 
  });

  // Order Item associations
  RentalOrder.hasMany(RentalOrderItem, { 
    foreignKey: 'order_id', 
    as: 'items' 
  });
  RentalOrderItem.belongsTo(RentalOrder, { 
    foreignKey: 'order_id', 
    as: 'order' 
  });

  Product.hasMany(RentalOrderItem, { 
    foreignKey: 'product_id', 
    as: 'orderItems' 
  });
  RentalOrderItem.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });

  ProductUnit.hasMany(RentalOrderItem, { 
    foreignKey: 'unit_id', 
    as: 'orderItems' 
  });
  RentalOrderItem.belongsTo(ProductUnit, { 
    foreignKey: 'unit_id', 
    as: 'unit' 
  });

  // Pickup associations
  RentalOrder.hasMany(Pickup, { 
    foreignKey: 'order_id', 
    as: 'pickups' 
  });
  Pickup.belongsTo(RentalOrder, { 
    foreignKey: 'order_id', 
    as: 'order' 
  });

  User.hasMany(Pickup, { 
    foreignKey: 'assigned_staff_id', 
    as: 'assignedPickups' 
  });
  Pickup.belongsTo(User, { 
    foreignKey: 'assigned_staff_id', 
    as: 'assignedStaff' 
  });

  // Return associations
  RentalOrder.hasMany(Return, { 
    foreignKey: 'order_id', 
    as: 'returns' 
  });
  Return.belongsTo(RentalOrder, { 
    foreignKey: 'order_id', 
    as: 'order' 
  });

  User.hasMany(Return, { 
    foreignKey: 'assigned_staff_id', 
    as: 'assignedReturns' 
  });
  Return.belongsTo(User, { 
    foreignKey: 'assigned_staff_id', 
    as: 'assignedStaff' 
  });

  // Invoice associations
  RentalOrder.hasMany(Invoice, { 
    foreignKey: 'order_id', 
    as: 'invoices' 
  });
  Invoice.belongsTo(RentalOrder, { 
    foreignKey: 'order_id', 
    as: 'order' 
  });

  // Payment associations
  Invoice.hasMany(Payment, { 
    foreignKey: 'invoice_id', 
    as: 'payments' 
  });
  Payment.belongsTo(Invoice, { 
    foreignKey: 'invoice_id', 
    as: 'invoice' 
  });

  // Notification associations
  User.hasMany(Notification, { 
    foreignKey: 'user_id', 
    as: 'notifications' 
  });
  Notification.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });

  // Audit Log associations
  User.hasMany(AuditLog, { 
    foreignKey: 'user_id', 
    as: 'auditLogs' 
  });
  AuditLog.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });

  console.log('✅ Model associations configured successfully');
};

module.exports = setupAssociations;