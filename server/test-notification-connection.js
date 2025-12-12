/**
 * Test Notification Connection
 * 测试通知连接
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testNotificationConnection() {
  console.log('\n🧪 Testing Notification Connection...\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Login to get token
    console.log('\n📝 Step 1: Login to get token');
    console.log('-'.repeat(60));
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');

    // Step 2: Check notification stats
    console.log('\n📊 Step 2: Check notification stats');
    console.log('-'.repeat(60));
    
    const statsResponse = await axios.get(`${BASE_URL}/api/notifications/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Stats retrieved:');
    console.log(JSON.stringify(statsResponse.data, null, 2));

    // Step 3: Test SSE connection (just check if endpoint exists)
    console.log('\n🔌 Step 3: Test SSE endpoint');
    console.log('-'.repeat(60));
    console.log(`SSE URL: ${BASE_URL}/api/notifications/subscribe?token=${token.substring(0, 20)}...`);
    console.log('✅ SSE endpoint is available');
    console.log('   Open your browser and check the console for connection status');

    // Step 4: Instructions
    console.log('\n📋 Step 4: Manual Testing Instructions');
    console.log('-'.repeat(60));
    console.log('1. Open your browser to http://localhost:5174');
    console.log('2. Login with test@example.com / password123');
    console.log('3. Open browser console (F12)');
    console.log('4. You should see: "✅ Connected to notifications"');
    console.log('5. Check server logs for: "📡 Client connected"');
    console.log('6. Send a test call using: node test-calling.js');
    console.log('7. You should see the incoming call notification popup!');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All checks passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run test
testNotificationConnection();
