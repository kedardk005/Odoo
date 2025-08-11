const { sequelize } = require('../config/database');

const createDatabaseSchema = async () => {
  try {
    console.log('🔄 Creating database schema from SQL...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Drop existing tables (be careful - this will delete all data!)
    console.log('⚠️  Dropping existing tables if they exist...');
    
    // Get all table names to drop them in correct order
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    // Drop tables in reverse order to handle foreign key constraints
    for (const table of tables.reverse()) {
      await sequelize.query(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`);
    }

    console.log('✅ Existing tables dropped');

    // Create the complete schema
    console.log('🏗️  Creating new database schema...');

    // 1. USERS & ROLES
    await sequelize.query(`
      CREATE TABLE roles (
          role_id SERIAL PRIMARY KEY,
          role_name VARCHAR(50) UNIQUE NOT NULL CHECK (role_name IN ('customer', 'staff', 'admin'))
      );
    `);

    await sequelize.query(`
      CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          full_name VARCHAR(150) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone_number VARCHAR(20),
          role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. PRODUCT MANAGEMENT
    await sequelize.query(`
      CREATE TABLE product_categories (
          category_id SERIAL PRIMARY KEY,
          category_name VARCHAR(100) NOT NULL,
          description TEXT
      );
    `);

    await sequelize.query(`
      CREATE TABLE products (
          product_id SERIAL PRIMARY KEY,
          category_id INT REFERENCES product_categories(category_id) ON DELETE SET NULL,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          sku_code VARCHAR(50) UNIQUE,
          is_rentable BOOLEAN DEFAULT TRUE,
          base_price NUMERIC(10,2) DEFAULT 0.00,
          available_quantity INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE product_units (
          unit_id SERIAL PRIMARY KEY,
          unit_name VARCHAR(50) NOT NULL CHECK (unit_name IN ('hour', 'day', 'week', 'month', 'year'))
      );
    `);

    await sequelize.query(`
      CREATE TABLE product_inventory (
          inventory_id SERIAL PRIMARY KEY,
          product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
          quantity_available INT NOT NULL DEFAULT 0,
          location VARCHAR(150),
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. PRICING MANAGEMENT
    await sequelize.query(`
      CREATE TABLE pricelists (
          pricelist_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          customer_group VARCHAR(50), -- e.g., VIP, Corporate, etc.
          start_date DATE,
          end_date DATE
      );
    `);

    await sequelize.query(`
      CREATE TABLE pricing_rules (
          rule_id SERIAL PRIMARY KEY,
          pricelist_id INT REFERENCES pricelists(pricelist_id) ON DELETE CASCADE,
          product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
          unit_id INT REFERENCES product_units(unit_id) ON DELETE CASCADE,
          price NUMERIC(10,2) NOT NULL,
          discount_percent NUMERIC(5,2) DEFAULT 0.00,
          discount_amount NUMERIC(10,2) DEFAULT 0.00,
          late_fee_per_unit NUMERIC(10,2) DEFAULT 0.00
      );
    `);

    // 4. RENTAL QUOTATIONS & ORDERS
    await sequelize.query(`
      CREATE TABLE rental_quotations (
          quotation_id SERIAL PRIMARY KEY,
          customer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
          status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE rental_orders (
          order_id SERIAL PRIMARY KEY,
          quotation_id INT REFERENCES rental_quotations(quotation_id) ON DELETE SET NULL,
          customer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
          status VARCHAR(20) CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'confirmed',
          pickup_date TIMESTAMP,
          return_date TIMESTAMP,
          total_amount NUMERIC(12,2) NOT NULL,
          deposit_amount NUMERIC(12,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE rental_order_items (
          order_item_id SERIAL PRIMARY KEY,
          order_id INT REFERENCES rental_orders(order_id) ON DELETE CASCADE,
          product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
          unit_id INT REFERENCES product_units(unit_id) ON DELETE CASCADE,
          quantity INT NOT NULL,
          unit_price NUMERIC(10,2) NOT NULL,
          discount NUMERIC(10,2) DEFAULT 0.00,
          late_fee NUMERIC(10,2) DEFAULT 0.00
      );
    `);

    // 5. PICKUP & RETURN MANAGEMENT
    await sequelize.query(`
      CREATE TABLE pickups (
          pickup_id SERIAL PRIMARY KEY,
          order_id INT REFERENCES rental_orders(order_id) ON DELETE CASCADE,
          scheduled_time TIMESTAMP NOT NULL,
          actual_time TIMESTAMP,
          status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'missed')) DEFAULT 'scheduled',
          assigned_staff_id INT REFERENCES users(user_id) ON DELETE SET NULL
      );
    `);

    await sequelize.query(`
      CREATE TABLE returns (
          return_id SERIAL PRIMARY KEY,
          order_id INT REFERENCES rental_orders(order_id) ON DELETE CASCADE,
          scheduled_time TIMESTAMP NOT NULL,
          actual_time TIMESTAMP,
          status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'late', 'missed')) DEFAULT 'scheduled',
          assigned_staff_id INT REFERENCES users(user_id) ON DELETE SET NULL
      );
    `);

    // 6. INVOICING & PAYMENTS
    await sequelize.query(`
      CREATE TABLE invoices (
          invoice_id SERIAL PRIMARY KEY,
          order_id INT REFERENCES rental_orders(order_id) ON DELETE CASCADE,
          invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          total_amount NUMERIC(12,2) NOT NULL,
          paid_amount NUMERIC(12,2) DEFAULT 0.00,
          status VARCHAR(20) CHECK (status IN ('paid', 'unpaid', 'partial')) DEFAULT 'unpaid'
      );
    `);

    await sequelize.query(`
      CREATE TABLE payments (
          payment_id SERIAL PRIMARY KEY,
          invoice_id INT REFERENCES invoices(invoice_id) ON DELETE CASCADE,
          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          amount NUMERIC(12,2) NOT NULL,
          method VARCHAR(50),
          status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending')) DEFAULT 'pending'
      );
    `);

    // 7. NOTIFICATIONS & ALERTS
    await sequelize.query(`
      CREATE TABLE notifications (
          notification_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
          type VARCHAR(50), -- 'pickup_reminder', 'return_reminder', etc.
          message TEXT NOT NULL,
          scheduled_at TIMESTAMP NOT NULL,
          sent_at TIMESTAMP
      );
    `);

    // 8. AUDIT TRAIL & REPORTING
    await sequelize.query(`
      CREATE TABLE audit_logs (
          log_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL,
          table_name VARCHAR(50),
          record_id INT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    console.log('📊 Creating indexes...');

    await sequelize.query(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role_id ON users(role_id);
      CREATE INDEX idx_products_sku ON products(sku_code);
      CREATE INDEX idx_products_category ON products(category_id);
      CREATE INDEX idx_rental_orders_customer ON rental_orders(customer_id);
      CREATE INDEX idx_rental_orders_dates ON rental_orders(pickup_date, return_date);
      CREATE INDEX idx_rental_order_items_order ON rental_order_items(order_id);
      CREATE INDEX idx_invoices_order ON invoices(order_id);
      CREATE INDEX idx_payments_invoice ON payments(invoice_id);
      CREATE INDEX idx_notifications_user ON notifications(user_id);
      CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at);
      CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
    `);

    console.log('✅ Database schema created successfully!');
    console.log('📋 Tables created:');
    console.log('   - roles, users');
    console.log('   - product_categories, products, product_units, product_inventory');
    console.log('   - pricelists, pricing_rules');
    console.log('   - rental_quotations, rental_orders, rental_order_items');
    console.log('   - pickups, returns');
    console.log('   - invoices, payments');
    console.log('   - notifications, audit_logs');

  } catch (error) {
    console.error('❌ Schema creation failed:', error);
    throw error;
  }
};

// Run schema creation if called directly
if (require.main === module) {
  createDatabaseSchema()
    .then(() => {
      console.log('Schema creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema creation failed:', error);
      process.exit(1);
    });
}

module.exports = createDatabaseSchema;