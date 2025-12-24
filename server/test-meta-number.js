const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function testMetaNumber() {
  console.log('📱 Testing with Meta Test Number\n');
  
  const metaTestNumber = '+15551607691';
  
  console.log(`Sending to: ${metaTestNumber}`);
  console.log(`This is Meta's official test number - should always work!\n`);
  
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: metaTestNumber,
        type: 'text',
        text: {
          body: '🎉 Success! Your WhatsApp Platform is working!'
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
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Message ID: ${response.data.messages[0].id}`);
    console.log(`Status: Sent successfully`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n🎯 Your platform is working correctly!`);
    console.log(`\n📋 To send to your own phone (+60105520735):`);
    console.log(`1. Go to: https://developers.facebook.com/apps/1964783984342192/whatsapp-business/wa-dev-console/`);
    console.log(`2. Scroll down to find "Test Recipients" section`);
    console.log(`3. Click "Add phone number"`);
    console.log(`4. Enter: +60105520735`);
    console.log(`5. Verify with OTP from WhatsApp`);
    console.log(`6. Then you can send to your phone!`);
    
  } catch (error) {
    console.log(`❌ FAILED`);
    if (error.response?.data?.error) {
      const err = error.response.data.error;
      console.log(`Error Code: ${err.code}`);
      console.log(`Error Message: ${err.message}`);
      console.log(`\n⚠️  Even Meta test number failed!`);
      console.log(`This might be a token or configuration issue.`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

testMetaNumber();
