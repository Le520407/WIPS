require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// 测试参数 - 请根据实际情况修改
const TEST_TO = '60105520735'; // 收件人号码
const TEST_TEMPLATE_NAME = 'testing'; // Template 名称
const TEST_LANGUAGE_CODE = 'en'; // 语言代码

console.log('📤 Testing Template Send...\n');
console.log('To:', TEST_TO);
console.log('Template:', TEST_TEMPLATE_NAME);
console.log('Language:', TEST_LANGUAGE_CODE);
console.log('\n---\n');

async function testSendTemplate() {
  try {
    const messageBody = {
      messaging_product: 'whatsapp',
      to: TEST_TO,
      type: 'template',
      template: {
        name: TEST_TEMPLATE_NAME,
        language: { code: TEST_LANGUAGE_CODE },
        components: []
      }
    };

    console.log('Request body:', JSON.stringify(messageBody, null, 2));
    console.log('\n---\n');

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Template sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to send template');
    console.error('Status:', error.response?.status);
    console.error('Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.error) {
      const err = error.response.data.error;
      console.log('\n💡 Possible solutions:');
      
      if (err.code === 132000) {
        console.log('   - Template name might be incorrect');
        console.log('   - Check the exact template name in Meta Business Manager');
      } else if (err.code === 100) {
        console.log('   - Template might require parameters');
        console.log('   - Check if template has variables like {{1}}, {{2}}');
      } else if (err.code === 131026) {
        console.log('   - Recipient number might be invalid');
        console.log('   - Make sure number is in international format without +');
      }
    }
  }
}

testSendTemplate();
