const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3002';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+60105520735';

async function testLocationRequest() {
  try {
    console.log('🧪 Testing Location Request...\n');

    // Get token
    const loginResponse = await axios.post(`${API_URL}/api/auth/demo-login`);
    const token = loginResponse.data.token;
    console.log('✅ Got auth token\n');

    // Test: Request location
    console.log('📍 Requesting location from:', TEST_PHONE);
    const response = await axios.post(
      `${API_URL}/api/messages/request-location`,
      {
        to: TEST_PHONE,
        bodyText: 'Please share your location so we can assist you better.'
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log('✅ Location request sent!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');

    console.log('✅ Test passed!');
    console.log('\n💡 Check your WhatsApp - you should see a message with a "Share Location" button!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLocationRequest();
