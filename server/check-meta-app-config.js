require('dotenv').config();
const axios = require('axios');

async function checkMetaAppConfig() {
  console.log('🔍 Checking Meta App Configuration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Check environment variables
  console.log('📋 Environment Variables:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`META_APP_ID: ${process.env.META_APP_ID || '❌ NOT SET'}`);
  console.log(`META_APP_SECRET: ${process.env.META_APP_SECRET ? '✅ SET (hidden)' : '❌ NOT SET'}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || '❌ NOT SET'}`);
  console.log(`WHATSAPP_ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET (' + process.env.WHATSAPP_ACCESS_TOKEN.length + ' chars)' : '❌ NOT SET'}`);
  console.log(`WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ NOT SET'}`);
  console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ NOT SET'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 2. Check if all required variables are set
  const requiredVars = [
    'META_APP_ID',
    'META_APP_SECRET',
    'CLIENT_URL',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n⚠️  Please set these in your .env file\n');
    return;
  }

  // 3. Test access token
  console.log('🧪 Testing Access Token...\n');
  
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Access Token is VALID!');
    console.log(`   Phone: ${response.data.display_phone_number}`);
    console.log(`   Name: ${response.data.verified_name}`);
    console.log(`   Quality: ${response.data.quality_rating || 'UNKNOWN'}\n`);
  } catch (error) {
    console.log('❌ Access Token test FAILED!');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
    } else {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // 4. Check App info
  console.log('📱 Checking App Info...\n');
  
  try {
    const appResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.META_APP_ID}`,
      {
        params: {
          fields: 'id,name,category,link',
          access_token: process.env.WHATSAPP_ACCESS_TOKEN
        }
      }
    );
    
    console.log('✅ App Info Retrieved:');
    console.log(`   App ID: ${appResponse.data.id}`);
    console.log(`   App Name: ${appResponse.data.name}`);
    console.log(`   Category: ${appResponse.data.category || 'N/A'}\n`);
  } catch (error) {
    console.log('❌ Failed to get App info');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
    } else {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // 5. Check WABA info
  console.log('🏢 Checking WhatsApp Business Account...\n');
  
  try {
    const wabaResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}`,
      {
        params: {
          fields: 'id,name,timezone_id,message_template_namespace',
          access_token: process.env.WHATSAPP_ACCESS_TOKEN
        }
      }
    );
    
    console.log('✅ WABA Info Retrieved:');
    console.log(`   WABA ID: ${wabaResponse.data.id}`);
    console.log(`   Name: ${wabaResponse.data.name || 'N/A'}`);
    console.log(`   Timezone: ${wabaResponse.data.timezone_id || 'N/A'}\n`);
  } catch (error) {
    console.log('❌ Failed to get WABA info');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
    } else {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // 6. Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Configuration Status:');
  console.log(`   • Environment Variables: ${missingVars.length === 0 ? '✅ Complete' : '❌ Missing ' + missingVars.length}`);
  console.log(`   • Access Token: Test above`);
  console.log(`   • App ID: ${process.env.META_APP_ID}`);
  console.log(`   • Client URL: ${process.env.CLIENT_URL}\n`);

  console.log('🔧 Embedded Signup Configuration:');
  console.log(`   • Redirect URI: ${process.env.CLIENT_URL}/auth/callback`);
  console.log(`   • This must be added to Meta App Settings > WhatsApp > Configuration\n`);

  console.log('📝 Common Embedded Signup Errors:\n');
  console.log('1. "Cannot call API for app X on behalf of user Y"');
  console.log('   → User needs to grant permissions to your app');
  console.log('   → Check App Review status in Meta Developer Console\n');
  
  console.log('2. "Invalid OAuth redirect_uri"');
  console.log('   → Add redirect URI to Meta App Settings\n');
  
  console.log('3. "Invalid verification code"');
  console.log('   → Code expired (valid for 10 minutes)');
  console.log('   → User needs to go through Embedded Signup again\n');

  console.log('🔗 Useful Links:');
  console.log(`   • Meta Developer Console: https://developers.facebook.com/apps/${process.env.META_APP_ID}`);
  console.log(`   • WhatsApp Manager: https://business.facebook.com/wa/manage/home/`);
  console.log(`   • App Dashboard: https://developers.facebook.com/apps/${process.env.META_APP_ID}/dashboard/\n`);
}

checkMetaAppConfig().catch(console.error);
