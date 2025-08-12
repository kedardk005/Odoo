import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanDatabase() {
  console.log('🧹 Cleaning up existing database...');

  // Create connection
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rental_management',
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Drop existing tables in the correct order (respecting foreign keys)
    const tablesToDrop = [
      'product_reservations',
      'late_fee_config',
      'pricing_rules',
      'quotation_items',
      'quotations',
      'notifications',
      'payments',
      'deliveries',
      'order_items',
      'orders',
      'products',
      'categories',
      'users'
    ];

    console.log('🗑️ Dropping existing tables...');
    
    for (const table of tablesToDrop) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not drop table ${table}:`, error.message);
      }
    }

    // Also drop any other tables that might exist
    const result = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%' 
      AND tablename NOT LIKE 'sql_%'
    `);

    for (const row of result.rows) {
      const tableName = row.tablename;
      if (!tablesToDrop.includes(tableName)) {
        try {
          await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
          console.log(`✅ Dropped additional table: ${tableName}`);
        } catch (error) {
          console.log(`⚠️ Could not drop table ${tableName}:`, error.message);
        }
      }
    }

    console.log('✅ Database cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the cleanup
cleanDatabase().catch(console.error);
