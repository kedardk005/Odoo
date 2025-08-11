#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests basic functionality of the Rental Management API
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test data
let authToken = null;
let testUserId = null;

// Test functions
const testHealthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.data.success) {
      log.success('Health check passed');
      return true;
    } else {
      log.error('Health check failed');
      return false;
    }
  } catch (error) {
    log.error(`Health check error: ${error.message}`);
    return false;
  }
};

const testSystemStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/status`);
    log.info(`Database: ${response.data.status.database}`);
    log.info(`Email: ${response.data.status.email}`);
    return true;
  } catch (error) {
    log.error(`System status error: ${error.message}`);
    return false;
  }
};

const testUserRegistration = async () => {
  try {
    const userData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '9999999999',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '123456'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      testUserId = response.data.data.user.id;
      log.success(`User registration successful: ${userData.email}`);
      return true;
    } else {
      log.error('User registration failed');
      return false;
    }
  } catch (error) {
    log.error(`Registration error: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testUserLogin = async () => {
  try {
    // Try login with seeded admin user
    const loginData = {
      email: 'admin@rental.com',
      password: 'Admin123!'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      log.success(`Login successful: ${loginData.email}`);
      return true;
    } else {
      log.error('Login failed');
      return false;
    }
  } catch (error) {
    log.error(`Login error: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testGetProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    
    if (response.data.success) {
      const productCount = response.data.data.products.length;
      log.success(`Products retrieved: ${productCount} products found`);
      
      if (productCount > 0) {
        const firstProduct = response.data.data.products[0];
        log.info(`Sample product: ${firstProduct.name} - ₹${firstProduct.basePrice}`);
      }
      return true;
    } else {
      log.error('Failed to retrieve products');
      return false;
    }
  } catch (error) {
    log.error(`Get products error: ${error.message}`);
    return false;
  }
};

const testProtectedRoute = async () => {
  if (!authToken) {
    log.warning('No auth token available, skipping protected route test');
    return false;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      log.success(`Protected route access successful: ${response.data.data.user.email}`);
      return true;
    } else {
      log.error('Protected route access failed');
      return false;
    }
  } catch (error) {
    log.error(`Protected route error: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testGetCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/categories`);
    
    if (response.data.success) {
      const categories = response.data.data.categories;
      log.success(`Categories retrieved: ${categories.length} categories`);
      if (categories.length > 0) {
        log.info(`Categories: ${categories.join(', ')}`);
      }
      return true;
    } else {
      log.error('Failed to retrieve categories');
      return false;
    }
  } catch (error) {
    log.error(`Get categories error: ${error.message}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log(`${colors.blue}🧪 Starting Rental Management API Tests${colors.reset}\n`);
  console.log(`Base URL: ${API_BASE_URL}\n`);

  const tests = [
    { name: 'Health Check', test: testHealthCheck },
    { name: 'System Status', test: testSystemStatus },
    { name: 'User Login (Admin)', test: testUserLogin },
    { name: 'Protected Route Access', test: testProtectedRoute },
    { name: 'Get Products', test: testGetProducts },
    { name: 'Get Categories', test: testGetCategories },
    { name: 'User Registration', test: testUserRegistration }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    console.log(`\n${colors.yellow}Testing: ${name}${colors.reset}`);
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log.error(`Test "${name}" threw an error: ${error.message}`);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n${colors.blue}📊 Test Results${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! API is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  Some tests failed. Check the API setup and database connection.${colors.reset}`);
  }

  console.log(`\n${colors.blue}💡 Next Steps:${colors.reset}`);
  console.log('1. Set up your .env file with database credentials');
  console.log('2. Run: npm run migrate && npm run seed');
  console.log('3. Start developing your frontend application');
  console.log(`4. API Documentation: ${API_BASE_URL}/info`);

  process.exit(failed === 0 ? 0 : 1);
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };