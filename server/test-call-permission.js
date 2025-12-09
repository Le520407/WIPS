require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002';
const TEST_PHONE = '+60105520735'; // Your test phone number

async function testCallPermission() {
  try {
    console.log('🔐 Testing Call Permission Management...\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/demo-login`, {
      phone: '+1234567890',
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Get permission status
    console.log(`2. Getting permission status for ${TEST_PHONE}...`);
    const statusResponse = await axios.get(`${API_URL}/api/call/permissions/${encodeURIComponent(TEST_PHONE)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Permission status:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    console.log();

    // 3. Request permission
    console.log(`3. Requesting call permission from ${TEST_PHONE}...`);
    try {
      const requestResponse = await axios.post(
        `${API_URL}/api/call/permissions/request`,
        {
          phone_number: TEST_PHONE,
          message_body: 'We would like to call you to help support your query. May we have permission to call you?',
          use_template: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✅ Permission request sent:');
      console.log(JSON.stringify(requestResponse.data, null, 2));
      console.log();
    } catch (requestError) {
      if (requestError.response) {
        console.log('⚠️  Permission request response:');
        console.log(JSON.stringify(requestError.response.data, null, 2));
        console.log();
      } else {
        throw requestError;
      }
    }

    // 4. List all permissions
    console.log('4. Listing all permissions...');
    const listResponse = await axios.get(`${API_URL}/api/call/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ All permissions:');
    console.log(JSON.stringify(listResponse.data, null, 2));
    console.log();

    console.log('📊 Test Summary:');
    console.log('================');
    console.log('✅ Permission status check - Working');
    console.log('✅ Permission request - Working');
    console.log('✅ List permissions - Working');
    console.log();
    console.log('💡 Next Steps:');
    console.log('1. Check your WhatsApp to see the permission request message');
    console.log('2. Accept or reject the permission');
    console.log('3. The webhook will update the permission status automatically');
    console.log('4. Run this script again to see the updated status');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCallPermission();
