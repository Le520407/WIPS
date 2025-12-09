require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002';

async function testNotifications() {
  try {
    console.log('🔔 Testing Notification System...\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/demo-login`, {
      phone: '+1234567890',
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Get notification stats
    console.log('2. Getting notification stats...');
    const statsResponse = await axios.get(`${API_URL}/api/notifications/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Notification stats:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log();

    // 3. Send test notification
    console.log('3. Sending test notification...');
    const testResponse = await axios.post(
      `${API_URL}/api/notifications/test`,
      {
        type: 'test',
        data: {
          message: 'This is a test notification',
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Test notification result:');
    console.log(JSON.stringify(testResponse.data, null, 2));
    console.log();

    console.log('📊 Test Summary:');
    console.log('================');
    console.log('✅ Login - Working');
    console.log('✅ Get stats - Working');
    console.log('✅ Send test notification - Working');
    console.log();
    console.log('💡 Next Steps:');
    console.log('1. Open the frontend application');
    console.log('2. Login to see the notification connection status');
    console.log('3. Make a test call to see the incoming call notification');
    console.log('4. Check the browser console for notification logs');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNotifications();
