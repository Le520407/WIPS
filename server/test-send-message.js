const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function testSendMessage() {
  console.log('📱 Testing Message Send\n');
  
  // Test different phone number formats
  const testNumbers = [
    '+60105520735',    // With + and no spaces
    '60105520735',     // Without + and no spaces
    '+6010-552-0735',  // With + and dashes
    '+60 10-552 0735', // With + and spaces (as shown in Meta)
  ];
  
  for (const phoneNumber of testNumbers) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Testing: ${phoneNumber}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            body: 'Test message from WhatsApp Platform'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ SUCCESS!`);
      console.log(`   Message ID: ${response.data.messages[0].id}`);
      console.log(`   Format that works: ${phoneNumber}`);
      break; // Stop after first success
      
    } catch (error) {
      console.log(`❌ FAILED`);
      if (error.response?.data?.error) {
        const err = error.response.data.error;
        console.log(`   Error Code: ${err.code}`);
        console.log(`   Error Message: ${err.message}`);
        
        if (err.code === 133010) {
          console.log(`   ⚠️  This number is NOT registered as test recipient`);
        }
      }
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📋 NEXT STEPS:`);
  console.log(`\nIf ALL formats failed with #133010:`);
  console.log(`1. The number might not be verified yet`);
  console.log(`2. Check Meta Dashboard: https://developers.facebook.com/apps/1964783984342192/whatsapp-business/wa-dev-console/`);
  console.log(`3. Look for "Test Recipients" section`);
  console.log(`4. Make sure +60105520735 shows "Verified" status`);
  console.log(`5. If not verified, click "Resend Code" and verify with OTP`);
  console.log(`\nIf one format succeeded:`);
  console.log(`✅ Use that exact format in your platform!`);
}

testSendMessage();
