const axios = require('axios');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = '4139448203035014'; // User's actual WABA ID from screenshot
const USER_EMAIL = 'whatsapp_1767086593038@business.com';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

async function fixEmbeddedSignupUser() {
  try {
    console.log('🔧 修复 Embedded Signup 用户配置\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Step 1: Query WhatsApp API for phone numbers
    console.log('📱 步骤 1: 查询 WABA 的电话号码...');
    console.log(`   WABA ID: ${WABA_ID}`);
    
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${WABA_ID}/phone_numbers`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    const phoneNumbers = response.data.data || [];
    console.log(`\n✅ 找到 ${phoneNumbers.length} 个电话号码:\n`);
    
    phoneNumbers.forEach((phone, index) => {
      console.log(`${index + 1}. ${phone.display_phone_number}`);
      console.log(`   ID: ${phone.id}`);
      console.log(`   Verified Name: ${phone.verified_name}`);
      console.log(`   Status: ${phone.code_verification_status}`);
      console.log(`   Quality: ${phone.quality_rating}`);
      console.log('');
    });
    
    if (phoneNumbers.length === 0) {
      console.log('❌ 没有找到电话号码');
      process.exit(1);
    }
    
    // Use the first phone number (should be the Malaysia number)
    const phoneNumber = phoneNumbers[0];
    const phoneNumberId = phoneNumber.id;
    const displayNumber = phoneNumber.display_phone_number;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 步骤 2: 更新数据库...');
    console.log(`   用户: ${USER_EMAIL}`);
    console.log(`   WABA ID: ${WABA_ID}`);
    console.log(`   Phone Number ID: ${phoneNumberId}`);
    console.log(`   Display Number: ${displayNumber}\n`);
    
    // Step 2: Connect to database
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // Step 3: Update user record
    const [result] = await sequelize.query(`
      UPDATE users 
      SET 
        whatsapp_account_id = :wabaId,
        phone_number_id = :phoneNumberId
      WHERE email = :email
      RETURNING id, name, email, whatsapp_account_id, phone_number_id;
    `, {
      replacements: {
        wabaId: WABA_ID,
        phoneNumberId: phoneNumberId,
        email: USER_EMAIL
      }
    });
    
    if (result.length === 0) {
      console.log('❌ 用户不存在');
      process.exit(1);
    }
    
    console.log('✅ 数据库更新成功!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Step 4: Verify update
    console.log('🔍 步骤 3: 验证更新...\n');
    
    const [users] = await sequelize.query(`
      SELECT 
        id,
        name,
        email,
        whatsapp_account_id as waba_id,
        phone_number_id,
        CASE 
          WHEN access_token IS NOT NULL THEN 'Yes (' || LENGTH(access_token) || ' chars)'
          ELSE 'No'
        END as has_token
      FROM users
      WHERE email = :email;
    `, {
      replacements: { email: USER_EMAIL }
    });
    
    if (users.length > 0) {
      const user = users[0];
      console.log('📊 用户配置:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   WABA ID: ${user.waba_id}`);
      console.log(`   Phone Number ID: ${user.phone_number_id}`);
      console.log(`   Display Number: ${displayNumber}`);
      console.log(`   Access Token: ${user.has_token}`);
      console.log('');
      
      if (user.phone_number_id === phoneNumberId && user.waba_id === WABA_ID) {
        console.log('✅ 验证成功! 配置已正确更新\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🎉 完成! 现在可以:');
        console.log('   1. 重启 PM2: pm2 restart whatsapp');
        console.log('   2. 用这个账号登录测试发送消息');
        console.log(`   3. 消息将从 ${displayNumber} 发送\n`);
      } else {
        console.log('⚠️  验证失败，数据不匹配\n');
      }
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

fixEmbeddedSignupUser();
