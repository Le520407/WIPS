const axios = require('axios');

const API_URL = 'http://localhost:3002';

// Test credentials
const TEST_USER = {
  phone: '+1234567890',
  password: 'demo123'
};

async function login() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_USER);
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetMissedCalls(token) {
  console.log('\n📞 Testing: Get Missed Calls');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/missed-calls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Missed calls retrieved');
    console.log('\nStatistics:');
    console.log(`  Total Missed: ${response.data.statistics.total_missed}`);
    console.log(`  Unique Contacts: ${response.data.statistics.unique_contacts}`);
    console.log(`  Needs Callback: ${response.data.statistics.needs_callback}`);
    
    if (response.data.missed_calls.length > 0) {
      console.log('\nRecent Missed Calls:');
      response.data.missed_calls.slice(0, 5).forEach(call => {
        console.log(`  ${call.from_number} - ${call.status} - ${new Date(call.created_at).toLocaleString()}`);
        console.log(`    Callback Sent: ${call.callback_sent}, Completed: ${call.callback_completed}`);
      });
    }
    
    if (Object.keys(response.data.grouped_by_phone).length > 0) {
      console.log('\nGrouped by Phone:');
      Object.entries(response.data.grouped_by_phone).forEach(([phone, calls]) => {
        console.log(`  ${phone}: ${calls.length} missed call(s)`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetMissedCallsCount(token) {
  console.log('\n🔢 Testing: Get Missed Calls Count');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/missed-calls/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Count retrieved');
    console.log(`\nUnhandled Missed Calls: ${response.data.count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUnreadOnly(token) {
  console.log('\n📋 Testing: Get Unread Missed Calls Only');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/missed-calls`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { unread_only: 'true' }
    });
    
    console.log('✅ Unread missed calls retrieved');
    console.log(`\nUnread Count: ${response.data.missed_calls.length}`);
    console.log(`Needs Callback: ${response.data.statistics.needs_callback}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInitiateCallback(token, callId) {
  console.log(`\n📞 Testing: Initiate Callback for Call ${callId}`);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(
      `${API_URL}/api/missed-calls/${callId}/callback`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Callback initiated');
    console.log(`\nTo: ${response.data.to}`);
    console.log(`Call ID: ${response.data.call_id}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSendMessage(token, callId) {
  console.log(`\n💬 Testing: Send Message for Call ${callId}`);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(
      `${API_URL}/api/missed-calls/${callId}/message`,
      {
        message: 'Hi, I noticed you tried to call me. How can I help you?'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Message sent');
    console.log(`\nTo: ${response.data.to}`);
    console.log(`Message ID: ${response.data.message_id}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMarkAsHandled(token, callId) {
  console.log(`\n✓ Testing: Mark Call ${callId} as Handled`);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(
      `${API_URL}/api/missed-calls/${callId}/mark-handled`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Marked as handled');
    console.log(`\nPhone: ${response.data.call.from_number}`);
    console.log(`Completed: ${response.data.call.callback_completed}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBulkMarkAsHandled(token, callIds) {
  console.log(`\n✓✓ Testing: Bulk Mark as Handled`);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(
      `${API_URL}/api/missed-calls/bulk/mark-handled`,
      { call_ids: callIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Bulk marked as handled');
    console.log(`\nCount: ${response.data.count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Missed Calls API Tests');
  console.log('='.repeat(50));
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    const token = await login();
    console.log('✅ Login successful');
    
    // Run tests
    const results = {
      getMissedCalls: await testGetMissedCalls(token),
      getCount: await testGetMissedCallsCount(token),
      getUnreadOnly: await testGetUnreadOnly(token),
      // Uncomment to test with actual call IDs:
      // initiateCallback: await testInitiateCallback(token, 1),
      // sendMessage: await testSendMessage(token, 1),
      // markAsHandled: await testMarkAsHandled(token, 1),
      // bulkMarkAsHandled: await testBulkMarkAsHandled(token, [1, 2]),
    };
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above.');
    }
    
    console.log('\n💡 Tips:');
    console.log('  - To test callback/message features, uncomment the tests and provide actual call IDs');
    console.log('  - Make some missed calls first to see data');
    console.log('  - Check the frontend at http://localhost:5174/missed-calls');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runTests();
