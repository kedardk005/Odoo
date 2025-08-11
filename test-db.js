const { sequelize } = require('./src/config/database');
const setupAssociations = require('./src/models/associations');

console.log('Testing database connection...');

async function testDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
    
    // Setup associations
    setupAssociations();
    console.log('✓ Model associations set up.');
    
    // Sync all models (create tables)
    console.log('Creating database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ Database tables created/updated successfully.');
    
    // Test each model
    const models = [
      'User', 'Customer', 'Product', 'Category', 'Order', 'OrderItem', 
      'Rental', 'Quotation', 'QuotationItem', 'Invoice', 'InvoiceItem', 
      'Payment', 'Delivery', 'DeliveryItem', 'Notification', 'PriceList', 
      'PriceListItem'
    ];
    
    console.log('\nTesting model imports...');
    for (const modelName of models) {
      try {
        const model = require(`./src/models/${modelName}`);
        console.log(`✓ ${modelName} model loaded successfully`);
      } catch (error) {
        console.log(`✗ ${modelName} model error: ${error.message}`);
      }
    }
    
    console.log('\nDatabase setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabase();