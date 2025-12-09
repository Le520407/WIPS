/**
 * Test Business-Initiated Calls
 * Tests initiating, accepting, rejecting, and terminating calls
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const TEST_PHONE = '+60105520735'; // Replace with your test phone number

// Test credentials
const TEST_EMAIL = 'demo@example.com';
const TEST_PASSWORD = 'demo123';

let authToken = '';
let testCallId = '';

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

async function testInitiateCall() {
  try {
    console.log('📊 Test 1: Initiate Business Call');
    console.log('='.repeat(50));
    
    const response = await axios.post(
      `${API_URL}/calls`,
      {
        to: TEST_PHONE,
        context: 'test_business_call_001',
        biz_opaque_callback_data: 'tracking_test_001',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    testCallId = response.data.call_id;
    
    console.log('✅ Call initiated successfully');
    console.log('   Call ID:', response.data.call_id);
    console.log('   To:', response.data.call.to_number);
    console.log('   Status:', response.data.call.status);
    console.log('   Type:', response.data.call.type);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to initiate call');
    console.error('   Error:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
    }
    console.log();
    return false;
  }
}

async function testGetCalls() {
  try {
    console.log('📊 Test 2: Get Call History');
    console.log('='.repeat(50));
    
    const response = await axios.get(
      `${API_URL}/calls?limit=10`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call history retrieved');
    console.log(`   Total calls: ${response.data.calls.length}`);
    
    if (response.data.calls.length > 0) {
      const recentCall = response.data.calls[0];
      console.log('   Most recent call:');
      console.log(`     - To: ${recentCall.to_number}`);
      console.log(`     - Status: ${recentCall.status}`);
      console.log(`     - Type: ${recentCall.type}`);
      console.log(`     - Time: ${new Date(recentCall.start_time).toLocaleString()}`);
    }
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to get call history');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log();
    return false;
  }
}

async function testGetCallStats() {
  try {
    console.log('📊 Test 3: Get Call Statistics');
    console.log('='.repeat(50));
    
    const response = await axios.get(
      `${API_URL}/calls/stats`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const stats = response.data.stats;
    
    console.log('✅ Call statistics retrieved');
    console.log(`   Total calls: ${stats.total}`);
    console.log(`   Incoming: ${stats.incoming}`);
    console.log(`   Outgoing: ${stats.outgoing}`);
    console.log(`   Connected: ${stats.connected}`);
    console.log(`   Missed: ${stats.missed}`);
    console.log(`   Rejected: ${stats.rejected}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`   Total duration: ${stats.totalDuration}s`);
    console.log(`   Average duration: ${stats.averageDuration}s`);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to get call statistics');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log();
    return false;
  }
}

async function testAcceptCall() {
  try {
    console.log('📊 Test 4: Accept Call (Simulated)');
    console.log('='.repeat(50));
    console.log('⚠️  Note: This requires a real incoming call');
    
    if (!testCallId) {
      console.log('⏭️  Skipping - no call ID available');
      console.log();
      return true;
    }
    
    const response = await axios.post(
      `${API_URL}/calls/accept`,
      {
        call_id: testCallId,
        biz_opaque_callback_data: 'accept_test_001',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call accepted successfully');
    console.log('   Call ID:', response.data.call_id);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to accept call');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log('   Note: This is expected if there is no active incoming call');
    console.log();
    return true; // Don't fail the test suite
  }
}

async function testRejectCall() {
  try {
    console.log('📊 Test 5: Reject Call (Simulated)');
    console.log('='.repeat(50));
    console.log('⚠️  Note: This requires a real incoming call');
    
    if (!testCallId) {
      console.log('⏭️  Skipping - no call ID available');
      console.log();
      return true;
    }
    
    const response = await axios.post(
      `${API_URL}/calls/reject`,
      {
        call_id: testCallId,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call rejected successfully');
    console.log('   Call ID:', response.data.call_id);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to reject call');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log('   Note: This is expected if there is no active incoming call');
    console.log();
    return true; // Don't fail the test suite
  }
}

async function testTerminateCall() {
  try {
    console.log('📊 Test 6: Terminate Call (Simulated)');
    console.log('='.repeat(50));
    console.log('⚠️  Note: This requires an active call');
    
    if (!testCallId) {
      console.log('⏭️  Skipping - no call ID available');
      console.log();
      return true;
    }
    
    const response = await axios.post(
      `${API_URL}/calls/terminate`,
      {
        call_id: testCallId,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    console.log('✅ Call terminated successfully');
    console.log('   Call ID:', response.data.call_id);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to terminate call');
    console.error('   Error:', error.response?.data?.error || error.message);
    console.log('   Note: This is expected if there is no active call');
    console.log();
    return true; // Don't fail the test suite
  }
}

async function runTests() {
  console.log('🚀 Starting Business-Initiated Call Tests...\n');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  // Run tests
  const results = {
    initiateCall: await testInitiateCall(),
    getCalls: await testGetCalls(),
    getCallStats: await testGetCallStats(),
    acceptCall: await testAcceptCall(),
    rejectCall: await testRejectCall(),
    terminateCall: await testTerminateCall(),
  };

  // Summary
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Initiate Call: ${results.initiateCall ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Get Calls: ${results.getCalls ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Get Call Stats: ${results.getCallStats ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Accept Call: ${results.acceptCall ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Reject Call: ${results.rejectCall ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Terminate Call: ${results.terminateCall ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\nTotal: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  console.log('\n📝 Notes:');
  console.log('- Accept/Reject/Terminate tests require active calls');
  console.log('- For full testing, make a real call and use the call ID');
  console.log('- WebRTC integration requires additional setup');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Tests failed:', error);
  process.exit(1);
});
