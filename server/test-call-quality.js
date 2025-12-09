const axios = require('axios');

const API_URL = 'http://localhost:3002';

// Test credentials
const TEST_USER = {
  phone: '+1234567890',
  password: 'demo123'
};

const TEST_PHONE = '+60105520735'; // Replace with your test phone number

async function login() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_USER);
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetQualityDashboard(token) {
  console.log('\n📊 Testing: Get Quality Dashboard');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/call/quality/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard retrieved successfully');
    console.log('\nSummary:');
    console.log(`  Total Contacts: ${response.data.summary.total_contacts}`);
    console.log(`  Total Calls: ${response.data.summary.total_calls}`);
    console.log(`  Connected: ${response.data.summary.total_connected}`);
    console.log(`  Missed: ${response.data.summary.total_missed}`);
    console.log(`  Overall Pickup Rate: ${response.data.summary.overall_pickup_rate}%`);
    
    console.log('\nQuality Distribution:');
    console.log(`  Excellent: ${response.data.quality_distribution.excellent}`);
    console.log(`  Good: ${response.data.quality_distribution.good}`);
    console.log(`  Fair: ${response.data.quality_distribution.fair}`);
    console.log(`  Poor: ${response.data.quality_distribution.poor}`);
    console.log(`  Critical: ${response.data.quality_distribution.critical}`);
    
    if (response.data.needs_attention.length > 0) {
      console.log('\n⚠️  Contacts Needing Attention:');
      response.data.needs_attention.forEach(contact => {
        console.log(`  ${contact.phone_number}:`);
        console.log(`    Consecutive Missed: ${contact.consecutive_missed}`);
        console.log(`    Pickup Rate: ${contact.pickup_rate}%`);
        console.log(`    Status: ${contact.quality_status}`);
        if (contact.needs_revocation) {
          console.log(`    🚨 NEEDS REVOCATION`);
        } else if (contact.needs_warning) {
          console.log(`    ⚠️  NEEDS WARNING`);
        }
      });
    }
    
    if (response.data.top_performers.length > 0) {
      console.log('\n🏆 Top Performers:');
      response.data.top_performers.forEach((contact, index) => {
        console.log(`  ${index + 1}. ${contact.phone_number}: ${contact.pickup_rate}% (${contact.connected_calls}/${contact.total_calls})`);
      });
    }
    
    console.log('\n📈 Call Trends (Last 7 Days):');
    response.data.call_trends.forEach(day => {
      console.log(`  ${day.date}: ${day.total} calls (${day.connected} connected, ${day.missed} missed) - ${day.pickup_rate}% pickup rate`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetQualityByPhone(token, phoneNumber) {
  console.log(`\n📞 Testing: Get Quality for ${phoneNumber}`);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/call/quality/${phoneNumber}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Quality metrics retrieved');
    console.log('\nMetrics:');
    console.log(`  Phone: ${response.data.phone_number}`);
    console.log(`  Total Calls: ${response.data.total_calls}`);
    console.log(`  Connected: ${response.data.connected_calls}`);
    console.log(`  Missed: ${response.data.missed_calls}`);
    console.log(`  Rejected: ${response.data.rejected_calls}`);
    console.log(`  Failed: ${response.data.failed_calls}`);
    console.log(`  Consecutive Missed: ${response.data.consecutive_missed}`);
    console.log(`  Consecutive Connected: ${response.data.consecutive_connected}`);
    console.log(`  Pickup Rate: ${response.data.pickup_rate}%`);
    console.log(`  Quality Status: ${response.data.quality_status}`);
    console.log(`  Warning Sent: ${response.data.warning_sent}`);
    console.log(`  Needs Warning: ${response.data.needs_warning}`);
    console.log(`  Needs Revocation: ${response.data.needs_revocation}`);
    
    if (response.data.last_call_at) {
      console.log(`  Last Call: ${new Date(response.data.last_call_at).toLocaleString()}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAllQuality(token) {
  console.log('\n📋 Testing: Get All Quality Metrics');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/call/quality`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ All quality metrics retrieved');
    console.log(`\nTotal Contacts: ${response.data.qualities.length}`);
    
    console.log('\nSummary:');
    console.log(`  Total Calls: ${response.data.summary.total_calls}`);
    console.log(`  Total Connected: ${response.data.summary.total_connected}`);
    console.log(`  Total Missed: ${response.data.summary.total_missed}`);
    console.log(`  Overall Pickup Rate: ${response.data.summary.overall_pickup_rate}%`);
    console.log(`  Poor Quality Count: ${response.data.summary.poor_quality_count}`);
    console.log(`  Needs Attention: ${response.data.summary.needs_attention_count}`);
    
    if (response.data.qualities.length > 0) {
      console.log('\nAll Contacts:');
      response.data.qualities.forEach(q => {
        console.log(`  ${q.phone_number}: ${q.pickup_rate}% (${q.connected_calls}/${q.total_calls}) - ${q.quality_status}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testResetWarning(token, phoneNumber) {
  console.log(`\n🔄 Testing: Reset Warning for ${phoneNumber}`);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(
      `${API_URL}/api/call/quality/${phoneNumber}/reset-warning`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Warning reset successfully');
    console.log('\nResult:');
    console.log(`  Phone: ${response.data.quality.phone_number}`);
    console.log(`  Consecutive Missed: ${response.data.quality.consecutive_missed}`);
    console.log(`  Warning Sent: ${response.data.quality.warning_sent}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Call Quality API Tests');
  console.log('='.repeat(50));
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    const token = await login();
    console.log('✅ Login successful');
    
    // Run tests
    const results = {
      dashboard: await testGetQualityDashboard(token),
      byPhone: await testGetQualityByPhone(token, TEST_PHONE),
      allQuality: await testGetAllQuality(token),
      // resetWarning: await testResetWarning(token, TEST_PHONE), // Uncomment to test
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
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runTests();
