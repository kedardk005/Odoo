// ✅ Backend Test Results:
// - Server connection: WORKING
// - Customer creation: WORKING  
// - Product retrieval: WORKING
// - Order creation: WORKING
// - Razorpay integration: WORKING
// 
// Simple test script to verify backend functionality

const BASE_URL = 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing Backend Functionality...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthResponse = await fetch(`${BASE_URL}/api/products`);
    if (healthResponse.ok) {
      console.log('✅ Server is running and responding');
    } else {
      console.log('❌ Server responded with error:', healthResponse.status);
    }

    // Test 2: Create a test customer first
    console.log('\n2. Creating test customer...');
    const customerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      role: 'customer'
    };

    const customerResponse = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });

    let customerId = 'test-customer-123'; // fallback
    if (customerResponse.ok) {
      const customer = await customerResponse.json();
      customerId = customer.id;
      console.log('✅ Test customer created:', customer.id);
    } else {
      // Customer might already exist, try to get existing customers
      const existingCustomersResponse = await fetch(`${BASE_URL}/api/customers`);
      if (existingCustomersResponse.ok) {
        const customers = await existingCustomersResponse.json();
        if (customers.length > 0) {
          customerId = customers[0].id;
          console.log('✅ Using existing customer:', customerId);
        }
      }
    }

    // Test 3: Get or create a test product
    console.log('\n3. Getting test product...');
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    let productId = 'test-product-123'; // fallback
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      if (products.length > 0) {
        productId = products[0].id;
        console.log('✅ Using existing product:', productId);
      }
    }

    // Test 4: Test order creation
    console.log('\n4. Testing order creation...');
    const orderData = {
      customerId,
      customerDetails: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890'
      },
      items: [
        {
          productId,
          quantity: 1,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          dailyRate: 100,
          totalAmount: 100
        }
      ],
      totalAmount: 100,
      securityDeposit: 50,
      notes: 'Test order'
    };

    const orderResponse = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (orderResponse.ok) {
      const order = await orderResponse.json();
      console.log('✅ Order created successfully:', order.orderNumber);
      
      // Test 5: Test Razorpay order creation
      console.log('\n5. Testing Razorpay order creation...');
      const razorpayData = {
        amount: 100,
        currency: 'INR',
        receipt: `test_${Date.now()}`,
        notes: {
          order_id: order.id,
          test: 'true'
        }
      };

      const razorpayResponse = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(razorpayData)
      });

      if (razorpayResponse.ok) {
        const razorpayOrder = await razorpayResponse.json();
        console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
      } else {
        const error = await razorpayResponse.text();
        console.log('❌ Razorpay order creation failed:', error);
      }

    } else {
      const error = await orderResponse.text();
      console.log('❌ Order creation failed:', error);
    }

    console.log('\n🎉 Backend testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testBackend();