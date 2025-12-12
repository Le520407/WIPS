const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

async function testManualSignup() {
  console.log('🧪 Testing Manual Signup...\n');

  try {
    // Test manual signup
    console.log('1️⃣ Creating account with manual signup...');
    const signupResponse = await axios.post(`${API_URL}/auth/manual-signup`, {
      name: 'Test Manual User',
      email: 'manual@test.com',
      whatsapp_business_account_id: '673274279136021',
      phone_number_id: '803320889535856',
      access_token: 'test_token_' + Date.now()
    });

    console.log('✅ Signup successful!');
    console.log('Token:', signupResponse.data.token.substring(0, 20) + '...');
    console.log('User:', signupResponse.data.user.name);
    console.log('Email:', signupResponse.data.user.email);

    // Test getting user info with token
    console.log('\n2️⃣ Getting user info with token...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${signupResponse.data.token}`
      }
    });

    console.log('✅ User info retrieved!');
    console.log('User:', meResponse.data.user.name);
    console.log('Role:', meResponse.data.user.role);
    console.log('Status:', meResponse.data.user.status);

    // Check if account was created
    console.log('\n3️⃣ Checking if account was created...');
    const accountsResponse = await axios.get(`${API_URL}/admin/accounts`, {
      headers: {
        'Authorization': `Bearer ${signupResponse.data.token}`
      }
    });

    console.log('✅ Accounts found:', accountsResponse.data.accounts.length);
    if (accountsResponse.data.accounts.length > 0) {
      const account = accountsResponse.data.accounts[0];
      console.log('Account Name:', account.name);
      console.log('WABA ID:', account.whatsapp_business_account_id);
      console.log('Phone ID:', account.phone_number_id);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testManualSignup();
