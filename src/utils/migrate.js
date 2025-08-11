const { sequelize } = require('../config/database');
const setupAssociations = require('../models/associations');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Setup model associations
    setupAssociations();

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully');

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrate;