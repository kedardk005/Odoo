import { db } from '../server/db';
import { users, categories, products } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function createSampleData() {
  console.log('🚀 Creating sample data...');

  try {
    // Create sample categories
    const sampleCategories = [
      { name: 'Construction Equipment', description: 'Heavy machinery and construction tools' },
      { name: 'Event & Party', description: 'Equipment for events, weddings, and parties' },
      { name: 'Photography & Film', description: 'Cameras, lighting, and recording equipment' },
      { name: 'Sound & Music', description: 'Audio equipment, speakers, and instruments' },
      { name: 'Outdoor & Sports', description: 'Camping, hiking, and sports equipment' },
      { name: 'Home & Garden', description: 'Tools and equipment for home improvement' },
    ];

    console.log('📦 Creating categories...');
    for (const category of sampleCategories) {
      try {
        await db.insert(categories).values(category).onConflictDoNothing();
        console.log(`✅ Category created: ${category.name}`);
      } catch (error) {
        console.log(`ℹ️ Category may already exist: ${category.name}`);
      }
    }

    // Get created categories
    const createdCategories = await db.select().from(categories).limit(6);
    
    if (createdCategories.length === 0) {
      console.log('❌ No categories found. Please check database connection.');
      return;
    }

    // Create sample products
    const sampleProducts = [
      {
        name: 'DSLR Camera Canon EOS 5D',
        description: 'Professional DSLR camera with 24-70mm lens',
        categoryId: createdCategories.find(c => c.name === 'Photography & Film')?.id || createdCategories[0].id,
        dailyRate: 500,
        weeklyRate: 3000,
        monthlyRate: 10000,
        securityDeposit: 5000,
        quantity: 3,
        availableQuantity: 3,
        status: 'available' as const,
        imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800',
      },
      {
        name: 'Professional LED Lights Kit',
        description: 'Complete lighting setup with stands and diffusers',
        categoryId: createdCategories.find(c => c.name === 'Photography & Film')?.id || createdCategories[0].id,
        dailyRate: 300,
        weeklyRate: 1800,
        monthlyRate: 6000,
        securityDeposit: 2000,
        quantity: 5,
        availableQuantity: 5,
        status: 'available' as const,
        imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
      },
      {
        name: 'DJ Sound System',
        description: 'Complete DJ setup with speakers, mixer, and microphones',
        categoryId: createdCategories.find(c => c.name === 'Sound & Music')?.id || createdCategories[1].id,
        dailyRate: 800,
        weeklyRate: 4800,
        monthlyRate: 15000,
        securityDeposit: 8000,
        quantity: 2,
        availableQuantity: 2,
        status: 'available' as const,
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      },
      {
        name: 'Wedding Decoration Package',
        description: 'Complete wedding decoration with flowers, lights, and setup',
        categoryId: createdCategories.find(c => c.name === 'Event & Party')?.id || createdCategories[2].id,
        dailyRate: 1200,
        weeklyRate: 7000,
        securityDeposit: 3000,
        quantity: 1,
        availableQuantity: 1,
        status: 'available' as const,
        imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      },
      {
        name: 'Mini Excavator',
        description: '3-ton mini excavator for construction and landscaping',
        categoryId: createdCategories.find(c => c.name === 'Construction Equipment')?.id || createdCategories[3].id,
        hourlyRate: 150,
        dailyRate: 1000,
        weeklyRate: 6000,
        monthlyRate: 20000,
        securityDeposit: 15000,
        quantity: 1,
        availableQuantity: 1,
        status: 'available' as const,
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      },
      {
        name: 'Camping Tent (6-person)',
        description: 'Spacious 6-person camping tent with rain protection',
        categoryId: createdCategories.find(c => c.name === 'Outdoor & Sports')?.id || createdCategories[4].id,
        dailyRate: 80,
        weeklyRate: 400,
        monthlyRate: 1200,
        securityDeposit: 500,
        quantity: 10,
        availableQuantity: 10,
        status: 'available' as const,
        imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      },
    ];

    console.log('🏗️ Creating sample products...');
    for (const product of sampleProducts) {
      try {
        await db.insert(products).values(product).onConflictDoNothing();
        console.log(`✅ Product created: ${product.name}`);
      } catch (error: any) {
        console.log(`❌ Error creating product ${product.name}:`, error.message);
      }
    }

    // Create test user if not exists
    const testUser = await db.select().from(users).where(sql`email = 'test@example.com'`).limit(1);
    
    if (testUser.length === 0) {
      console.log('👤 Creating test user...');
      await db.insert(users).values({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+91 9876543210',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        role: 'customer',
      });
      console.log('✅ Test user created');
    }

    console.log('🎉 Sample data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${sampleProducts.length}`);
    
  } catch (error: any) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

createSampleData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });