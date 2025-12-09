require('dotenv').config();
const axios = require('axios');

// This script tests updating call settings via our API
// Make sure your server is running on port 3002

const API_URL = 'http://localhost:3002';

async function testUpdateCallSettings() {
  try {
    console.log('🔧 Testing Call Settings Update...\n');

    // First, login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/demo-login`, {
      phone: '+1234567890',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Update call settings with business hours
    console.log('2. Updating call settings with business hours...');
    const updateResponse = await axios.put(
      `${API_URL}/api/call-settings`,
      {
        calling_enabled: true,
        inbound_enabled: true,
        outbound_enabled: true,
        callback_enabled: true,
        business_hours: {
          enabled: true,
          timezone: 'America/New_York',
          schedule: {
            monday: {
              enabled: true,
              periods: [{ start: '09:00', end: '17:00' }],
            },
            tuesday: {
              enabled: true,
              periods: [{ start: '09:00', end: '17:00' }],
            },
            wednesday: {
              enabled: true,
              periods: [{ start: '09:00', end: '17:00' }],
            },
            thursday: {
              enabled: true,
              periods: [{ start: '09:00', end: '17:00' }],
            },
            friday: {
              enabled: true,
              periods: [{ start: '09:00', end: '17:00' }],
            },
            saturday: {
              enabled: false,
              periods: [],
            },
            sunday: {
              enabled: false,
              periods: [],
            },
          },
        },
        auto_reply_message:
          'Thank you for calling. We are currently unavailable. Our business hours are Monday-Friday, 9 AM - 5 PM EST.',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Update successful!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(updateResponse.data, null, 2));

    if (updateResponse.data.meta_sync) {
      console.log('\n🔄 Meta API Sync Status:');
      if (updateResponse.data.meta_sync.success) {
        console.log('✅', updateResponse.data.meta_sync.message);
        console.log('\n💡 Note: Changes may take up to 7 days to appear in WhatsApp clients.');
        console.log('To force immediate refresh:');
        console.log('  1. Open chat with your business number in WhatsApp');
        console.log('  2. Tap on the business name to open chat info');
        console.log('  3. Business hours should appear there');
      } else {
        console.log('❌ Sync failed:', updateResponse.data.meta_sync.error);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUpdateCallSettings();
