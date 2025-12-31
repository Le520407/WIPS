require('dotenv').config();
const axios = require('axios');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

async function testEmbeddedUserSend() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. 获取 Embedded Signup 用户信息
    const [users] = await sequelize.query(`
      SELECT 
        id,
        email,
        name,
        phone_number_id,
        access_token,
        whatsapp_account_id
      FROM users
      WHERE email = 'whatsapp_1767086593038@business.com';
    `);

    if (users.length === 0) {
      console.log('❌ User not found\n');
      return;
    }

    const user = users[0];
    console.log('📋 User Info:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone Number ID: ${user.phone_number_id}`);
    console.log(`   Token Length: ${user.access_token?.length} chars`);
    console.log(`   WABA ID: ${user.whatsapp_account_id}\n`);

    // 2. 测试发送消息到测试号码
    const testPhoneNumber = '15551234567'; // Meta 测试号码
    
    console.log('🧪 Testing message send...\n');
    console.log(`Sending to: ${testPhoneNumber}`);
    console.log(`Using Phone Number ID: ${user.phone_number_id}`);
    console.log(`Using Token: ${user.access_token.substring(0, 20)}...\n`);

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${user.phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: testPhoneNumber,
          type: 'text',
          text: {
            body: 'Test message from Embedded Signup user'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Message sent successfully!');
      console.log(`   Message ID: ${response.data.messages[0].id}\n`);
      
    } catch (error) {
      console.log('❌ Failed to send message!\n');
      
      if (error.response) {
        console.log('Error Details:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error Code: ${error.response.data.error?.code}`);
        console.log(`   Error Type: ${error.response.data.error?.type}`);
        console.log(`   Error Message: ${error.response.data.error?.message}`);
        console.log(`   Error Subcode: ${error.response.data.error?.error_subcode}\n`);
        
        // 分析错误
        console.log('💡 Error Analysis:\n');
        
        const errorCode = error.response.data.error?.code;
        const errorMessage = error.response.data.error?.message || '';
        
        if (errorCode === 190) {
          console.log('❌ Token 问题:');
          console.log('   - Token 可能已过期');
          console.log('   - Token 权限不足');
          console.log('   - Token 格式错误\n');
        } else if (errorCode === 100) {
          console.log('❌ 参数问题:');
          console.log('   - Phone Number ID 可能不正确');
          console.log('   - 收件人号码格式错误');
          console.log('   - 消息格式不正确\n');
        } else if (errorCode === 131047) {
          console.log('❌ 消息限制:');
          console.log('   - 24小时窗口已过期');
          console.log('   - 需要使用模板消息');
          console.log('   - 或者用户需要先发消息给你\n');
        } else if (errorMessage.includes('phone number')) {
          console.log('❌ 电话号码问题:');
          console.log('   - Phone Number ID 可能不属于这个 WABA');
          console.log('   - Phone Number 可能未注册');
          console.log('   - Phone Number 可能被禁用\n');
        }
        
        console.log('🔧 建议修复方案:\n');
        console.log('1. 验证 Phone Number ID 是否正确');
        console.log('2. 检查 Phone Number 是否已注册并激活');
        console.log('3. 确认 Token 有正确的权限');
        console.log('4. 尝试使用模板消息而不是文本消息\n');
        
      } else {
        console.log(`   Error: ${error.message}\n`);
      }
    }

    // 3. 验证 Phone Number 状态
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Checking Phone Number Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const phoneResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${user.phone_number_id}`,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        }
      );
      
      console.log('✅ Phone Number Info:');
      console.log(`   Display Phone: ${phoneResponse.data.display_phone_number}`);
      console.log(`   Verified Name: ${phoneResponse.data.verified_name}`);
      console.log(`   Quality Rating: ${phoneResponse.data.quality_rating || 'UNKNOWN'}`);
      console.log(`   Code Verification Status: ${phoneResponse.data.code_verification_status || 'N/A'}\n`);
      
    } catch (error) {
      console.log('❌ Failed to get phone number info');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testEmbeddedUserSend();
