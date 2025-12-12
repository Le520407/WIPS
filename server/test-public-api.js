/**
 * Test script for Public API (API Key Authentication)
 * 
 * This tests the public API endpoints that external websites will use
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002/api/v1';

// API key generated from test-website-api.js
const API_KEY = 'wsk_GRFlNFXpwcipvjjxB_DpOE-3ebSNujw_';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await api.get('/health');
    console.log('✅ Health check passed');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSendTextMessage() {
  console.log('\n=== Testing Send Text Message ===');
  try {
    const response = await api.post('/messages/send', {
      to: '85291234567', // Replace with test number
      type: 'text',
      text: {
        body: 'Hello from Public API! This is a test message.'
      }
    });
    console.log('✅ Message sent successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.messageId;
  } catch (error) {
    console.error('❌ Send message failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSendTemplateMessage() {
  console.log('\n=== Testing Send Template Message ===');
  try {
    const response = await api.post('/messages/send', {
      to: '85291234567', // Replace with test number
      type: 'template',
      template: {
        name: 'hello_world',
        language: {
          code: 'en_US'
        }
      }
    });
    console.log('✅ Template message sent successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.messageId;
  } catch (error) {
    console.error('❌ Send template failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetMessageHistory() {
  console.log('\n=== Testing Get Message History ===');
  try {
    const response = await api.get('/messages/history', {
      params: {
        limit: 10,
        offset: 0
      }
    });
    console.log('✅ Message history retrieved');
    console.log(`Found ${response.data.messages.length} messages`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Get history failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetMessageStats() {
  console.log('\n=== Testing Get Message Statistics ===');
  try {
    const response = await api.get('/messages/stats', {
      params: {
        days: 30
      }
    });
    console.log('✅ Message statistics retrieved');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Get stats failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidApiKey() {
  console.log('\n=== Testing Invalid API Key ===');
  try {
    const invalidApi = axios.create({
      baseURL: API_URL,
      headers: {
        'X-API-Key': 'wsk_invalid_key_12345',
        'Content-Type': 'application/json'
      }
    });
    
    await invalidApi.get('/health');
    console.log('❌ Should have failed with invalid API key');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid API key');
      console.log('Error:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testMissingApiKey() {
  console.log('\n=== Testing Missing API Key ===');
  try {
    const noKeyApi = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    await noKeyApi.get('/health');
    console.log('❌ Should have failed without API key');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request without API key');
      console.log('Error:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testRateLimit() {
  console.log('\n=== Testing Rate Limit (sending 5 requests quickly) ===');
  try {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(api.get('/health'));
    }
    
    const results = await Promise.all(promises);
    console.log(`✅ Sent ${results.length} requests successfully`);
    console.log('Note: Rate limit is per hour, so these quick requests should pass');
    return true;
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('✅ Rate limit triggered (this is expected if limit is low)');
      console.log('Error:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       Public API Test Suite                           ║');
  console.log('║       Testing API Key Authentication                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  if (API_KEY === 'wsk_YOUR_API_KEY_HERE') {
    console.error('\n❌ ERROR: Please set a valid API_KEY in this script');
    console.log('\nSteps to get an API key:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Open http://localhost:5174/websites');
    console.log('3. Create a website or select existing one');
    console.log('4. Click "Keys" button');
    console.log('5. Generate a new API key');
    console.log('6. Copy the key and paste it in this script');
    return;
  }
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Security tests
  const securityTests = [
    testMissingApiKey,
    testInvalidApiKey
  ];
  
  for (const test of securityTests) {
    const result = await test();
    if (result) results.passed++;
    else results.failed++;
  }
  
  // Functional tests
  const functionalTests = [
    testHealthCheck,
    testGetMessageHistory,
    testGetMessageStats,
    testRateLimit
  ];
  
  for (const test of functionalTests) {
    const result = await test();
    if (result) results.passed++;
    else results.failed++;
  }
  
  // Message sending tests (commented out by default to avoid sending real messages)
  // Uncomment these when you're ready to test with a real phone number
  /*
  await testSendTextMessage();
  await testSendTemplateMessage();
  */
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                   Test Results                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);
