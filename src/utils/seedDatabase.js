const { sequelize } = require('../config/database');
const setupAssociations = require('../models/associations');
const User = require('../models/User');
const Product = require('../models/Product');
const { Pricelist, PricelistItem } = require('../models/Pricelist');
const { NotificationTemplate } = require('../models/Notification');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Setup associations
    setupAssociations();

    // Sync database
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synced');

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@rental.com' } });
    if (!adminExists) {
      await User.create({
        email: 'admin@rental.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '9999999999',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        isActive: true
      });
      console.log('✅ Admin user created (admin@rental.com / Admin123!)');
    }

    // Create staff user
    const staffExists = await User.findOne({ where: { email: 'staff@rental.com' } });
    if (!staffExists) {
      await User.create({
        email: 'staff@rental.com',
        password: 'Staff123!',
        firstName: 'Staff',
        lastName: 'User',
        role: 'staff',
        phone: '8888888888',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        isActive: true
      });
      console.log('✅ Staff user created (staff@rental.com / Staff123!)');
    }

    // Create sample customers
    const customerExists = await User.findOne({ where: { email: 'customer@example.com' } });
    if (!customerExists) {
      await User.bulkCreate([
        {
          email: 'customer@example.com',
          password: 'Customer123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          phone: '9876543210',
          address: '123 Main Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          customerType: 'individual',
          isActive: true
        },
        {
          email: 'corporate@company.com',
          password: 'Corp123!',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'customer',
          phone: '9876543211',
          address: '456 Business Park',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India',
          customerType: 'corporate',
          isActive: true
        }
      ]);
      console.log('✅ Sample customers created');
    }

    // Create sample products
    const productsExist = await Product.count();
    if (productsExist === 0) {
      await Product.bulkCreate([
        {
          name: 'Professional Camera Kit',
          description: 'High-end DSLR camera with professional lenses and accessories',
          category: 'Photography',
          sku: 'CAM-PRO-001',
          totalQuantity: 5,
          availableQuantity: 5,
          basePrice: 2000,
          hourlyRate: 500,
          dailyRate: 2000,
          weeklyRate: 12000,
          monthlyRate: 45000,
          securityDeposit: 10000,
          lateFeePerDay: 200,
          minRentalDuration: 4,
          maxRentalDuration: 720,
          rentalUnit: 'day',
          specifications: {
            brand: 'Canon',
            model: 'EOS R5',
            megapixels: '45MP',
            lenses: ['24-70mm f/2.8', '70-200mm f/2.8'],
            accessories: ['Tripod', 'Flash', 'Memory Cards', 'Extra Batteries']
          },
          condition: 'excellent',
          location: 'Mumbai Warehouse',
          tags: ['camera', 'professional', 'photography', 'wedding'],
          isActive: true,
          isRentable: true
        },
        {
          name: 'MacBook Pro 16-inch',
          description: 'Latest MacBook Pro with M2 Max chip for professional work',
          category: 'Computers',
          sku: 'COMP-MBP-001',
          totalQuantity: 10,
          availableQuantity: 8,
          basePrice: 1500,
          hourlyRate: 200,
          dailyRate: 1500,
          weeklyRate: 9000,
          monthlyRate: 35000,
          securityDeposit: 20000,
          lateFeePerDay: 150,
          minRentalDuration: 1,
          maxRentalDuration: 2160,
          rentalUnit: 'day',
          specifications: {
            brand: 'Apple',
            processor: 'M2 Max',
            ram: '32GB',
            storage: '1TB SSD',
            screen: '16-inch Liquid Retina XDR'
          },
          condition: 'excellent',
          location: 'Delhi Warehouse',
          tags: ['laptop', 'apple', 'professional', 'development'],
          isActive: true,
          isRentable: true
        },
        {
          name: 'Wedding Decoration Package',
          description: 'Complete wedding decoration with flowers, lighting, and setup',
          category: 'Events',
          sku: 'EVT-WED-001',
          totalQuantity: 3,
          availableQuantity: 3,
          basePrice: 50000,
          dailyRate: 50000,
          weeklyRate: 200000,
          securityDeposit: 25000,
          lateFeePerDay: 1000,
          minRentalDuration: 1,
          maxRentalDuration: 7,
          rentalUnit: 'day',
          specifications: {
            includes: ['Mandap', 'Flower arrangements', 'LED lighting', 'Carpets', 'Seating'],
            capacity: '500 guests',
            setup: 'Full service included'
          },
          condition: 'new',
          location: 'Bangalore Warehouse',
          tags: ['wedding', 'decoration', 'events', 'flowers'],
          isActive: true,
          isRentable: true
        },
        {
          name: 'Sound System - Professional',
          description: 'Professional grade sound system for events and conferences',
          category: 'Audio Equipment',
          sku: 'AUD-SND-001',
          totalQuantity: 8,
          availableQuantity: 6,
          basePrice: 5000,
          hourlyRate: 1000,
          dailyRate: 5000,
          weeklyRate: 30000,
          monthlyRate: 100000,
          securityDeposit: 15000,
          lateFeePerDay: 500,
          minRentalDuration: 4,
          maxRentalDuration: 168,
          rentalUnit: 'day',
          specifications: {
            power: '2000W',
            speakers: '4 x Professional speakers',
            microphones: '4 wireless + 2 wired',
            mixer: '16-channel digital mixer'
          },
          condition: 'good',
          location: 'Chennai Warehouse',
          tags: ['sound', 'audio', 'professional', 'events', 'conference'],
          isActive: true,
          isRentable: true
        },
        {
          name: 'Luxury Car - BMW 3 Series',
          description: 'Premium luxury sedan for special occasions and business',
          category: 'Vehicles',
          sku: 'VEH-BMW-001',
          totalQuantity: 2,
          availableQuantity: 2,
          basePrice: 8000,
          hourlyRate: 1500,
          dailyRate: 8000,
          weeklyRate: 50000,
          monthlyRate: 180000,
          securityDeposit: 50000,
          lateFeePerDay: 1000,
          minRentalDuration: 4,
          maxRentalDuration: 720,
          rentalUnit: 'day',
          specifications: {
            brand: 'BMW',
            model: '3 Series',
            year: '2023',
            fuel: 'Petrol',
            transmission: 'Automatic',
            seating: '5 passengers'
          },
          condition: 'excellent',
          location: 'Mumbai Warehouse',
          tags: ['car', 'luxury', 'bmw', 'sedan', 'business'],
          isActive: true,
          isRentable: true
        }
      ]);
      console.log('✅ Sample products created');
    }

    // Create default pricelist
    const pricelistExists = await Pricelist.findOne({ where: { name: 'Standard Pricing' } });
    if (!pricelistExists) {
      const standardPricelist = await Pricelist.create({
        name: 'Standard Pricing',
        description: 'Default pricing for all customers',
        customerType: 'all',
        validFrom: new Date(),
        isActive: true,
        priority: 1
      });

      // Create VIP pricelist with discount
      await Pricelist.create({
        name: 'VIP Customer Pricing',
        description: 'Special pricing for VIP customers with 15% discount',
        customerType: 'vip',
        validFrom: new Date(),
        isActive: true,
        priority: 10,
        discountType: 'percentage',
        discountValue: 15
      });

      // Create corporate pricelist
      await Pricelist.create({
        name: 'Corporate Pricing',
        description: 'Special rates for corporate customers',
        customerType: 'corporate',
        validFrom: new Date(),
        isActive: true,
        priority: 5,
        discountType: 'percentage',
        discountValue: 10,
        minimumDuration: 24 // minimum 1 day rental
      });

      console.log('✅ Default pricelists created');
    }

    // Create notification templates
    const templateExists = await NotificationTemplate.count();
    if (templateExists === 0) {
      await NotificationTemplate.bulkCreate([
        {
          name: 'pickup_reminder',
          description: 'Reminder email sent before pickup date',
          type: 'pickup_reminder',
          channel: 'email',
          subject: 'Pickup Reminder - Your rental is ready!',
          body: `Hi {{firstName}},

This is a reminder that your rental pickup is scheduled for {{pickupDate}}.

Order Details:
- Order Number: {{orderNumber}}
- Pickup Location: {{pickupLocation}}
- Pickup Time: {{pickupTime}}

Please ensure you bring a valid ID and are available at the scheduled time.

Contact us if you need to reschedule.

Best regards,
Rental Management Team`,
          variables: ['firstName', 'pickupDate', 'orderNumber', 'pickupLocation', 'pickupTime'],
          isActive: true,
          sendBeforeDays: 1
        },
        {
          name: 'return_reminder',
          description: 'Reminder email sent before return date',
          type: 'return_reminder',
          channel: 'email',
          subject: 'Return Reminder - {{orderNumber}}',
          body: `Hi {{firstName}},

This is a reminder that your rental return is due on {{returnDate}}.

Order Details:
- Order Number: {{orderNumber}}
- Return Location: {{returnLocation}}
- Items to return: {{itemsList}}

Please ensure all items are returned in good condition to avoid additional charges.

Best regards,
Rental Management Team`,
          variables: ['firstName', 'returnDate', 'orderNumber', 'returnLocation', 'itemsList'],
          isActive: true,
          sendBeforeDays: 2
        },
        {
          name: 'payment_reminder',
          description: 'Payment reminder for pending invoices',
          type: 'payment_reminder',
          channel: 'email',
          subject: 'Payment Reminder - Invoice {{invoiceNumber}}',
          body: `Hi {{firstName}},

This is a reminder that your payment is due for invoice {{invoiceNumber}}.

Amount Due: ₹{{amountDue}}
Due Date: {{dueDate}}

Please make the payment to avoid late fees.

Best regards,
Rental Management Team`,
          variables: ['firstName', 'invoiceNumber', 'amountDue', 'dueDate'],
          isActive: true,
          sendBeforeDays: 1
        },
        {
          name: 'order_confirmation',
          description: 'Order confirmation email',
          type: 'order_confirmation',
          channel: 'email',
          subject: 'Order Confirmed - {{orderNumber}}',
          body: `Hi {{firstName}},

Your rental order has been confirmed!

Order Details:
- Order Number: {{orderNumber}}
- Total Amount: ₹{{totalAmount}}
- Rental Period: {{startDate}} to {{endDate}}

We will contact you soon with pickup details.

Best regards,
Rental Management Team`,
          variables: ['firstName', 'orderNumber', 'totalAmount', 'startDate', 'endDate'],
          isActive: true
        }
      ]);
      console.log('✅ Notification templates created');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@rental.com / Admin123!');
    console.log('Staff: staff@rental.com / Staff123!');
    console.log('Customer: customer@example.com / Customer123!');
    console.log('Corporate: corporate@company.com / Corp123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;