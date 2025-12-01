const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:3002';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+60105520735';
const JWT_SECRET = process.env.JWT_SECRET || 'astsi_jwt_secret_key_2024_production_ready';

async function testTypingIndicator() {
  try {
    console.log('🧪 Testing Typing Indicator...\n');

    // Generate token
    const userId = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Generated auth token\n');

    console.log('⚠️ IMPORTANT: Typing indicators require a message_id from a received message.');
    console.log('📝 Steps to test:');
    console.log('1. Send a message from your phone to the WhatsApp Business number');
    console.log('2. Check the webhook logs or database for the message_id');
    console.log('3. Use that message_id in the test below\n');

    // You need to replace this with an actual message_id from a RECEIVED message (not sent)
    // To get a message_id: Send a message from your phone, then check webhook logs or database
    const MESSAGE_ID = 'wamid.HBgLNjAxMDU1MjA3MzUVAgARGBIzMDM0QzIyN0M2MDZBQkM3MTIA';
    
    console.log('📝 Test: Sending typing indicator...');
    console.log(`Using message_id: ${MESSAGE_ID}\n`);
    
    const response = await axios.post(
      `${API_URL}/api/messages/send-typing`,
      {
        to: TEST_PHONE,
        messageId: MESSAGE_ID
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Typing indicator sent:', response.data);
    console.log('');

    console.log('✅ Test completed!');
    console.log('\n💡 The typing indicator will show for 25 seconds or until you send a message.');
    console.log('📱 Check your WhatsApp to see the typing indicator!');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testTypingIndicator();
