require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔍 Checking WhatsApp Account Status...\n');
console.log('Configuration:');
console.log('- Business Account ID:', BUSINESS_ACCOUNT_ID);
console.log('- Phone Number ID:', PHONE_NUMBER_ID);
console.log('- Access Token (first 20 chars):', ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 20) + '...' : 'NOT SET');
console.log('\n---\n');

async function checkAccountStatus() {
  // Test 1: Check token validity
  console.log('Test 1: Checking Access Token...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/me`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Token is valid');
    console.log('Token info:', response.data);
  } catch (error) {
    console.error('❌ Token is invalid or expired');
    console.error('Error:', error.response?.data || error.message);
    console.log('\n💡 Your access token is invalid. You need to generate a new one.');
    return;
  }

  console.log('\n---\n');

  // Test 2: Check Business Account access
  console.log('Test 2: Checking Business Account access...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}`,
      {
        params: {
          fields: 'id,name,timezone_id,message_template_namespace'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Business Account is accessible');
    console.log('Account info:', response.data);
  } catch (error) {
    console.error('❌ Cannot access Business Account');
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n💡 Permission denied. Possible reasons:');
      console.log('   1. Your access token does not have permission to this Business Account');
      console.log('   2. The Business Account has been disabled or restricted');
      console.log('   3. You need to request access from the account owner');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Business Account not found. Check your WHATSAPP_BUSINESS_ACCOUNT_ID');
    }
    return;
  }

  console.log('\n---\n');

  // Test 3: Check Phone Number access
  console.log('Test 3: Checking Phone Number access...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        params: {
          fields: 'id,display_phone_number,verified_name,quality_rating'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Phone Number is accessible');
    console.log('Phone info:', response.data);
  } catch (error) {
    console.error('❌ Cannot access Phone Number');
    console.error('Error:', error.response?.data || error.message);
  }

  console.log('\n---\n');

  // Test 4: Try to get templates
  console.log('Test 4: Checking Templates access...');
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    console.log('✅ Templates are accessible');
    console.log('Number of templates:', response.data.data?.length || 0);
  } catch (error) {
    console.error('❌ Cannot access Templates');
    console.error('Error:', error.response?.data || error.message);
  }

  console.log('\n---\n');
  console.log('✅ Account status check complete!');
}

checkAccountStatus().catch(console.error);
