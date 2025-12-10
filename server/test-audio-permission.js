/**
 * Audio Permission Test
 * Test if the account has permission to send audio messages
 */

require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const TEST_RECIPIENT = process.env.TEST_RECIPIENT_PHONE || '+60105520735';

console.log('🔐 Audio Permission Test');
console.log('========================\n');

async function testTextMessage() {
  console.log('1️⃣ Testing Text Message (baseline)...\n');
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: TEST_RECIPIENT,
        type: 'text',
        text: { body: 'Test text message' }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Text message sent successfully');
    console.log(`   Message ID: ${response.data.messages[0].id}\n`);
    return true;
  } catch (error) {
    console.error('❌ Text message failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAudioWithLink() {
  console.log('2️⃣ Testing Audio Message with public link...\n');
  
  try {
    // Use a public audio file
    const response = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: TEST_RECIPIENT,
        type: 'audio',
        audio: {
          link: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          voice: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Audio message sent successfully');
    console.log(`   Message ID: ${response.data.messages[0].id}\n`);
    return true;
  } catch (error) {
    console.error('❌ Audio message failed');
    console.error('   Error:', JSON.stringify(error.response?.data, null, 2));
    console.error('');
    
    if (error.response?.data?.error) {
      const err = error.response.data.error;
      console.error('🔍 Error Analysis:');
      console.error(`   Code: ${err.code}`);
      console.error(`   Message: ${err.message}`);
      console.error('');
      
      if (err.code === 131051 || err.message?.includes('not supported')) {
        console.error('💡 This error suggests:');
        console.error('   - Your account does not have permission to send audio messages');
        console.error('   - Audio messaging may not be enabled for your account');
        console.error('   - You may need to upgrade your account or request this feature');
      }
    }
    
    return false;
  }
}

async function checkAccountInfo() {
  console.log('3️⃣ Checking Account Information...\n');
  
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        params: {
          fields: 'verified_name,code_verification_status,display_phone_number,quality_rating,messaging_limit_tier'
        }
      }
    );
    
    console.log('📊 Account Information:');
    console.log(`   Verified Name: ${response.data.verified_name || 'N/A'}`);
    console.log(`   Display Phone: ${response.data.display_phone_number || 'N/A'}`);
    console.log(`   Quality Rating: ${response.data.quality_rating || 'N/A'}`);
    console.log(`   Messaging Tier: ${response.data.messaging_limit_tier || 'N/A'}`);
    console.log(`   Verification Status: ${response.data.code_verification_status || 'N/A'}`);
    console.log('');
    
    if (response.data.messaging_limit_tier === 'TIER_NOT_SET' || 
        response.data.messaging_limit_tier === 'TIER_50') {
      console.warn('⚠️  WARNING: Low messaging tier detected');
      console.warn('   Audio messages may require a higher tier (TIER_250 or above)');
      console.warn('   Consider upgrading your account\n');
    }
    
  } catch (error) {
    console.error('❌ Failed to get account info:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🎯 This test will help determine if your account can send audio messages\n');
  console.log('═══════════════════════════════════════════════\n');
  
  // Test 1: Text message (should work)
  const textWorks = await testTextMessage();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Audio message (may fail)
  const audioWorks = await testAudioWithLink();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Account info
  await checkAccountInfo();
  
  console.log('═══════════════════════════════════════════════');
  console.log('📋 Test Summary:');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(`Text Messages:  ${textWorks ? '✅ Working' : '❌ Not Working'}`);
  console.log(`Audio Messages: ${audioWorks ? '✅ Working' : '❌ Not Working'}\n`);
  
  if (textWorks && !audioWorks) {
    console.log('🔍 Diagnosis:');
    console.log('   Your account CAN send text messages');
    console.log('   Your account CANNOT send audio messages\n');
    
    console.log('💡 Possible Reasons:');
    console.log('   1. Audio messaging is not enabled for your account');
    console.log('   2. Your account tier is too low (need TIER_250+)');
    console.log('   3. Your account needs additional verification');
    console.log('   4. Audio messaging requires special approval from Meta\n');
    
    console.log('🎯 Recommended Actions:');
    console.log('   1. Check Meta Business Manager settings');
    console.log('   2. Look for "Media Messaging" or "Audio Messaging" permissions');
    console.log('   3. Contact Meta/WhatsApp Business support');
    console.log('   4. Request audio messaging feature access');
    console.log('   5. Consider upgrading to a higher account tier\n');
    
    console.log('📞 Meta Business Support:');
    console.log('   https://business.facebook.com/business/help\n');
  } else if (!textWorks) {
    console.log('🔍 Diagnosis:');
    console.log('   Basic messaging is not working');
    console.log('   This is a more fundamental issue\n');
    
    console.log('💡 Check:');
    console.log('   1. Access token validity');
    console.log('   2. Phone number ID');
    console.log('   3. Account status\n');
  } else {
    console.log('✅ All tests passed!');
    console.log('   Your account can send both text and audio messages\n');
  }
}

main();
