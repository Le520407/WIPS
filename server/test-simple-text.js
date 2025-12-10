/**
 * Simple Text Message Test
 * Test if the phone number can receive messages at all
 */

require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const TEST_RECIPIENT = process.env.TEST_RECIPIENT_PHONE || '+60105520735';

console.log('📱 Simple Text Message Test');
console.log('===========================\n');

async function sendTextMessage() {
  try {
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TEST_RECIPIENT,
      type: 'text',
      text: {
        body: `Test message at ${new Date().toLocaleTimeString()}`
      }
    };
    
    console.log('📨 Sending text message to:', TEST_RECIPIENT);
    console.log('');
    
    const response = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Message sent successfully!');
    console.log(`   Message ID: ${response.data.messages[0].id}`);
    console.log(`   WhatsApp ID: ${response.data.contacts[0].wa_id}`);
    console.log('');
    console.log('📱 Please check your phone now!');
    console.log('   If you receive this text message, the problem is specific to voice messages.');
    console.log('   If you don\'t receive it, there\'s a general delivery issue.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

sendTextMessage();
