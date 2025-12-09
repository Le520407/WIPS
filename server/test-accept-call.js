/**
 * Test Accept Call API
 */

require('dotenv').config();
const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Replace with actual call_id from webhook
const TEST_CALL_ID = 'wacid.HBgPMTE0MTQzMDg0NDI5NDU2FRIAEhggQUM5MDE3NEE2RUJCOUNBQ jExREQxNUY5MUEyQ0ExREYcGAsxNTU1MTYwNzY5MRUCABUcAA==';

async function testAcceptCall() {
  try {
    console.log('📞 Testing Accept Call API...');
    console.log('Phone Number ID:', PHONE_NUMBER_ID);
    console.log('Call ID:', TEST_CALL_ID);
    console.log();

    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      {
        messaging_product: 'whatsapp',
        call_id: TEST_CALL_ID,
        action: 'accept',
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Accept call successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Accept call failed');
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

console.log('🚀 WhatsApp Accept Call Test\n');
console.log('⚠️  Note: Replace TEST_CALL_ID with actual call_id from webhook\n');

testAcceptCall();
