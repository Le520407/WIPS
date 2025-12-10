require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testGroupsAPI() {
  console.log('🧪 Simple Groups API Test\n');
  console.log('='.repeat(50));
  console.log(`API URL: ${API_URL}`);
  console.log('='.repeat(50));

  try {
    // Test 1: Check server health
    console.log('\n📝 Test 1: Checking server health...');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log('✅ Server is running');
      console.log('   Status:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('   Please start the server with: npm run dev');
      process.exit(1);
    }

    // Test 2: Try demo login
    console.log('\n📝 Test 2: Testing demo login...');
    let token;
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'demo@example.com',
        password: 'demo123',
      });
      token = loginResponse.data.token;
      console.log('✅ Demo login successful');
    } catch (error) {
      console.log('⚠️  Demo login failed');
      console.log('   This is expected if demo user is not set up');
      console.log('   Error:', error.response?.data?.error || error.message);
      
      // Try to continue without token for endpoint check
      console.log('\n   Continuing with endpoint checks...');
    }

    // Test 3: Check Groups API endpoint (without auth)
    console.log('\n📝 Test 3: Checking Groups API endpoint...');
    try {
      await axios.get(`${API_URL}/api/groups`);
      console.log('✅ Groups endpoint is accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Groups endpoint exists (requires authentication)');
      } else {
        console.log('❌ Groups endpoint error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Check if we can access with token
    if (token) {
      console.log('\n📝 Test 4: Testing authenticated Groups API access...');
      try {
        const groupsResponse = await axios.get(`${API_URL}/api/groups`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'test',
          },
        });
        console.log('✅ Groups API is working!');
        console.log('   Groups found:', groupsResponse.data.groups?.length || 0);
      } catch (error) {
        console.log('⚠️  Groups API error:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Basic tests completed!');
    console.log('\n📌 Next steps:');
    console.log('   1. Make sure server is running: npm run dev');
    console.log('   2. Set up demo user or use real credentials');
    console.log('   3. Configure WHATSAPP_PHONE_NUMBER_ID in .env');
    console.log('   4. Run full tests: node test-create-group.js');

  } catch (error) {
    console.error('\n❌ Unexpected error!');
    console.error('Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Server is not running. Start it with: npm run dev');
    }
    process.exit(1);
  }
}

// Run the test
testGroupsAPI();
