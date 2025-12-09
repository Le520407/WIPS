/**
 * Test Call Limits Tracking
 * 
 * This script tests the call limits tracking system
 */
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const TEST_PHONE = '+60105520735';

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

// Test 1: Get dashboard
async function testGetDashboard(token) {
  console.log('\n📊 Test 1: Get Call Limits Dashboard');
  console.log('='.repeat(50));

  try {
    const response = await axios.get(`${API_URL}/call/limits/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Dashboard retrieved successfully');
    console.log('\nSummary:');
    console.log(`  Total Contacts: ${response.data.summary.total_contacts}`);
    console.log(`  Active Contacts: ${response.data.summary.active_contacts}`);
    console.log(`  Limited Contacts: ${response.data.summary.limited_contacts}`);
    console.log(`  Warning Contacts: ${response.data.summary.warning_contacts}`);
    console.log(`  Total Calls (24h): ${response.data.summary.total_calls_24h}`);
    console.log(`  Average Usage: ${response.data.summary.average_usage_percentage}%`);
    console.log(`\nEnvironment: ${response.data.environment}`);
    console.log(`Default Limit: ${response.data.default_limit} calls/24h`);

    if (response.data.needs_attention.length > 0) {
      console.log(`\n⚠️  Contacts Needing Attention: ${response.data.needs_attention.length}`);
      response.data.needs_attention.slice(0, 3).forEach((contact) => {
        console.log(`  • ${contact.phone_number}: ${contact.usage_percentage}% (${contact.calls_24h}/${contact.limit_24h})`);
      });
    }

    if (response.data.most_active.length > 0) {
      console.log(`\n🔥 Most Active Contacts: ${response.data.most_active.length}`);
      response.data.most_active.slice(0, 3).forEach((contact, index) => {
        console.log(`  ${index + 1}. ${contact.phone_number}: ${contact.calls_24h} calls (${contact.usage_percentage}%)`);
      });
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Check if can make call
async function testCheckCallLimit(token, phoneNumber) {
  console.log(`\n🔍 Test 2: Check Call Limit for ${phoneNumber}`);
  console.log('='.repeat(50));

  try {
    const response = await axios.post(
      `${API_URL}/call/limits/check`,
      { phone_number: phoneNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Check completed');
    console.log(`\nCan Make Call: ${response.data.can_make_call ? '✅ Yes' : '❌ No'}`);
    console.log(`Calls (24h): ${response.data.calls_24h} / ${response.data.limit_24h}`);
    console.log(`Remaining: ${response.data.remaining}`);
    console.log(`Usage: ${response.data.usage_percentage}%`);
    
    if (response.data.time_until_reset_ms) {
      const hours = Math.floor(response.data.time_until_reset_ms / (1000 * 60 * 60));
      const minutes = Math.floor((response.data.time_until_reset_ms % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`Reset In: ${hours}h ${minutes}m`);
    }
    
    console.log(`\nMessage: ${response.data.message}`);

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Record a call
async function testRecordCall(token, phoneNumber) {
  console.log(`\n📝 Test 3: Record Call for ${phoneNumber}`);
  console.log('='.repeat(50));

  try {
    const response = await axios.post(
      `${API_URL}/call/limits/record`,
      { phone_number: phoneNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Call recorded successfully');
    console.log(`\nCalls (24h): ${response.data.calls_24h}`);
    console.log(`Remaining: ${response.data.remaining}`);
    console.log(`Usage: ${response.data.usage_percentage}%`);
    console.log(`Needs Warning: ${response.data.needs_warning ? '⚠️  Yes' : 'No'}`);

    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ Call limit reached!');
      console.error(`   ${error.response.data.message}`);
      if (error.response.data.time_until_reset_ms) {
        const hours = Math.floor(error.response.data.time_until_reset_ms / (1000 * 60 * 60));
        const minutes = Math.floor((error.response.data.time_until_reset_ms % (1000 * 60 * 60)) / (1000 * 60));
        console.error(`   Reset in: ${hours}h ${minutes}m`);
      }
    } else {
      console.error('❌ Failed:', error.response?.data || error.message);
    }
    throw error;
  }
}

// Test 4: Get specific call limit
async function testGetCallLimit(token, phoneNumber) {
  console.log(`\n📋 Test 4: Get Call Limit Details for ${phoneNumber}`);
  console.log('='.repeat(50));

  try {
    const response = await axios.get(`${API_URL}/call/limits/${phoneNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Details retrieved');
    console.log(`\nPhone: ${response.data.phone_number}`);
    console.log(`Calls (24h): ${response.data.calls_24h} / ${response.data.limit_24h}`);
    console.log(`Remaining: ${response.data.remaining}`);
    console.log(`Usage: ${response.data.usage_percentage}%`);
    console.log(`Can Make Call: ${response.data.can_make_call ? '✅ Yes' : '❌ No'}`);
    console.log(`Is Limited: ${response.data.is_limited ? '❌ Yes' : 'No'}`);
    console.log(`Needs Warning: ${response.data.needs_warning ? '⚠️  Yes' : 'No'}`);
    
    if (response.data.last_call_at) {
      console.log(`Last Call: ${new Date(response.data.last_call_at).toLocaleString()}`);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Simulate multiple calls
async function testMultipleCalls(token, phoneNumber, count) {
  console.log(`\n🔄 Test 5: Simulate ${count} Calls for ${phoneNumber}`);
  console.log('='.repeat(50));

  for (let i = 1; i <= count; i++) {
    console.log(`\nCall #${i}:`);
    try {
      const response = await axios.post(
        `${API_URL}/call/limits/record`,
        { phone_number: phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`  ✅ Recorded: ${response.data.calls_24h}/${response.data.limit_24h} (${response.data.usage_percentage}%)`);
      
      if (response.data.needs_warning) {
        console.log(`  ⚠️  WARNING: Approaching limit!`);
      }

      // Small delay between calls
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`  ❌ LIMIT REACHED: ${error.response.data.message}`);
        break;
      } else {
        throw error;
      }
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Call Limits Tests...\n');

  try {
    // Login
    console.log('🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in successfully\n');

    // Test 1: Get dashboard
    await testGetDashboard(token);

    // Test 2: Check call limit
    await testCheckCallLimit(token, TEST_PHONE);

    // Test 3: Record a call
    await testRecordCall(token, TEST_PHONE);

    // Test 4: Get specific limit
    await testGetCallLimit(token, TEST_PHONE);

    // Test 5: Simulate multiple calls (test limit enforcement)
    const limit = process.env.WHATSAPP_ENV === 'sandbox' ? 5 : 3; // Test with fewer calls
    await testMultipleCalls(token, '+60123456789', limit);

    // Final dashboard check
    console.log('\n📊 Final Dashboard Check:');
    console.log('='.repeat(50));
    await testGetDashboard(token);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
