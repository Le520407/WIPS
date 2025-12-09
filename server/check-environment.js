/**
 * Check if current WhatsApp account is Sandbox or Production
 */
require('dotenv').config();
const axios = require('axios');

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function checkEnvironment() {
  try {
    console.log('🔍 Checking WhatsApp Environment...\n');

    // Get phone number details
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        params: {
          fields: 'verified_name,display_phone_number,quality_rating,account_mode',
        },
      }
    );

    const data = response.data;

    console.log('📱 Phone Number Info:');
    console.log('   Display Number:', data.display_phone_number);
    console.log('   Verified Name:', data.verified_name);
    console.log('   Quality Rating:', data.quality_rating || 'N/A');
    console.log('   Account Mode:', data.account_mode || 'N/A');
    console.log('');

    // Check if it's a test number (sandbox indicators)
    const isSandbox = 
      data.verified_name?.toLowerCase().includes('test') ||
      data.verified_name?.toLowerCase().includes('sandbox') ||
      data.display_phone_number?.includes('15550') || // Common test number pattern
      data.account_mode === 'SANDBOX';

    if (isSandbox) {
      console.log('🧪 ENVIRONMENT: SANDBOX (Test)');
      console.log('');
      console.log('Sandbox Limits:');
      console.log('  • Consecutive missed call warning: 5 calls');
      console.log('  • Consecutive missed call revocation: 10 calls');
      console.log('  • Connected calls per day: 100 calls');
      console.log('  • Permission requests: 25/day, 100/week');
      console.log('  • Cost: FREE (no charges)');
    } else {
      console.log('🏭 ENVIRONMENT: PRODUCTION (Real)');
      console.log('');
      console.log('Production Limits:');
      console.log('  • Consecutive missed call warning: 2 calls');
      console.log('  • Consecutive missed call revocation: 4 calls');
      console.log('  • Connected calls per 24h: 10 calls');
      console.log('  • Permission requests: 1/day, 2/week');
      console.log('  • Cost: CHARGED (business-initiated calls)');
      console.log('');
      console.log('⚠️  WARNING: You are using a PRODUCTION account!');
      console.log('   - Business-initiated calls will be CHARGED');
      console.log('   - Stricter quality monitoring applies');
      console.log('   - Real users will receive calls');
    }

    console.log('');
    console.log('Current Implementation Settings:');
    console.log('  • Warning threshold: 2 consecutive missed (Production)');
    console.log('  • Revocation threshold: 4 consecutive missed (Production)');
    console.log('');
    console.log('✅ Your code is configured for PRODUCTION limits');

  } catch (error) {
    console.error('❌ Error checking environment:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

checkEnvironment();
