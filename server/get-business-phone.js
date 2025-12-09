/**
 * Get Business Phone Number
 */

require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function getPhoneNumber() {
  try {
    console.log('📞 Getting Business Phone Number...');
    console.log('Phone Number ID:', PHONE_NUMBER_ID);
    console.log();

    const response = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        params: {
          fields: 'display_phone_number,verified_name,quality_rating,id',
        },
      }
    );

    console.log('✅ Phone Number Info:');
    console.log('   ID:', response.data.id);
    console.log('   Display Phone:', response.data.display_phone_number);
    console.log('   Verified Name:', response.data.verified_name);
    console.log('   Quality Rating:', response.data.quality_rating);
    console.log();
    
    return response.data.display_phone_number;
  } catch (error) {
    console.error('❌ Failed to get phone number');
    console.error('   Error:', error.response?.data?.error || error.message);
    return null;
  }
}

getPhoneNumber();
