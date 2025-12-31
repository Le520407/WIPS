const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function addTokenToUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const email = 'whatsapp_1767086593038@business.com';
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken) {
      console.error('❌ WHATSAPP_ACCESS_TOKEN not found in .env file');
      process.exit(1);
    }

    console.log('📝 将要更新的信息：');
    console.log(`   Email: ${email}`);
    console.log(`   WABA ID: ${wabaId}`);
    console.log(`   Phone Number ID: ${phoneNumberId}`);
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log('');

    // Update user
    const [result] = await sequelize.query(`
      UPDATE users 
      SET 
        access_token = :accessToken,
        whatsapp_account_id = :wabaId,
        phone_number_id = :phoneNumberId,
        status = 'active',
        "updatedAt" = NOW()
      WHERE email = :email
      RETURNING id, name, email, whatsapp_account_id, phone_number_id;
    `, {
      replacements: {
        email,
        accessToken,
        wabaId,
        phoneNumberId
      }
    });

    if (result.length === 0) {
      console.error('❌ 用户不存在:', email);
      process.exit(1);
    }

    console.log('✅ 用户更新成功！\n');
    console.log('📊 更新后的用户信息：');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Name: ${result[0].name}`);
    console.log(`   Email: ${result[0].email}`);
    console.log(`   WABA ID: ${result[0].whatsapp_account_id}`);
    console.log(`   Phone Number ID: ${result[0].phone_number_id}`);
    console.log('');
    console.log('✅ 现在这个用户可以正常使用 WhatsApp 功能了！');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTokenToUser();
