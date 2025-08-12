import { db } from '../server/db';
import { users } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function createTestUser() {
  console.log('🚀 Creating test user...');

  try {
    // First, let's check if the user already exists
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      console.log('✅ Test user already exists:', existingUsers[0]);
      return existingUsers[0];
    }

    // Create a test user
    const [testUser] = await db.insert(users).values({
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
      membershipLevel: 'Bronze',
      totalOrders: 5,
      totalSpent: '15000.00'
    }).returning();

    console.log('✅ Test user created successfully:', testUser);
    return testUser;
  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
    
    // If the error is about missing columns, let's try with basic fields only
    if (error.message.includes('column') || error.message.includes('does not exist')) {
      try {
        const [basicUser] = await db.insert(users).values({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+91 9876543210',
          address: '123 Main Street',
          role: 'customer'
        }).returning();
        
        console.log('✅ Basic test user created:', basicUser);
        return basicUser;
      } catch (basicError: any) {
        console.error('❌ Error creating basic user:', basicError.message);
      }
    }
  }
}

createTestUser()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });