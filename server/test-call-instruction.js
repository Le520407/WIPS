/**
 * Send Call Instruction Message
 */

require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TEST_PHONE = '60105520735';

async function sendCallInstruction() {
  try {
    console.log('📞 Sending Call Instruction Message...');
    console.log('To:', TEST_PHONE);
    console.log();

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: TEST_PHONE,
        type: 'text',
        text: {
          body: `你好！👋

需要通话吗？很简单：

📞 方法 1（推荐）：
1. 点击聊天界面顶部的 "Test Number"
2. 在个人资料页面，你会看到 "语音通话" 按钮
3. 点击即可发起通话

📞 方法 2：
1. 点击聊天界面右上角的 📞 图标
2. 选择 "语音通话"

我们的通话功能已启用，随时可以联系我们！

⏰ 工作时间：周一至周五 9:00-18:00 (马来西亚时间)`,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Instruction message sent successfully!');
    console.log('   Message ID:', response.data.messages[0].id);
    console.log();
    console.log('📱 现在在你的手机上：');
    console.log('   1. 打开这个聊天');
    console.log('   2. 点击顶部的 "Test Number"');
    console.log('   3. 在个人资料页面点击 "语音通话"');
    console.log('   4. 或者直接点击右上角的通话图标');
    console.log();
    return true;
  } catch (error) {
    console.error('❌ Failed to send message');
    console.error('   Error:', error.response?.data?.error || error.message);
    return false;
  }
}

sendCallInstruction();
