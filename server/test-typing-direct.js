const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+60105520735';

async function testTypingDirect() {
  try {
    console.log('🧪 Testing Typing Indicator (Direct WhatsApp API)...\n');
    console.log('Phone Number ID:', PHONE_NUMBER_ID);
    console.log('To:', TEST_PHONE);
    console.log('');

    console.log('⚠️ IMPORTANT: You need a message_id from a received message.');
    console.log('📝 Send a message from your phone first, then use that message_id here.\n');

    // Replace this with an actual message_id from a RECEIVED message (not sent)
    // To get a message_id: Send a message from your phone, then check webhook logs
    const MESSAGE_ID = 'wamid.HBgLNjAxMDU1MjA3MzUVAgARGBIzMDM0QzIyN0M2MDZBQkM3MTIA';

    const messageBody = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: MESSAGE_ID,
      typing_indicator: {
        type: 'text'
      }
    };

    console.log('Request body:', JSON.stringify(messageBody, null, 2));
    console.log('');

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n💡 The typing indicator will show for 25 seconds or until you send a message.');

  } catch (error) {
    console.error('❌ Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTypingDirect();
