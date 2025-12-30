const axios = require('axios');
require('dotenv').config();

/**
 * 验证 Access Token 是否有效
 * 并显示 Token 的详细信息
 */
async function verifyAccessToken() {
  try {
    console.log('🔍 Verifying access token...');
    console.log('');

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken) {
      console.error('❌ WHATSAPP_ACCESS_TOKEN not found in .env file');
      process.exit(1);
    }

    console.log('📋 Token Info:');
    console.log('Token (first 50 chars):', accessToken.substring(0, 50) + '...');
    console.log('Token length:', accessToken.length);
    console.log('');

    // Method 1: Debug Token (get expiration info)
    console.log('🔍 Checking token validity...');
    try {
      const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
        params: {
          input_token: accessToken,
          access_token: accessToken
        }
      });

      const tokenData = debugResponse.data.data;
      console.log('✅ Token is valid!');
      console.log('');
      console.log('📊 Token Details:');
      console.log('   App ID:', tokenData.app_id);
      console.log('   Type:', tokenData.type);
      console.log('   User ID:', tokenData.user_id || 'N/A');
      console.log('   Is Valid:', tokenData.is_valid);
      console.log('   Issued At:', tokenData.issued_at ? new Date(tokenData.issued_at * 1000).toLocaleString() : 'N/A');
      console.log('   Expires At:', tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toLocaleString() : 'Never (Permanent)');
      
      if (tokenData.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const daysLeft = Math.floor((tokenData.expires_at - now) / 86400);
        console.log('   Days Left:', daysLeft);
        
        if (daysLeft < 7) {
          console.log('');
          console.log('⚠️  WARNING: Token will expire in less than 7 days!');
          console.log('   Please generate a new System User Token.');
        }
      } else {
        console.log('   ✅ This is a permanent token (System User Token)');
      }

      console.log('');
      console.log('📱 Scopes (Permissions):');
      if (tokenData.scopes && tokenData.scopes.length > 0) {
        tokenData.scopes.forEach(scope => {
          console.log('   ✓', scope);
        });
      } else {
        console.log('   (No scope information available)');
      }

    } catch (debugError) {
      console.log('⚠️  Could not get detailed token info (this is normal for some tokens)');
    }

    // Method 2: Test with WhatsApp API
    if (phoneNumberId) {
      console.log('');
      console.log('🔍 Testing with WhatsApp API...');
      try {
        const waResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${phoneNumberId}`,
          {
            params: { access_token: accessToken }
          }
        );

        console.log('✅ WhatsApp API access confirmed!');
        console.log('');
        console.log('📱 Phone Number Info:');
        console.log('   ID:', waResponse.data.id);
        console.log('   Display Name:', waResponse.data.display_phone_number || 'N/A');
        console.log('   Verified Name:', waResponse.data.verified_name || 'N/A');
        console.log('   Quality Rating:', waResponse.data.quality_rating || 'N/A');

      } catch (waError) {
        console.error('❌ WhatsApp API test failed!');
        if (waError.response) {
          console.error('Status:', waError.response.status);
          console.error('Error:', JSON.stringify(waError.response.data, null, 2));
          
          if (waError.response.status === 401 || waError.response.status === 400) {
            console.error('');
            console.error('💡 Token is invalid or lacks required permissions.');
            console.error('   Please generate a new System User Token with these permissions:');
            console.error('   - whatsapp_business_management');
            console.error('   - whatsapp_business_messaging');
          }
        }
      }
    }

    console.log('');
    console.log('✅ Verification complete!');
    console.log('');
    console.log('📚 For more information, see:');
    console.log('   docs/12-23/PERMANENT_ACCESS_TOKEN_GUIDE.md');

  } catch (error) {
    console.error('❌ Error verifying token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

verifyAccessToken();
