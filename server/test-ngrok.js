// 测试 ngrok webhook
const axios = require('axios');

const NGROK_URL = 'https://bbc8fbb-calculatedly-kale.ngrok-free.dev';

async function testNgrokWebhook() {
  console.log('🔍 Testing ngrok webhook...\n');
  console.log('ngrok URL:', NGROK_URL);
  console.log('');
  
  // Test 1: Root path (should fail)
  console.log('1️⃣ Testing root path (/)...');
  try {
    await axios.get(`${NGROK_URL}/`);
    console.log('✅ Root path accessible');
  } catch (error) {
    console.log('❌ Root path error (expected):', error.response?.status || error.message);
  }
  
  // Test 2: Health check
  console.log('\n2️⃣ Testing health check (/health)...');
  try {
    const healthResponse = await axios.get(`${NGROK_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.status || error.message);
  }
  
  // Test 3: Webhook verification
  console.log('\n3️⃣ Testing webhook verification...');
  try {
    const webhookResponse = await axios.get(`${NGROK_URL}/webhooks/whatsapp`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'my_webhook_verify_token_123',
        'hub.challenge': 'test_challenge_12345'
      }
    });
    
    console.log('✅ Webhook verification passed!');
    console.log('   Response:', webhookResponse.data);
    console.log('   Status:', webhookResponse.status);
    console.log('\n🎉 Your webhook is ready!');
    console.log('\n📋 Use this in Meta Developer Console:');
    console.log('   Callback URL:', `${NGROK_URL}/webhooks/whatsapp`);
    console.log('   Verify Token: my_webhook_verify_token_123');
  } catch (error) {
    console.log('❌ Webhook verification failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.message);
    
    if (error.response?.status === 403) {
      console.log('\n⚠️  Token mismatch! Check your .env file.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Cannot connect to server. Is it running?');
    }
  }
  
  // Test 4: Wrong token (should fail)
  console.log('\n4️⃣ Testing with wrong token (should fail)...');
  try {
    await axios.get(`${NGROK_URL}/webhooks/whatsapp`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token',
        'hub.challenge': 'test_challenge_12345'
      }
    });
    console.log('❌ Should have failed but passed!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly rejected wrong token');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

testNgrokWebhook();
