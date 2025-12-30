const axios = require('axios');
require('dotenv').config();

/**
 * 获取 Embedded Signup 后的账户信息
 * 包括 WABA ID 和 Phone Number ID
 */
async function getEmbeddedSignupInfo() {
  try {
    console.log('🔍 Fetching WhatsApp Business Account information...');
    console.log('');

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('❌ WHATSAPP_ACCESS_TOKEN not found in .env file');
      process.exit(1);
    }

    // Step 1: Get all WhatsApp Business Accounts
    console.log('📋 Step 1: Getting WhatsApp Business Accounts...');
    const wabaResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/businesses',
      {
        params: { access_token: accessToken }
      }
    );

    if (!wabaResponse.data.data || wabaResponse.data.data.length === 0) {
      console.log('⚠️  No businesses found. Trying alternative method...');
      
      // Alternative: Get debug token info
      const debugResponse = await axios.get(
        'https://graph.facebook.com/v18.0/debug_token',
        {
          params: {
            input_token: accessToken,
            access_token: accessToken
          }
        }
      );
      
      console.log('Debug Token Info:', JSON.stringify(debugResponse.data, null, 2));
    }

    console.log('');
    console.log('📱 Found Businesses:');
    wabaResponse.data.data.forEach((business, index) => {
      console.log(`\n${index + 1}. Business ID: ${business.id}`);
      console.log(`   Name: ${business.name}`);
    });

    // Step 2: Get WhatsApp Business Accounts for each business
    console.log('');
    console.log('📋 Step 2: Getting WhatsApp Business Accounts...');
    
    for (const business of wabaResponse.data.data) {
      try {
        const wabaListResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${business.id}/client_whatsapp_business_accounts`,
          {
            params: { access_token: accessToken }
          }
        );

        if (wabaListResponse.data.data && wabaListResponse.data.data.length > 0) {
          console.log('');
          console.log(`✅ WhatsApp Business Accounts for ${business.name}:`);
          
          for (const waba of wabaListResponse.data.data) {
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📱 WABA ID: ${waba.id}`);
            console.log(`   Name: ${waba.name || 'N/A'}`);
            
            // Step 3: Get phone numbers for this WABA
            try {
              const phoneResponse = await axios.get(
                `https://graph.facebook.com/v18.0/${waba.id}/phone_numbers`,
                {
                  params: { access_token: accessToken }
                }
              );

              if (phoneResponse.data.data && phoneResponse.data.data.length > 0) {
                console.log('');
                console.log('   📞 Phone Numbers:');
                phoneResponse.data.data.forEach((phone, idx) => {
                  console.log('');
                  console.log(`   ${idx + 1}. Phone Number ID: ${phone.id}`);
                  console.log(`      Display: ${phone.display_phone_number}`);
                  console.log(`      Verified Name: ${phone.verified_name}`);
                  console.log(`      Quality Rating: ${phone.quality_rating || 'UNKNOWN'}`);
                  console.log(`      Status: ${phone.code_verification_status || 'N/A'}`);
                });

                // Show .env configuration
                const firstPhone = phoneResponse.data.data[0];
                console.log('');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📝 Update your .env file with:');
                console.log('');
                console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID=${waba.id}`);
                console.log(`WHATSAPP_PHONE_NUMBER_ID=${firstPhone.id}`);
                console.log('');
                console.log('Then restart your server:');
                console.log('  npm run dev  (local)');
                console.log('  pm2 restart 5  (production)');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              } else {
                console.log('   ⚠️  No phone numbers found for this WABA');
              }
            } catch (phoneError) {
              console.log('   ❌ Error getting phone numbers:', phoneError.response?.data || phoneError.message);
            }
          }
        }
      } catch (wabaError) {
        console.log(`⚠️  Could not get WABAs for business ${business.id}`);
      }
    }

    console.log('');
    console.log('✅ Information retrieval complete!');

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

getEmbeddedSignupInfo();
