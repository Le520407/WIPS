require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🧪 Testing Business Account Access\n');
console.log('Business Account ID:', BUSINESS_ACCOUNT_ID);
console.log('Token (first 20 chars):', ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 20) + '...' : 'NOT SET');
console.log('\n---\n');

async function testBusinessAccount() {
  // Test 1: Can we access the business account?
  console.log('Test 1: Accessing Business Account...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}`,
      {
        params: {
          fields: 'id,name,timezone_id'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Business Account accessible:');
    console.log('   ID:', response.data.id);
    console.log('   Name:', response.data.name);
    console.log('   Timezone:', response.data.timezone_id);
  } catch (error) {
    console.error('❌ Cannot access Business Account');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data?.error?.message || error.message);
    console.log('\n💡 This means your token does not have access to this Business Account ID.');
    console.log('   Either the ID is wrong, or the token does not have permission.');
    return;
  }

  console.log('\n---\n');

  // Test 2: Can we list phone numbers?
  console.log('Test 2: Listing phone numbers...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/phone_numbers`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Phone numbers accessible:');
    response.data.data.forEach(phone => {
      console.log(`   - ${phone.display_phone_number} (ID: ${phone.id})`);
    });
  } catch (error) {
    console.error('❌ Cannot list phone numbers');
    console.error('   Error:', error.response?.data?.error?.message || error.message);
  }

  console.log('\n---\n');

  // Test 3: Can we access templates?
  console.log('Test 3: Accessing Templates...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Templates accessible!');
    console.log('   Number of templates:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n   Templates:');
      response.data.data.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.status})`);
      });
    }
  } catch (error) {
    console.error('❌ Cannot access Templates');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n💡 Permission denied. Your token needs "whatsapp_business_management" permission.');
    } else if (error.response?.status === 401) {
      console.log('\n💡 Token is invalid or expired. Generate a new token.');
    }
  }
}

testBusinessAccount();
