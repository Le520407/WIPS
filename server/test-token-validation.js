const axios = require('axios');

const API_URL = 'http://localhost:3002';

async function testTokenValidation() {
  console.log('🔍 Testing Token Validation\n');

  // Step 1: Login to get a token
  console.log('Step 1: Logging in as test user...');
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/test-login`, {
      email: 'test@whatsapp-platform.com'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('');

    // Step 2: Test the token with conversational components endpoint
    console.log('Step 2: Testing token with conversational components API...');
    const phoneNumberId = '803320889535856';
    
    try {
      const response = await axios.get(
        `${API_URL}/api/conversational-components/${phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Token validation successful!');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ Token validation failed');
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
        
        // Additional debugging
        console.log('\n🔍 Debugging Info:');
        console.log('Request headers:', error.config.headers);
      } else {
        console.log('❌ Request failed:', error.message);
      }
    }

    // Step 3: Test with /api/auth/me endpoint
    console.log('\nStep 3: Testing with /api/auth/me endpoint...');
    try {
      const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ /api/auth/me successful');
      console.log('User:', meResponse.data.user.email);
    } catch (error) {
      console.log('❌ /api/auth/me failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
  }
}

testTokenValidation();
