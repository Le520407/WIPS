// 测试 Webhook 验证
const axios = require('axios');

async function testWebhookVerify() {
  console.log('🔍 Testing Webhook Verification...\n');
  
  // 1. 测试本地服务器
  console.log('1️⃣ Testing localhost:3002...');
  try {
    const localResponse = await axios.get('http://localhost:3002/webhooks/whatsapp', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'my_webhook_verify_token_123',
        'hub.challenge': 'test_challenge_12345'
      }
    });
    
    console.log('✅ Local server response:', localResponse.data);
    console.log('   Status:', localResponse.status);
  } catch (error) {
    console.error('❌ Local server error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
  
  console.log('\n2️⃣ Testing with wrong token...');
  try {
    const wrongTokenResponse = await axios.get('http://localhost:3002/webhooks/whatsapp', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token',
        'hub.challenge': 'test_challenge_12345'
      }
    });
    
    console.log('❌ Should have failed but got:', wrongTokenResponse.status);
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('✅ Correctly rejected wrong token (403)');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
  
  console.log('\n3️⃣ Checking .env configuration...');
  require('dotenv').config();
  console.log('META_VERIFY_TOKEN:', process.env.META_VERIFY_TOKEN);
  
  if (process.env.META_VERIFY_TOKEN !== 'my_webhook_verify_token_123') {
    console.log('⚠️  WARNING: META_VERIFY_TOKEN in .env does not match!');
    console.log('   Expected: my_webhook_verify_token_123');
    console.log('   Got:', process.env.META_VERIFY_TOKEN);
  } else {
    console.log('✅ META_VERIFY_TOKEN is correct');
  }
  
  console.log('\n4️⃣ Next steps:');
  console.log('If local test passed, test with your ngrok URL:');
  console.log('Replace YOUR_NGROK_URL below and run in browser:');
  console.log('https://YOUR_NGROK_URL/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=my_webhook_verify_token_123&hub.challenge=test');
}

testWebhookVerify();
