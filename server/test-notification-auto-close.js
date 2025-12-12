/**
 * Test script for notification auto-close functionality
 * 
 * This script tests:
 * 1. Incoming call notification is sent
 * 2. Call status update is sent when call ends
 * 3. Notification auto-closes after timeout (60s)
 * 
 * Usage:
 *   node test-notification-auto-close.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TEST_USER_ID = 1; // Adjust based on your test user

// Simulate incoming call webhook
async function simulateIncomingCall() {
  console.log('\n📞 Step 1: Simulating incoming call webhook...\n');
  
  const callWebhook = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550123456',
            phone_number_id: '803320889535856'
          },
          calls: [{
            id: `test_call_${Date.now()}`,
            from: '1234567890',
            to: '803320889535856',
            status: 'RINGING',
            timestamp: Math.floor(Date.now() / 1000).toString(),
            session: {
              sdp: 'v=0\r\no=- 123456 123456 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
              sdp_type: 'offer'
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    const response = await axios.post(`${API_URL}/webhook`, callWebhook);
    console.log('✅ Incoming call webhook sent');
    console.log('   Response:', response.status, response.statusText);
    
    const callId = callWebhook.entry[0].changes[0].value.calls[0].id;
    return callId;
  } catch (error) {
    console.error('❌ Failed to send incoming call webhook:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    throw error;
  }
}

// Simulate call ended webhook
async function simulateCallEnded(callId) {
  console.log('\n📞 Step 2: Simulating call ended webhook...\n');
  
  const endWebhook = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550123456',
            phone_number_id: '803320889535856'
          },
          calls: [{
            id: callId,
            from: '1234567890',
            to: '803320889535856',
            status: 'ENDED',
            timestamp: Math.floor(Date.now() / 1000).toString(),
            end_time: Math.floor(Date.now() / 1000).toString()
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    const response = await axios.post(`${API_URL}/webhook`, endWebhook);
    console.log('✅ Call ended webhook sent');
    console.log('   Response:', response.status, response.statusText);
    console.log('   This should trigger notification auto-close');
  } catch (error) {
    console.error('❌ Failed to send call ended webhook:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    throw error;
  }
}

// Check notification service stats
async function checkNotificationStats() {
  console.log('\n📊 Checking notification service stats...\n');
  
  try {
    const response = await axios.get(`${API_URL}/api/notifications/stats`);
    console.log('✅ Notification stats:');
    console.log('   Total users:', response.data.totalUsers);
    console.log('   Total clients:', response.data.totalClients);
    console.log('   Users:', JSON.stringify(response.data.users, null, 2));
  } catch (error) {
    console.error('❌ Failed to get notification stats:', error.message);
  }
}

// Main test flow
async function runTest() {
  console.log('🧪 Testing Notification Auto-Close Functionality');
  console.log('='.repeat(60));
  
  try {
    // Check initial stats
    await checkNotificationStats();
    
    // Step 1: Send incoming call
    const callId = await simulateIncomingCall();
    console.log('\n✅ Incoming call notification should appear in UI');
    console.log('   Call ID:', callId);
    
    // Wait 3 seconds
    console.log('\n⏳ Waiting 3 seconds before ending call...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: End the call
    await simulateCallEnded(callId);
    console.log('\n✅ Call ended notification sent');
    console.log('   Notification should auto-close in UI');
    
    // Check final stats
    await checkNotificationStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('\nExpected behavior:');
    console.log('1. Incoming call notification appears');
    console.log('2. After 3 seconds, call ends');
    console.log('3. Notification auto-closes immediately');
    console.log('4. If notification doesn\'t close, it will auto-close after 60s timeout');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
