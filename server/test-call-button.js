/**
 * Test Call Button Messages
 * Tests sending call button messages and generating deep links
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const TEST_PHONE = '+60105520735'; // Replace with your test phone number

// Test credentials
const TEST_EMAIL = 'demo@example.com';
const TEST_PASSWORD = 'demo123';

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSendCallButtonMessage() {
  try {
    console.log('📊 Test 1: Send Interactive Call Button Message');
    console.log('='.repeat(50));
    
    const response = await axios.post(
      `${API_URL}/call/button/send`,
      {
        to: TEST_PHONE,
        body_text: 'You can call us on WhatsApp now for faster service!',
        button_text: 'Call Now',
        ttl_minutes: 1440, // 24 hours
        payload: 'test_call_button_001',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call button message sent successfully');
    console.log('   Message ID:', response.data.message_id);
    console.log('   To:', response.data.to);
    console.log('   Status:', response.data.success ? 'Success' : 'Failed');
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to send call button message');
    console.error('   Error:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
    }
    console.log();
    return false;
  }
}

async function testGenerateCallDeepLink() {
  try {
    console.log('📊 Test 2: Generate Call Deep Link');
    console.log('='.repeat(50));
    
    const response = await axios.post(
      `${API_URL}/call/button/deeplink/generate`,
      {
        phone_number: process.env.WHATSAPP_PHONE_NUMBER_ID,
        payload: 'deeplink_test_001',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call deep link generated successfully');
    console.log('   Deep Link:', response.data.deep_link);
    console.log('   Phone:', response.data.phone_number);
    console.log('   Payload:', response.data.payload);
    console.log('   QR Code URL:', response.data.qr_code_url);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to generate call deep link');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log();
    return false;
  }
}

async function testSendCallDeepLinkMessage() {
  try {
    console.log('📊 Test 3: Send Message with Call Deep Link');
    console.log('='.repeat(50));
    
    const response = await axios.post(
      `${API_URL}/call/button/deeplink/send`,
      {
        to: TEST_PHONE,
        message_text: 'Need help? Call us directly on WhatsApp:',
        phone_number: process.env.WHATSAPP_PHONE_NUMBER_ID,
        payload: 'deeplink_message_001',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Message with call deep link sent successfully');
    console.log('   Message ID:', response.data.message_id);
    console.log('   To:', response.data.to);
    console.log('   Deep Link:', response.data.deep_link);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to send call deep link message');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log();
    return false;
  }
}

async function testCreateCallButtonTemplate() {
  try {
    console.log('📊 Test 4: Create Call Button Template');
    console.log('='.repeat(50));
    
    const response = await axios.post(
      `${API_URL}/call/button/template/create`,
      {
        name: 'call_support_button',
        category: 'UTILITY',
        language: 'en',
        body_text: 'Our support team is ready to help you. Call us now on WhatsApp!',
        button_text: 'Call Support',
        additional_buttons: [
          {
            type: 'URL',
            text: 'Visit Website',
            url: 'https://example.com/support',
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call button template created successfully');
    console.log('   Template ID:', response.data.template_id);
    console.log('   Status:', response.data.status);
    console.log('   Category:', response.data.category);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to create call button template');
    console.error('   Error:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
    }
    console.log();
    return false;
  }
}

async function testSendCallButtonTemplate() {
  try {
    console.log('📊 Test 5: Send Call Button Template');
    console.log('='.repeat(50));
    console.log('⚠️  Note: This requires an approved template');
    
    const response = await axios.post(
      `${API_URL}/call/button/template/send`,
      {
        to: TEST_PHONE,
        template_name: 'call_support_button',
        language_code: 'en',
        ttl_minutes: 1440,
        payload: 'template_test_001',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call button template sent successfully');
    console.log('   Message ID:', response.data.message_id);
    console.log('   To:', response.data.to);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to send call button template');
    console.error('   Error:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
    }
    console.log();
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Call Button Tests...\n');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  // Run tests
  const results = {
    sendCallButton: await testSendCallButtonMessage(),
    generateDeepLink: await testGenerateCallDeepLink(),
    sendDeepLinkMessage: await testSendCallDeepLinkMessage(),
    createTemplate: await testCreateCallButtonTemplate(),
    sendTemplate: await testSendCallButtonTemplate(),
  };

  // Summary
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Send Call Button Message: ${results.sendCallButton ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Generate Deep Link: ${results.generateDeepLink ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Send Deep Link Message: ${results.sendDeepLinkMessage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Create Template: ${results.createTemplate ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Send Template: ${results.sendTemplate ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\nTotal: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Tests failed:', error);
  process.exit(1);
});
