const axios = require('axios');
require('dotenv').config();

/**
 * 将短期 Token 延长为 60 天的长期 Token
 * 这是临时解决方案，推荐使用 System User Token（永不过期）
 */
async function extendAccessToken() {
  try {
    console.log('🔄 Extending access token...');
    console.log('');

    const currentToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!currentToken || !appId || !appSecret) {
      console.error('❌ Missing required environment variables:');
      console.error('   - WHATSAPP_ACCESS_TOKEN');
      console.error('   - META_APP_ID');
      console.error('   - META_APP_SECRET');
      process.exit(1);
    }

    // Exchange short-lived token for long-lived token (60 days)
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: currentToken
      }
    });

    const newToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    console.log('✅ Token extended successfully!');
    console.log('');
    console.log('📝 New Access Token:');
    console.log(newToken);
    console.log('');
    console.log('⏰ Expires in:', expiresIn ? `${expiresIn / 86400} days` : 'Never (System User Token)');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Update your .env file with the new token:');
    console.log('   WHATSAPP_ACCESS_TOKEN=' + newToken);
    console.log('');
    console.log('2. Restart your server:');
    console.log('   pm2 restart 5');
    console.log('');
    console.log('⚠️  Note: This token will expire in 60 days.');
    console.log('   For a permanent solution, create a System User Token in Meta Business Manager.');
    console.log('   See: docs/12-23/PERMANENT_ACCESS_TOKEN_GUIDE.md');

  } catch (error) {
    console.error('❌ Error extending token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.error) {
        console.error('');
        console.error('Error Message:', error.response.data.error.message);
        
        if (error.response.data.error.code === 190) {
          console.error('');
          console.error('💡 Your current token is invalid or expired.');
          console.error('   You need to generate a new token from Meta Business Manager.');
          console.error('   See: docs/12-23/PERMANENT_ACCESS_TOKEN_GUIDE.md');
        }
      }
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

extendAccessToken();
