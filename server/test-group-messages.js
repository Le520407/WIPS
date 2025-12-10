require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Replace with an actual group ID
const GROUP_ID = process.argv[2] || 'YOUR_GROUP_ID_HERE';

async function testGroupMessages() {
  console.log('🧪 Testing Group Messages\n');
  console.log('='.repeat(50));

  if (GROUP_ID === 'YOUR_GROUP_ID_HERE') {
    console.error('❌ Please provide a group ID as argument:');
    console.error('   node test-group-messages.js <GROUP_ID>');
    process.exit(1);
  }

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'demo@example.com',
      password: 'demo123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Send text message to group
    console.log('\n📝 Step 2: Sending text message to group...');
    const textMessage = {
      phoneNumberId: PHONE_NUMBER_ID,
      type: 'text',
      text: {
        body: 'Hello from Groups API test! 👋',
        preview_url: false,
      },
    };

    const textResponse = await axios.post(
      `${API_URL}/api/groups/${GROUP_ID}/messages`,
      textMessage,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Text message sent successfully!');
    console.log('Message ID:', textResponse.data.messages?.[0]?.id);

    // Step 3: Send message with link preview
    console.log('\n📝 Step 3: Sending message with link preview...');
    const linkMessage = {
      phoneNumberId: PHONE_NUMBER_ID,
      type: 'text',
      text: {
        body: 'Check out this link: https://www.whatsapp.com',
        preview_url: true,
      },
    };

    const linkResponse = await axios.post(
      `${API_URL}/api/groups/${GROUP_ID}/messages`,
      linkMessage,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Link message sent successfully!');
    console.log('Message ID:', linkResponse.data.messages?.[0]?.id);

    // Step 4: Send image message (if you have a media ID)
    console.log('\n📝 Step 4: Sending image message...');
    console.log('ℹ️  Skipping - requires media ID');
    console.log('   To send image: provide image.id or image.link in the request');

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!');
    console.log('\n📌 Note: Check the group on WhatsApp to see the messages.');
  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testGroupMessages();
