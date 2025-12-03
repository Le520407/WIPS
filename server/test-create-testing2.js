require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function createTemplate() {
  try {
    console.log('\n📝 Creating template: testing_2\n');
    
    const templateBody = {
      name: 'testing_2',
      language: 'en',
      category: 'MARKETING',
      components: [
        {
          type: 'BODY',
          text: 'Your order {{1}} has been confirmed. Total: ${{2}}',
          example: {
            body_text: [['Example 1', 'Example 2']]
          }
        }
      ]
    };
    
    console.log('Request body:');
    console.log(JSON.stringify(templateBody, null, 2));
    console.log('\n---\n');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      templateBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Template created successfully!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Failed to create template');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('\nError details:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      // Parse the error message
      if (error.response.data.error) {
        const err = error.response.data.error;
        console.log('\n📋 Error breakdown:');
        console.log('Message:', err.message);
        console.log('Type:', err.type);
        console.log('Code:', err.code);
        if (err.error_data) {
          console.log('Details:', JSON.stringify(err.error_data, null, 2));
        }
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

createTemplate();
