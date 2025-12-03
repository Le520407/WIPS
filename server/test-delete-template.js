require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function deleteTemplate(templateName) {
  try {
    console.log(`\n🗑️ Deleting template: ${templateName}\n`);
    
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        params: {
          name: templateName
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Template deleted successfully!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Failed to delete template');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.log('\n💡 Template not found on WhatsApp (already deleted or never existed)');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Get template name from command line or use default
const templateName = process.argv[2];

if (!templateName) {
  console.log('Usage: node test-delete-template.js <template_name>');
  console.log('Example: node test-delete-template.js testing_2');
  process.exit(1);
}

deleteTemplate(templateName);
