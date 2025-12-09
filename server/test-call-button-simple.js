/**
 * Simple Call Button Test - Direct API Call
 */

require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TEST_PHONE = '60105520735'; // Your phone number
const BUSINESS_PHONE = '15551607691'; // Real business phone number

async function sendCallButtonMessage() {
  try {
    console.log('📞 Sending Call Button Message...');
    console.log('='.repeat(50));
    console.log('To:', TEST_PHONE);
    console.log('Phone Number ID:', PHONE_NUMBER_ID);
    console.log();

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: TEST_PHONE,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: {
            text: '你好！需要帮助吗？点击下方按钮直接通过 WhatsApp 给我们打电话！',
          },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: '📞 立即通话',
              url: `https://wa.me/${BUSINESS_PHONE}`,
            },
          },
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Call button message sent successfully!');
    console.log('   Message ID:', response.data.messages[0].id);
    console.log('   Status:', response.data.messages[0].message_status);
    console.log();
    console.log('📱 请在你的手机 WhatsApp 中查看消息');
    console.log('   1. 打开 WhatsApp');
    console.log('   2. 查看来自企业账号的消息');
    console.log('   3. 点击 "📞 立即通话" 按钮');
    console.log('   4. 发起通话');
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to send call button message');
    console.error('   Error:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function sendSimpleCallLink() {
  try {
    console.log('📞 Sending Simple Call Link Message...');
    console.log('='.repeat(50));
    console.log('To:', TEST_PHONE);
    console.log();

    const callLink = `https://wa.me/${BUSINESS_PHONE}`;
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: TEST_PHONE,
        type: 'text',
        text: {
          body: `你好！需要通话吗？点击这个链接：${callLink}\n\n或者直接在 WhatsApp 中点击我的头像，选择"语音通话"。`,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Call link message sent successfully!');
    console.log('   Message ID:', response.data.messages[0].id);
    console.log('   Call Link:', callLink);
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to send call link message');
    console.error('   Error:', error.response?.data?.error || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Call Button Tests...\n');

  // Test 1: Send call button message
  const test1 = await sendCallButtonMessage();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Send simple call link
  const test2 = await sendSimpleCallLink();

  // Summary
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Call Button Message: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Call Link Message: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1 || test2) {
    console.log('\n🎉 至少一个测试成功！请查看你的手机 WhatsApp。');
  } else {
    console.log('\n❌ 所有测试失败。请检查配置。');
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Tests failed:', error);
  process.exit(1);
});
