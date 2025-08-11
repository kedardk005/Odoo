const { sequelize } = require('../config/database');
const setupAssociations = require('../models/associations');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for new schema...');

    // Setup associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 1. Insert Roles
    console.log('📝 Seeding roles...');
    await sequelize.query(`
      INSERT INTO roles (role_name) VALUES 
      ('user'),
      ('admin')
      ON CONFLICT (role_name) DO NOTHING;
    `);

    // 2. Insert Product Units
    console.log('📝 Seeding product units...');
    await sequelize.query(`
      INSERT INTO product_units (unit_name) VALUES 
      ('hour'),
      ('day'),
      ('week'),
      ('month'),
      ('year');
    `);

    // 3. Insert Product Categories (no conflict handling needed as no unique constraint)
    console.log('📝 Seeding product categories...');
    
    // Check if categories already exist
    const [existingCategories] = await sequelize.query(`
      SELECT category_name FROM product_categories;
    `);
    
    if (existingCategories.length === 0) {
      await sequelize.query(`
        INSERT INTO product_categories (category_name, description) VALUES 
        ('Photography', 'Cameras, lenses, lighting equipment for photography'),
        ('Computers', 'Laptops, desktops, tablets and computer accessories'),
        ('Events', 'Wedding decorations, party supplies, event equipment'),
        ('Audio Equipment', 'Sound systems, microphones, speakers for events'),
        ('Vehicles', 'Cars, bikes, and other transportation rentals'),
        ('Construction', 'Tools and equipment for construction and repair'),
        ('Sports', 'Sports equipment and gear for various activities');
      `);
    } else {
      console.log('   Categories already exist, skipping...');
    }

    // 4. Insert Users (with role_id references)
    console.log('📝 Seeding users...');
    
    // Get role IDs
    const [roles] = await sequelize.query(`SELECT role_id, role_name FROM roles;`);
    const adminRoleId = roles.find(r => r.role_name === 'admin')?.role_id;
    const userRoleId = roles.find(r => r.role_name === 'user')?.role_id;

    // Check if users already exist
    const [existingUsers] = await sequelize.query(`SELECT email FROM users;`);
    
    if (existingUsers.length === 0) {
      // Hash passwords
      const adminPassword = await bcrypt.hash('Admin123!', 10);
      const user1Password = await bcrypt.hash('User123!', 10);
      const user2Password = await bcrypt.hash('User123!', 10);

      await sequelize.query(`
        INSERT INTO users (full_name, email, password_hash, phone_number, role_id) VALUES 
        ('Admin User', 'admin@rental.com', '${adminPassword}', '9999999999', ${adminRoleId}),
        ('John Doe', 'user1@example.com', '${user1Password}', '9876543210', ${userRoleId}),
        ('Jane Smith', 'user2@example.com', '${user2Password}', '9876543211', ${userRoleId});
      `);
    } else {
      console.log('   Users already exist, skipping...');
    }

    // 5. Insert Products
    console.log('📝 Seeding products...');
    
    // Get category IDs
    const [categories] = await sequelize.query(`SELECT category_id, category_name FROM product_categories;`);
    const photoId = categories.find(c => c.category_name === 'Photography')?.category_id;
    const compId = categories.find(c => c.category_name === 'Computers')?.category_id;
    const eventId = categories.find(c => c.category_name === 'Events')?.category_id;
    const audioId = categories.find(c => c.category_name === 'Audio Equipment')?.category_id;
    const vehicleId = categories.find(c => c.category_name === 'Vehicles')?.category_id;

    // Check if products already exist
    const [existingProducts] = await sequelize.query(`SELECT sku_code FROM products;`);
    
    if (existingProducts.length === 0) {
      await sequelize.query(`
        INSERT INTO products (category_id, name, description, sku_code, is_rentable) VALUES 
        (${photoId}, 'Professional Camera Kit', 'High-end DSLR camera with professional lenses and accessories', 'CAM-PRO-001', true),
        (${compId}, 'MacBook Pro 16-inch', 'Latest MacBook Pro with M2 Max chip for professional work', 'COMP-MBP-001', true),
        (${eventId}, 'Wedding Decoration Package', 'Complete wedding decoration with flowers, lighting, and setup', 'EVT-WED-001', true),
        (${audioId}, 'Sound System - Professional', 'Professional grade sound system for events and conferences', 'AUD-SND-001', true),
        (${vehicleId}, 'Luxury Car - BMW 3 Series', 'Premium luxury sedan for special occasions and business', 'VEH-BMW-001', true);
      `);
    } else {
      console.log('   Products already exist, skipping...');
    }

    // 6. Insert Product Inventory
    console.log('📝 Seeding product inventory...');
    const [products] = await sequelize.query(`SELECT product_id, sku_code FROM products;`);
    
    // Check if inventory already exists
    const [existingInventory] = await sequelize.query(`SELECT COUNT(*) as count FROM product_inventory;`);
    
    if (existingInventory[0].count == 0) {
      for (const product of products) {
        await sequelize.query(`
          INSERT INTO product_inventory (product_id, quantity_available, location) VALUES 
          (${product.product_id}, 5, 'Main Warehouse');
        `);
      }
    } else {
      console.log('   Inventory already exists, skipping...');
    }

    // 7. Insert Default Pricelists
    console.log('📝 Seeding pricelists...');
    
    // Check if pricelists already exist
    const [existingPricelists] = await sequelize.query(`SELECT name FROM pricelists;`);
    
    if (existingPricelists.length === 0) {
      await sequelize.query(`
        INSERT INTO pricelists (name, description, customer_group, start_date) VALUES 
        ('Standard Pricing', 'Default pricing for all customers', 'all', CURRENT_DATE),
        ('VIP Customer Pricing', 'Special pricing for VIP customers with 15% discount', 'vip', CURRENT_DATE),
        ('Corporate Pricing', 'Special rates for corporate customers', 'corporate', CURRENT_DATE);
      `);
    } else {
      console.log('   Pricelists already exist, skipping...');
    }

    // 8. Insert Pricing Rules
    console.log('📝 Seeding pricing rules...');
    const [pricelists] = await sequelize.query(`SELECT pricelist_id, name FROM pricelists;`);
    const [units] = await sequelize.query(`SELECT unit_id, unit_name FROM product_units;`);
    
    const standardPricelistId = pricelists.find(p => p.name === 'Standard Pricing')?.pricelist_id;
    const dayUnitId = units.find(u => u.unit_name === 'day')?.unit_id;
    const hourUnitId = units.find(u => u.unit_name === 'hour')?.unit_id;
    const weekUnitId = units.find(u => u.unit_name === 'week')?.unit_id;

    // Check if pricing rules already exist
    const [existingRules] = await sequelize.query(`SELECT COUNT(*) as count FROM pricing_rules;`);
    
    if (existingRules[0].count == 0 && standardPricelistId) {
      // Create pricing rules for all products
      for (const product of products) {
        // Daily rates
        if (dayUnitId) {
          let dailyPrice = 1000;
          if (product.sku_code === 'CAM-PRO-001') dailyPrice = 2000;
          if (product.sku_code === 'COMP-MBP-001') dailyPrice = 1500;
          if (product.sku_code === 'EVT-WED-001') dailyPrice = 50000;
          if (product.sku_code === 'AUD-SND-001') dailyPrice = 5000;
          if (product.sku_code === 'VEH-BMW-001') dailyPrice = 8000;

          await sequelize.query(`
            INSERT INTO pricing_rules (pricelist_id, product_id, unit_id, price, late_fee_per_unit) VALUES 
            (${standardPricelistId}, ${product.product_id}, ${dayUnitId}, ${dailyPrice}, ${dailyPrice * 0.1});
          `);
        }

        // Hourly rates (for applicable products)
        if (hourUnitId && ['CAM-PRO-001', 'COMP-MBP-001', 'AUD-SND-001', 'VEH-BMW-001'].includes(product.sku_code)) {
          let hourlyPrice = 200;
          if (product.sku_code === 'CAM-PRO-001') hourlyPrice = 500;
          if (product.sku_code === 'COMP-MBP-001') hourlyPrice = 200;
          if (product.sku_code === 'AUD-SND-001') hourlyPrice = 1000;
          if (product.sku_code === 'VEH-BMW-001') hourlyPrice = 1500;

          await sequelize.query(`
            INSERT INTO pricing_rules (pricelist_id, product_id, unit_id, price, late_fee_per_unit) VALUES 
            (${standardPricelistId}, ${product.product_id}, ${hourUnitId}, ${hourlyPrice}, ${hourlyPrice * 0.1});
          `);
        }
      }
    } else {
      console.log('   Pricing rules already exist, skipping...');
    }

    // 9. Insert Sample Quotation and Order
    console.log('📝 Seeding sample quotation and order...');
    const [customers] = await sequelize.query(`
      SELECT user_id FROM users WHERE role_id = ${customerRoleId} LIMIT 1;
    `);

    if (customers.length > 0) {
      const customerId = customers[0].user_id;
      
      // Check if quotations already exist
      const [existingQuotations] = await sequelize.query(`
        SELECT COUNT(*) as count FROM rental_quotations;
      `);

      if (existingQuotations[0].count == 0) {
        // Insert quotation
        await sequelize.query(`
          INSERT INTO rental_quotations (customer_id, status) VALUES 
          (${customerId}, 'approved');
        `);

        // Get the quotation ID
        const [quotations] = await sequelize.query(`
          SELECT quotation_id FROM rental_quotations WHERE customer_id = ${customerId} LIMIT 1;
        `);

        if (quotations.length > 0) {
          const quotationId = quotations[0].quotation_id;
          
          // Insert rental order
          await sequelize.query(`
            INSERT INTO rental_orders (quotation_id, customer_id, status, pickup_date, return_date, total_amount, deposit_amount) VALUES 
            (${quotationId}, ${customerId}, 'confirmed', NOW() + INTERVAL '1 day', NOW() + INTERVAL '4 days', 6000.00, 2000.00);
          `);

          // Get the order ID and insert order items
          const [orders] = await sequelize.query(`
            SELECT order_id FROM rental_orders WHERE customer_id = ${customerId} LIMIT 1;
          `);

          if (orders.length > 0) {
            const orderId = orders[0].order_id;
            const cameraProduct = products.find(p => p.sku_code === 'CAM-PRO-001');
            
            if (cameraProduct && dayUnitId) {
              await sequelize.query(`
                INSERT INTO rental_order_items (order_id, product_id, unit_id, quantity, unit_price) VALUES 
                (${orderId}, ${cameraProduct.product_id}, ${dayUnitId}, 1, 2000.00);
              `);

              // Insert invoice for the order
              await sequelize.query(`
                INSERT INTO invoices (order_id, total_amount, status) VALUES 
                (${orderId}, 6000.00, 'unpaid');
              `);
            }
          }
        }
      } else {
        console.log('   Sample orders already exist, skipping...');
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('   ✅ 2 Roles (user, admin)');
    console.log('   ✅ 5 Product Units (hour, day, week, month, year)');
    console.log('   ✅ 7 Product Categories');
    console.log('   ✅ 3 Users (1 admin, 2 users)');
    console.log('   ✅ 5 Products with inventory');
    console.log('   ✅ 3 Pricelists with pricing rules');
    console.log('   ✅ 1 Sample quotation, order, and invoice');
    
    console.log('\n🔐 Default Login Credentials:');
    console.log('   👤 Admin: admin@rental.com / Admin123!');
    console.log('   👥 Staff: staff@rental.com / Staff123!');
    console.log('   👤 Customer: customer@example.com / Customer123!');
    console.log('   🏢 Corporate: corporate@company.com / Corp123!');

    console.log('\n📊 Database Summary:');
    const [summary] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM product_categories) as categories,
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM product_inventory) as inventory_records,
        (SELECT COUNT(*) FROM pricelists) as pricelists,
        (SELECT COUNT(*) FROM pricing_rules) as pricing_rules,
        (SELECT COUNT(*) FROM rental_orders) as orders;
    `);

    if (summary.length > 0) {
      const stats = summary[0];
      console.log(`   📋 ${stats.roles} roles, ${stats.users} users`);
      console.log(`   📦 ${stats.categories} categories, ${stats.products} products`);
      console.log(`   📊 ${stats.inventory_records} inventory records`);
      console.log(`   💰 ${stats.pricelists} pricelists, ${stats.pricing_rules} pricing rules`);
      console.log(`   📋 ${stats.orders} sample orders`);
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n🚀 Your rental management system is ready to use!');
      console.log('   Next: npm run dev');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;