import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as dotenv from 'dotenv';
import { 
  users, categories, products, orders, orderItems, deliveries, payments, 
  notifications, quotations, quotationItems, customerSegments, pricingRules, 
  lateFeeConfig, productReservations 
} from '../shared/schema';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  // Create connection
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rental_management',
  });

  const db = drizzle(pool);

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Create tables if they don't exist
    console.log('📦 Creating tables...');

    // Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR UNIQUE NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        phone VARCHAR,
        address TEXT,
        city VARCHAR,
        state VARCHAR,
        pincode VARCHAR,
        date_of_birth VARCHAR,
        company_name VARCHAR,
        business_type VARCHAR,
        gstin VARCHAR,
        profile_picture VARCHAR,
        is_email_verified BOOLEAN DEFAULT false,
        is_phone_verified BOOLEAN DEFAULT false,
        membership_level VARCHAR DEFAULT 'bronze',
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        last_login_at TIMESTAMP,
        role VARCHAR DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'staff')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT,
        category_id VARCHAR REFERENCES categories(id),
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        daily_rate DECIMAL(10,2) NOT NULL,
        weekly_rate DECIMAL(10,2) DEFAULT 0,
        monthly_rate DECIMAL(10,2) DEFAULT 0,
        security_deposit DECIMAL(10,2) DEFAULT 0,
        quantity INTEGER DEFAULT 1,
        available_quantity INTEGER DEFAULT 1,
        reserved_quantity INTEGER DEFAULT 0,
        status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
        image_url TEXT,
        specifications TEXT,
        min_rental_period INTEGER DEFAULT 1,
        max_rental_period INTEGER DEFAULT 365,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quotations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_number VARCHAR UNIQUE NOT NULL,
        customer_id VARCHAR REFERENCES users(id) NOT NULL,
        status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        security_deposit DECIMAL(10,2) NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR UNIQUE NOT NULL,
        customer_id VARCHAR REFERENCES users(id) NOT NULL,
        quotation_id VARCHAR REFERENCES quotations(id),
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'returned', 'overdue', 'cancelled')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        pickup_time VARCHAR,
        return_time VARCHAR,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
        remaining_amount DECIMAL(10,2) DEFAULT 0.00,
        security_deposit DECIMAL(10,2) DEFAULT 0,
        late_fee DECIMAL(10,2) DEFAULT 0,
        actual_return_date TIMESTAMP,
        notes TEXT,
        contract_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order Items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        product_id VARCHAR REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Deliveries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deliveries (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR REFERENCES orders(id) NOT NULL,
        delivery_type VARCHAR CHECK (delivery_type IN ('pickup', 'return')),
        scheduled_date TIMESTAMP,
        actual_date TIMESTAMP,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
        driver_name VARCHAR,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR REFERENCES orders(id) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR,
        payment_gateway VARCHAR,
        transaction_id VARCHAR,
        gateway_payment_id VARCHAR,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        title VARCHAR NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quotations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_number VARCHAR UNIQUE NOT NULL,
        customer_id VARCHAR REFERENCES users(id) NOT NULL,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        valid_until TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quotation Items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id VARCHAR REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
        product_id VARCHAR REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customer Segments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_segments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT,
        criteria JSONB,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pricing Rules table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pricing_rules (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT,
        product_id VARCHAR REFERENCES products(id),
        category_id VARCHAR REFERENCES categories(id),
        customer_segment_id VARCHAR REFERENCES customer_segments(id),
        discount_type VARCHAR CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value DECIMAL(10,2),
        min_rental_days INTEGER,
        max_rental_days INTEGER,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Late Fee Config table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS late_fee_config (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        daily_fee_percentage DECIMAL(5,2) DEFAULT 5.0,
        max_fee_percentage DECIMAL(5,2) DEFAULT 50.0,
        grace_period_hours INTEGER DEFAULT 24,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product Reservations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_reservations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR REFERENCES products(id) NOT NULL,
        order_id VARCHAR REFERENCES orders(id) NOT NULL,
        quantity INTEGER NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');

    // Create indexes for better performance
    console.log('📊 Creating indexes...');

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_dates ON orders(start_date, end_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reservations_product ON product_reservations(product_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reservations_dates ON product_reservations(start_date, end_date)`);

    console.log('✅ Indexes created successfully');

    // Insert default data
    console.log('🌱 Inserting default data...');

    // Insert default admin user
    await db.execute(sql`
      INSERT INTO users (id, username, email, password, first_name, last_name, role)
      VALUES ('admin-user-id', 'admin', 'admin@rentalpro.com', '$2b$10$rQkZjkZkQkZkQkZkQkZkZe', 'Admin', 'User', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert default categories
    const defaultCategories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Furniture', description: 'Home and office furniture' },
      { name: 'Tools', description: 'Power tools and equipment' },
      { name: 'Vehicles', description: 'Cars, bikes, and other vehicles' },
      { name: 'Event Equipment', description: 'Party and event supplies' }
    ];

    for (const category of defaultCategories) {
      await db.execute(sql`
        INSERT INTO categories (name, description)
        VALUES (${category.name}, ${category.description})
        ON CONFLICT (name) DO NOTHING
      `);
    }

    // Insert default late fee configuration
    await db.execute(sql`
      INSERT INTO late_fee_config (name, daily_fee_percentage, max_fee_percentage, grace_period_hours, is_active)
      VALUES ('Default Late Fee', 5.0, 50.0, 24, true)
    `);

    console.log('✅ Default data inserted successfully');

    // Create trigger for updated_at columns
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await db.execute(sql`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await db.execute(sql`
      CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Database triggers created successfully');

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup if this file is executed directly
const isMainModule = import.meta.url.includes(process.argv[1]?.replace(/\\/g, '/') || '');
if (isMainModule) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };