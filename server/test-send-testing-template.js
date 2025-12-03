require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function sendTestingTemplate() {
  try {
    console.log('\n📤 Sending "testing" template with parameter...\n');
    
    // Template "testing" has body: "Hello {{1}}, welcome to our service!"
    // So we need to provide 1 parameter
    
    const requestBody = {
      messaging_product: 'whatsapp',
      to: '60105520735',
      type: 'template',
      template: {
        name: 'testing',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: 'John'  // This will replace {{1}}
              }
            ]
          }
        ]
      }
    };
    
    console.log('Request body:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('\n---\n');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Template sent successfully!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📱 Expected message on WhatsApp:');
    console.log('"Hello John, welcome to our service!"');
    
  } catch (error) {
    console.error('\n❌ Failed to send template');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

sendTestingTemplate();
