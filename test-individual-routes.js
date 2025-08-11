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

console.log('Testing individual route files...\n');

for (const routeFile of routeFiles) {
  try {
    const app = express();
    console.log(`Testing ${routeFile} routes...`);
    
    const route = require(`./src/routes/${routeFile}`);
    app.use(`/api/${routeFile}`, route);
    
    console.log(`✓ ${routeFile} routes are OK`);
  } catch (error) {
    console.error(`✗ ${routeFile} routes error:`, error.message);
    console.error('Full error:', error.stack);
    break;
  }
}

console.log('\nIndividual route testing complete!');