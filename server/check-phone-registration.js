const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

async function checkPhoneRegistration() {
  console.log('📱 Checking WhatsApp Business Account Registration Status\n');
  
  try {
    // Get phone number details
    console.log('1️⃣ Checking Phone Number Details...');
    const phoneResponse = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      }
    );
    
    console.log('✅ Phone Number Info:');
    console.log(`   Display Name: ${phoneResponse.data.display_phone_number}`);
    console.log(`   Verified Name: ${phoneResponse.data.verified_name}`);
    console.log(`   Quality Rating: ${phoneResponse.data.quality_rating}`);
    console.log(`   Status: ${phoneResponse.data.account_mode || 'LIVE'}\n`);
    
    // Get WABA details
    console.log('2️⃣ Checking WhatsApp Business Account...');
    const wabaResponse = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}`,
      {
        params: { fields: 'id,name,timezone_id,message_template_namespace' },
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      }
    );
    
    console.log('✅ WABA Info:');
    console.log(`   Name: ${wabaResponse.data.name}`);
    console.log(`   Timezone: ${wabaResponse.data.timezone_id}`);
    console.log(`   Namespace: ${wabaResponse.data.message_template_namespace}\n`);
    
    console.log('📋 IMPORTANT NOTES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  ERROR #133010: Account not registered');
    console.log('');
    console.log('This error means the recipient phone number is NOT registered');
    console.log('with your WhatsApp Business Account.');
    console.log('');
    console.log('🎯 SOLUTION:');
    console.log('');
    console.log('Option 1: Use the Test Number (Recommended for Testing)');
    console.log('   • Test Number: +1 555 160 7691');
    console.log('   • This is provided by Meta for testing');
    console.log('   • No registration needed');
    console.log('');
    console.log('Option 2: Add Test Recipients in Meta Dashboard');
    console.log('   1. Go to: https://developers.facebook.com/apps/1964783984342192/whatsapp-business/wa-dev-console/');
    console.log('   2. Click "Add phone number" under Test Recipients');
    console.log('   3. Enter phone number with country code (e.g., +60105520735)');
    console.log('   4. Verify the number via OTP');
    console.log('   5. Now you can send messages to this number');
    console.log('');
    console.log('Option 3: Complete App Review (For Production)');
    console.log('   • After app review approval, you can send to ANY number');
    console.log('   • Currently in Development Mode = Limited to test numbers only');
    console.log('');
    console.log('🔍 Current Limitations (Development Mode):');
    console.log('   • Can only send to test numbers');
    console.log('   • Can only send to numbers added as test recipients');
    console.log('   • Cannot send to random phone numbers');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkPhoneRegistration();
