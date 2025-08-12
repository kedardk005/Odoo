import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { products, categories } from '../shared/schema';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config();

async function addSampleProducts() {
  console.log('🚀 Adding sample products...');

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

    // Get categories first
    const categoriesResult = await db.select().from(categories);
    console.log('📦 Found categories:', categoriesResult.length);

    if (categoriesResult.length === 0) {
      console.log('❌ No categories found. Please run setup-database.ts first.');
      return;
    }

    // Sample products data
    const sampleProducts = [
      {
        name: "Professional Camera Kit",
        description: "High-end DSLR camera with multiple lenses and accessories. Perfect for professional photography and videography projects.",
        categoryId: categoriesResult.find(c => c.name === "Electronics")?.id || categoriesResult[0].id,
        hourlyRate: "50.00",
        dailyRate: "200.00",
        weeklyRate: "1200.00",
        monthlyRate: "4000.00",
        securityDeposit: "2000.00",
        quantity: 3,
        availableQuantity: 3,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
        specifications: "Canon EOS R5, 24-70mm f/2.8L, 70-200mm f/2.8L, Tripod, Memory cards"
      },
      {
        name: "Office Desk Set",
        description: "Complete ergonomic office desk setup with chair, monitor stand, and storage solutions. Ideal for temporary office spaces.",
        categoryId: categoriesResult.find(c => c.name === "Furniture")?.id || categoriesResult[0].id,
        hourlyRate: "15.00",
        dailyRate: "80.00",
        weeklyRate: "500.00",
        monthlyRate: "1800.00",
        securityDeposit: "500.00",
        quantity: 5,
        availableQuantity: 5,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
        specifications: "Adjustable height desk, ergonomic chair, monitor stand, desk organizer"
      },
      {
        name: "Power Drill Set",
        description: "Professional cordless drill set with multiple bits and accessories. Perfect for construction and DIY projects.",
        categoryId: categoriesResult.find(c => c.name === "Tools")?.id || categoriesResult[0].id,
        hourlyRate: "8.00",
        dailyRate: "25.00",
        weeklyRate: "150.00",
        monthlyRate: "500.00",
        securityDeposit: "200.00",
        quantity: 8,
        availableQuantity: 8,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop",
        specifications: "18V cordless drill, 50+ drill bits, carrying case, 2 batteries, charger"
      },
      {
        name: "Compact Car",
        description: "Fuel-efficient compact car perfect for city driving and short trips. Clean, well-maintained, and reliable.",
        categoryId: categoriesResult.find(c => c.name === "Vehicles")?.id || categoriesResult[0].id,
        hourlyRate: "12.00",
        dailyRate: "60.00",
        weeklyRate: "350.00",
        monthlyRate: "1200.00",
        securityDeposit: "1000.00",
        quantity: 2,
        availableQuantity: 2,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop",
        specifications: "Automatic transmission, AC, GPS, Bluetooth, fuel efficient"
      },
      {
        name: "Sound System Package",
        description: "Complete professional sound system with speakers, microphones, and mixing equipment. Perfect for events and parties.",
        categoryId: categoriesResult.find(c => c.name === "Event Equipment")?.id || categoriesResult[0].id,
        hourlyRate: "30.00",
        dailyRate: "150.00",
        weeklyRate: "900.00",
        monthlyRate: "3000.00",
        securityDeposit: "1500.00",
        quantity: 4,
        availableQuantity: 4,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
        specifications: "2x 500W speakers, wireless microphones, mixing console, cables, stands"
      },
      {
        name: "Laptop - Business Grade",
        description: "High-performance business laptop with latest specifications. Perfect for presentations, work, and development tasks.",
        categoryId: categoriesResult.find(c => c.name === "Electronics")?.id || categoriesResult[0].id,
        hourlyRate: "20.00",
        dailyRate: "100.00",
        weeklyRate: "600.00",
        monthlyRate: "2000.00",
        securityDeposit: "1000.00",
        quantity: 6,
        availableQuantity: 6,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
        specifications: "Intel i7, 16GB RAM, 512GB SSD, Windows 11, Office Suite, Charger"
      }
    ];

    // Insert sample products
    for (const product of sampleProducts) {
      await db.execute(sql`
        INSERT INTO products (
          name, description, category_id, hourly_rate, daily_rate, weekly_rate, 
          monthly_rate, security_deposit, quantity, available_quantity, status, 
          image_url, specifications
        ) VALUES (
          ${product.name}, ${product.description}, ${product.categoryId}, 
          ${product.hourlyRate}, ${product.dailyRate}, ${product.weeklyRate}, 
          ${product.monthlyRate}, ${product.securityDeposit}, ${product.quantity}, 
          ${product.availableQuantity}, ${product.status}, ${product.imageUrl}, 
          ${product.specifications}
        )
      `);
    }

    console.log('✅ Sample products added successfully');
    console.log(`📦 Added ${sampleProducts.length} products across different categories`);

  } catch (error: any) {
    console.error('❌ Error adding sample products:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleProducts();