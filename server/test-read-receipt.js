/**
 * Test Read Receipt (Mark Message as Read)
 * 
 * This script tests marking a WhatsApp message as read
 */

require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function markMessageAsRead(messageId) {
  try {
    console.log('\n📨 Marking message as read...');
    console.log('Message ID:', messageId);
    
    const messageBody = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    console.log('\n📤 Request:');
    console.log(JSON.stringify(messageBody, null, 2));

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

    console.log('\n✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Error marking message as read:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🧪 Testing Read Receipt Feature\n');
  console.log('Configuration:');
  console.log('- API URL:', WHATSAPP_API_URL);
  console.log('- API Version:', API_VERSION);
  console.log('- Phone Number ID:', PHONE_NUMBER_ID);
  console.log('- Access Token:', ACCESS_TOKEN ? '✓ Set' : '✗ Not set');

  // Get message ID from command line or use a test ID
  const messageId = process.argv[2];
  
  if (!messageId) {
    console.error('\n❌ Error: Message ID is required');
    console.log('\nUsage:');
    console.log('  node test-read-receipt.js <message_id>');
    console.log('\nExample:');
    console.log('  node test-read-receipt.js wamid.HBgLMTY1MDM4NzkwMzkzOTQJZCMzlEQUE4OTJBMTE4RTUA');
    console.log('\nHow to get a message ID:');
    console.log('  1. Send a message to your WhatsApp Business number');
    console.log('  2. Check your webhook logs or database for the message_id');
    console.log('  3. The message_id starts with "wamid."');
    process.exit(1);
  }

  if (!messageId.startsWith('wamid.')) {
    console.warn('\n⚠️  Warning: Message ID should start with "wamid."');
    console.warn('   Current ID:', messageId);
  }

  try {
    await markMessageAsRead(messageId);
    console.log('\n✅ Test completed successfully!');
    console.log('\nWhat happens next:');
    console.log('  1. The sender will see double blue checkmarks (✓✓) in WhatsApp');
    console.log('  2. This indicates you have read their message');
    console.log('  3. Check your WhatsApp to verify');
  } catch (error) {
    console.log('\n❌ Test failed!');
    console.log('\nPossible reasons:');
    console.log('  1. Message ID is invalid or expired (messages older than 30 days)');
    console.log('  2. Message was already marked as read');
    console.log('  3. Access token is invalid or expired');
    console.log('  4. Phone number ID is incorrect');
    process.exit(1);
  }
}

main();
