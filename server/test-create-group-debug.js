/**
 * Debug Template Group Creation
 * 
 * This script helps debug template group creation issues
 */

require('dotenv').config({ path: './.env' });
const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

async function testCreateGroup() {
  console.log('\n🧪 Testing Template Group Creation\n');
  
  if (!ACCESS_TOKEN) {
    console.error('❌ Error: WHATSAPP_ACCESS_TOKEN not found');
    return;
  }
  
  if (!WABA_ID) {
    console.error('❌ Error: WHATSAPP_BUSINESS_ACCOUNT_ID not found');
    return;
  }
  
  // Test data - using the APPROVED template ID from the list
  const testData = {
    name: 'Test Group ' + Date.now(),
    description: 'Test description',
    templateIds: ['717235527614100']  // Your template ID as string
  };
  
  console.log('📋 Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  
  // Convert to API format
  const templates = testData.templateIds.map(id => ({ id: id.toString() }));
  
  const requestBody = {
    name: testData.name,
    description: testData.description,
    whatsapp_business_templates: templates
  };
  
  console.log('\n📤 Request Body:');
  console.log(JSON.stringify(requestBody, null, 2));
  
  const url = `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/template_groups`;
  console.log('\n🔗 URL:', url);
  
  try {
    console.log('\n⏳ Sending request...\n');
    
    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success!');
    console.log('\n📥 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.response) {
      console.error('\n📊 Response Status:', error.response.status);
      console.error('📊 Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('\n📊 Response Data:');
      console.error(JSON.stringify(error.response.data, null, 2));
      
      // Check for specific error messages
      if (error.response.data?.error) {
        const err = error.response.data.error;
        console.error('\n🔍 Error Details:');
        console.error('  Type:', err.type);
        console.error('  Code:', err.code);
        console.error('  Message:', err.message);
        console.error('  Trace ID:', err.fbtrace_id);
        
        // Provide suggestions
        console.log('\n💡 Suggestions:');
        if (err.message.includes('unknown error')) {
          console.log('  - Check if the template ID is valid');
          console.log('  - Verify the template belongs to your WABA');
          console.log('  - Ensure the template is approved');
          console.log('  - Check if template groups feature is enabled for your account');
        }
      }
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Run test
testCreateGroup();
