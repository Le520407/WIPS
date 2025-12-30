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

async function checkUserWhatsAppConfig() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

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
      ORDER BY id DESC
      LIMIT 10;
    `);

    console.log('📊 用户 WhatsApp 配置：\n');
    
    if (users.length === 0) {
      console.log('❌ 没有找到用户');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   WABA ID: ${user.waba_id || '❌ 未设置'}`);
        console.log(`   Phone Number ID: ${user.phone_number_id || '❌ 未设置'}`);
        console.log(`   Access Token: ${user.has_token}`);
        console.log('');
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Check if any user has config
      const usersWithConfig = users.filter(u => u.phone_number_id);
      const usersWithoutConfig = users.filter(u => !u.phone_number_id);
      
      console.log(`✅ 已配置用户: ${usersWithConfig.length}`);
      console.log(`⚠️  未配置用户: ${usersWithoutConfig.length}`);
      
      if (usersWithoutConfig.length > 0) {
        console.log('\n💡 未配置的用户需要：');
        console.log('   1. 重新做一次 Embedded Signup');
        console.log('   2. 或者手动设置 phone_number_id 和 access_token');
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserWhatsAppConfig();
