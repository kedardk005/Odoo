const express = require('express');
require('dotenv').config();

const routeFiles = [
  'auth',
  'products', 
  'customers',
  'rentals',
  'quotations',
  'orders',
  'delivery',
  'invoices',
  'pricelists',
  'reports',
  'notifications'
];

console.log('Testing route combinations...\n');

// Test loading all routes together one by one
let loadedRoutes = [];

for (const routeFile of routeFiles) {
  try {
    const app = express();
    loadedRoutes.push(routeFile);
    
    console.log(`Testing combination: ${loadedRoutes.join(', ')}`);
    
    // Load all routes up to this point
    for (const route of loadedRoutes) {
      const routeModule = require(`./src/routes/${route}`);
      app.use(`/api/${route}`, routeModule);
    }
    
    console.log(`✓ Successfully loaded: ${loadedRoutes.join(', ')}`);
    
  } catch (error) {
    console.error(`✗ Error when adding ${routeFile} to combination:`, error.message);
    console.error('Failed combination:', loadedRoutes.join(', '));
    console.error('Full error:', error.stack);
    break;
  }
}

console.log('\nRoute combination testing complete!');