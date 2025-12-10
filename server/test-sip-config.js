const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = 'v21.0';

async function testSipConfiguration() {
  console.log('🧪 Testing SIP Configuration\n');
  console.log('Phone Number ID:', PHONE_NUMBER_ID);
  console.log('API Version:', API_VERSION);
  console.log('---\n');

  try {
    // 1. Get current SIP configuration
    console.log('1️⃣ Getting current SIP configuration...');
    const getResponse = await axios.get(
      `${API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`,
      {
        params: {
          include_sip_credentials: 'true',
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log('✅ Current configuration:');
    console.log(JSON.stringify(getResponse.data, null, 2));
    console.log('---\n');

    // 2. Configure SIP server (example)
    console.log('2️⃣ Configuring SIP server...');
    const sipConfig = {
      calling: {
        status: 'ENABLED',
        sip: {
          status: 'ENABLED',
          servers: [
            {
              hostname: 'sip.example.com',
              port: 5061,
              request_uri_user_params: {
                tgrp: 'wacall',
                'trunk-context': 'byoc.example.com',
              },
            },
          ],
        },
      },
    };

    console.log('Configuration to send:');
    console.log(JSON.stringify(sipConfig, null, 2));

    const updateResponse = await axios.post(
      `${API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`,
      sipConfig,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Update response:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    console.log('---\n');

    // 3. Get updated configuration with password
    console.log('3️⃣ Getting updated configuration with password...');
    const updatedResponse = await axios.get(
      `${API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`,
      {
        params: {
          include_sip_credentials: 'true',
        },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log('✅ Updated configuration:');
    console.log(JSON.stringify(updatedResponse.data, null, 2));
    
    if (updatedResponse.data.calling?.sip?.servers?.[0]?.sip_user_password) {
      console.log('\n🔑 SIP Credentials:');
      console.log('Domain:', 'wa.meta.vc');
      console.log('Username:', PHONE_NUMBER_ID.replace('+', ''));
      console.log('Password:', updatedResponse.data.calling.sip.servers[0].sip_user_password);
    }
    console.log('---\n');

    // 4. Configure SRTP protocol
    console.log('4️⃣ Configuring SRTP protocol...');
    const srtpConfig = {
      calling: {
        srtp_key_exchange_protocol: 'SDES',
      },
    };

    const srtpResponse = await axios.post(
      `${API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/settings`,
      srtpConfig,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SRTP configuration response:');
    console.log(JSON.stringify(srtpResponse.data, null, 2));
    console.log('---\n');

    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
testSipConfiguration();
