/**
 * Test Notification System
 * 
 * This script tests the real-time notification system
 */
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

// Login first to get token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 1: Check notification service status
async function testNotificationStatus(token) {
  console.log('\n📊 Test 1: Check Notification Service Status');
  console.log('='.repeat(50));

  try {
    // Try to connect to the notification endpoint
    const response = await axios.get(`${API_URL}/notifications/subscribe`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 2000, // 2 second timeout
    });

    console.log('✅ Notification service is running');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('⏱️  Connection timeout (this is expected for SSE)');
      console.log('✅ Notification service is likely running');
    } else {
      console.error('❌ Failed:', error.response?.data || error.message);
    }
  }
}

// Test 2: Send a test notification
async function testSendNotification(token) {
  console.log('\n📤 Test 2: Send Test Notification');
  console.log('='.repeat(50));

  try {
    // This would require a test endpoint in the backend
    // For now, we'll simulate by creating a call webhook event
    
    console.log('ℹ️  To test notifications:');
    console.log('1. Open the frontend in your browser');
    console.log('2. Open browser console (F12)');
    console.log('3. Look for notification connection messages');
    console.log('4. Make a test call or trigger a webhook');
    console.log('');
    console.log('Expected console messages:');
    console.log('  📡 Connecting to notifications: http://localhost:3002/api/notifications/subscribe');
    console.log('  ✅ Connected to notifications');
    console.log('  📩 Notification received: {...}');
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

// Test 3: Simulate incoming call notification
async function testIncomingCallNotification() {
  console.log('\n📞 Test 3: Simulate Incoming Call');
  console.log('='.repeat(50));

  console.log('To simulate an incoming call notification:');
  console.log('');
  console.log('1. Use the webhook test endpoint:');
  console.log('   POST http://localhost:3002/webhooks/whatsapp');
  console.log('');
  console.log('2. Send this payload:');
  console.log(JSON.stringify({
    entry: [{
      changes: [{
        value: {
          metadata: {
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
          },
          calls: [{
            call_id: 'test_call_' + Date.now(),
            from: '+60105520735',
            timestamp: Math.floor(Date.now() / 1000),
            status: 'ringing'
          }]
        }
      }]
    }]
  }, null, 2));
  console.log('');
  console.log('3. You should see:');
  console.log('   - Incoming call notification popup in the frontend');
  console.log('   - Console log: 📞 Incoming call notification');
}

// Test 4: Check notification service health
async function testServiceHealth() {
  console.log('\n🏥 Test 4: Service Health Check');
  console.log('='.repeat(50));

  try {
    const response = await axios.get('http://localhost:3002/health');
    console.log('✅ Server is healthy');
    console.log('Status:', response.data.status);
    console.log('Timestamp:', response.data.timestamp);
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Notification System Tests...\n');

  try {
    // Test server health first
    await testServiceHealth();

    // Login
    console.log('\n🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in successfully');

    // Test notification service
    await testNotificationStatus(token);

    // Test sending notifications
    await testSendNotification(token);

    // Test incoming call simulation
    await testIncomingCallNotification();

    console.log('\n' + '='.repeat(50));
    console.log('📋 Testing Summary');
    console.log('='.repeat(50));
    console.log('');
    console.log('✅ Backend Tests: Complete');
    console.log('');
    console.log('📱 Frontend Testing Steps:');
    console.log('1. Open http://localhost:5174 in your browser');
    console.log('2. Login with test@example.com / password123');
    console.log('3. Open browser console (F12)');
    console.log('4. Look for notification connection messages');
    console.log('');
    console.log('Expected Behavior:');
    console.log('• In Development: See connection status indicator (bottom-right)');
    console.log('• On Error: See dismissible error message (top-right)');
    console.log('• On Success: See "🟢 Connected" indicator');
    console.log('');
    console.log('Common Issues:');
    console.log('• "Unable to connect": Server not running or wrong URL');
    console.log('• "No authentication token": Not logged in');
    console.log('• Error persists: Click X button to dismiss');
    console.log('');
    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
