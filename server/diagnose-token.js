require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔍 Token Diagnosis\n');
console.log('Token length:', ACCESS_TOKEN ? ACCESS_TOKEN.length : 0, 'characters');
console.log('Token starts with:', ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 10) : 'N/A');
console.log('Token ends with:', ACCESS_TOKEN ? ACCESS_TOKEN.substring(ACCESS_TOKEN.length - 10) : 'N/A');
console.log('\n---\n');

async function diagnose() {
  // Test 1: Debug Token
  console.log('Test 1: Getting token info...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/debug_token`,
      {
        params: {
          input_token: ACCESS_TOKEN,
          access_token: ACCESS_TOKEN
        }
      }
    );
    console.log('✅ Token info:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Cannot get token info:', error.response?.data || error.message);
  }

  console.log('\n---\n');

  // Test 2: Get token permissions
  console.log('Test 2: Checking token permissions...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/me/permissions`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Token permissions:');
    response.data.data.forEach(perm => {
      console.log(`   - ${perm.permission}: ${perm.status}`);
    });
  } catch (error) {
    console.error('❌ Cannot get permissions:', error.response?.data || error.message);
  }

  console.log('\n---\n');

  // Test 3: Try different API endpoints
  console.log('Test 3: Testing different endpoints...');
  
  const endpoints = [
    { name: 'Phone Number', url: `/${API_VERSION}/${PHONE_NUMBER_ID}` },
    { name: 'Business Account', url: `/${API_VERSION}/${BUSINESS_ACCOUNT_ID}` },
    { name: 'Templates', url: `/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates` }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(
        `${WHATSAPP_API_URL}${endpoint.url}`,
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          }
        }
      );
      console.log(`✅ ${endpoint.name}: Accessible`);
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

diagnose();
