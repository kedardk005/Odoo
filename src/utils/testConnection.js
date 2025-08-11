const { sequelize } = require('../config/database');

const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`📡 Connecting to: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`👤 Username: ${process.env.DB_USERNAME}`);
    
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');

    // Get database info
    const [results] = await sequelize.query(`
      SELECT version() as version, 
             current_database() as database, 
             current_user as user,
             inet_server_addr() as host,
             inet_server_port() as port;
    `);
    
    if (results && results.length > 0) {
      const info = results[0];
      console.log('\n📊 Database Information:');
      console.log(`   PostgreSQL Version: ${info.version}`);
      console.log(`   Database: ${info.database}`);
      console.log(`   User: ${info.user}`);
      console.log(`   Host: ${info.host || 'localhost'}`);
      console.log(`   Port: ${info.port || '5432'}`);
    }

    // Check existing tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    if (tables && tables.length > 0) {
      console.log('\n📋 Existing Tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('\n📋 No existing tables found in the database.');
    }

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting Steps:');
      console.log('1. Make sure PostgreSQL service is running');
      console.log('2. Check if the port 5432 is correct');
      console.log('3. Verify the hostname is accessible');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed:');
      console.log('1. Check username and password');
      console.log('2. Verify user has permission to access the database');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database not found:');
      console.log('1. Make sure the database "LocalPostgreSQL" exists');
      console.log('2. Create the database if it doesn\'t exist');
    }
    
    return false;
  }
};

// Run connection test if called directly
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Connection test successful! Ready to create schema.');
        process.exit(0);
      } else {
        console.log('\n💥 Connection test failed. Please fix the issues above.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Connection test error:', error);
      process.exit(1);
    });
}

module.exports = testDatabaseConnection;