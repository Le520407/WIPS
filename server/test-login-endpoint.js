require('dotenv').config();
const axios = require('axios');

const SERVER_URL = 'http://localhost:3299';

async function testLogin() {
  console.log('🧪 Testing test-login endpoint...\n');

  try {
    const response = await axios.post(`${SERVER_URL}/api/auth/test-login`, {
      email: 'test@whatsapp-platform.com'
    });

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
