const { Sequelize } = require('sequelize');
require('dotenv').config();

const createDatabase = async () => {
  let tempSequelize;
  
  try {
    console.log('🔄 Creating database "LocalPostgreSQL"...');
    
    // Connect to default 'postgres' database to create our target database
    tempSequelize = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'postgres', // Connect to default postgres database
      dialect: 'postgres',
      logging: false
    });

    // Test connection to postgres database
    await tempSequelize.authenticate();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database already exists
    const [results] = await tempSequelize.query(`
      SELECT 1 FROM pg_database WHERE datname = 'LocalPostgreSQL';
    `);

    if (results && results.length > 0) {
      console.log('ℹ️  Database "LocalPostgreSQL" already exists');
    } else {
      // Create the database
      await tempSequelize.query('CREATE DATABASE "LocalPostgreSQL";');
      console.log('✅ Database "LocalPostgreSQL" created successfully');
    }

    // Close connection to postgres database
    await tempSequelize.close();

    // Now test connection to our new database
    const targetSequelize = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'LocalPostgreSQL',
      dialect: 'postgres',
      logging: false
    });

    await targetSequelize.authenticate();
    console.log('✅ Successfully connected to "LocalPostgreSQL" database');

    // Get database info
    const [info] = await targetSequelize.query(`
      SELECT 
        version() as version,
        current_database() as database,
        current_user as user,
        pg_size_pretty(pg_database_size(current_database())) as size;
    `);

    if (info && info.length > 0) {
      const dbInfo = info[0];
      console.log('\n📊 Database Information:');
      console.log(`   PostgreSQL Version: ${dbInfo.version.split(' ')[0]} ${dbInfo.version.split(' ')[1]}`);
      console.log(`   Database: ${dbInfo.database}`);
      console.log(`   User: ${dbInfo.user}`);
      console.log(`   Database Size: ${dbInfo.size}`);
    }

    await targetSequelize.close();
    return true;

  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL Connection Issues:');
      console.log('1. Make sure PostgreSQL service is running');
      console.log('2. Check if port 5432 is available');
      console.log('3. Verify PostgreSQL is installed on your system');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication Issues:');
      console.log('1. Check if username "postgres" exists');
      console.log('2. Verify the password "6969Ma@18082004" is correct');
      console.log('3. Make sure the user has CREATEDB privileges');
    } else if (error.code === '42501') {
      console.log('\n💡 Permission Issues:');
      console.log('1. The user needs CREATEDB privileges');
      console.log('2. Connect as superuser to grant permissions:');
      console.log('   ALTER USER postgres CREATEDB;');
    }
    
    return false;
  } finally {
    if (tempSequelize) {
      try {
        await tempSequelize.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
};

// Run database creation if called directly
if (require.main === module) {
  createDatabase()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Database setup completed successfully!');
        console.log('📋 Next steps:');
        console.log('1. Run: node src/utils/createSchema.js');
        console.log('2. Run: node src/utils/seedNewSchema.js');
        console.log('3. Start your app: npm run dev');
        process.exit(0);
      } else {
        console.log('\n💥 Database setup failed. Please check the connection details.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Database setup error:', error);
      process.exit(1);
    });
}

module.exports = createDatabase;