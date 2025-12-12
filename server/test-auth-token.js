const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3002/api';

async function testAuth() {
  console.log('🔐 Testing authentication...\n');

  try {
    // 1. Login with dev mode
    console.log('1️⃣ Logging in with dev mode...');
    const loginResponse = await axios.post(`${API_URL}/auth/dev-login`, {
      userId: '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6',
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Test conversational components endpoint
    console.log('2️⃣ Testing conversational components endpoint...');
    const phoneNumberId = '803320889535856';
    
    try {
      const response = await axios.get(
        `${API_URL}/conversational-components/${phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ Conversational components endpoint works!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Conversational components endpoint failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data);
      console.error('\n⚠️ This means the backend server needs to be restarted!');
      console.error('Run: cd server && npm run dev');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAuth();
