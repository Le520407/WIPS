require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+60123456789';

async function testReadReceipts() {
  try {
    console.log('🧪 Testing Read Receipts...\n');

    // 1. Login first
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'demo',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Send a test message first
    console.log('2️⃣ Sending a test message...');
    const sendResponse = await axios.post(
      `${API_URL}/messages/send`,
      {
        to: TEST_PHONE,
        message: 'This is a test message for read receipts',
        type: 'text'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const messageId = sendResponse.data.messageId;
    console.log('✅ Message sent successfully!');
    console.log('Message ID:', messageId);
    console.log('\n⏳ Waiting 3 seconds before marking as read...\n');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Mark the message as read
    console.log('3️⃣ Marking message as read...');
    const readResponse = await axios.post(
      `${API_URL}/messages/mark-as-read`,
      {
        messageId: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Message marked as read successfully!');
    console.log('Response:', JSON.stringify(readResponse.data, null, 2));
    console.log('\n📱 Check your WhatsApp to see the read receipt (blue checkmarks)!');
    console.log('\n💡 Note: Read receipts only work for messages sent TO you, not FROM you.');
    console.log('   To test properly, send a message FROM your test phone TO your WhatsApp Business number.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testReadReceipts();
