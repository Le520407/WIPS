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

async function fixAllUsersToken() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const permanentToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!permanentToken) {
      console.log('❌ WHATSAPP_ACCESS_TOKEN not found in .env');
      process.exit(1);
    }
    
    console.log('🔧 修复所有用户的 Access Token\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 1. 查看当前所有用户
    const [users] = await sequelize.query(`
      SELECT 
        id,
        name,
        email,
        whatsapp_account_id as waba_id,
        phone_number_id,
        LENGTH(access_token) as token_length
      FROM users
      ORDER BY id;
    `);
    
    console.log('📊 当前用户列表:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   WABA ID: ${user.waba_id || '❌ 未设置'}`);
      console.log(`   Phone ID: ${user.phone_number_id || '❌ 未设置'}`);
      console.log(`   Token 长度: ${user.token_length || 0} chars`);
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 2. 更新所有用户的 token 和配置
    const [result] = await sequelize.query(`
      UPDATE users 
      SET 
        access_token = :token,
        whatsapp_account_id = :wabaId,
        phone_number_id = :phoneId
      WHERE 1=1
      RETURNING id, name, email;
    `, { 
      replacements: { 
        token: permanentToken,
        wabaId: wabaId,
        phoneId: phoneId
      } 
    });
    
    console.log('✅ 更新完成！\n');
    console.log(`📝 已更新 ${result.length} 个用户:\n`);
    
    result.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 3. 验证更新后的数据
    const [updatedUsers] = await sequelize.query(`
      SELECT 
        id,
        name,
        email,
        whatsapp_account_id as waba_id,
        phone_number_id,
        LENGTH(access_token) as token_length
      FROM users
      ORDER BY id;
    `);
    
    console.log('✅ 验证更新后的数据:\n');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   WABA ID: ${user.waba_id}`);
      console.log(`   Phone ID: ${user.phone_number_id}`);
      console.log(`   Token 长度: ${user.token_length} chars`);
      
      if (user.token_length > 400) {
        console.log('   ✅ Token 长度正常 (永久 token)');
      } else {
        console.log('   ⚠️  Token 长度异常 (可能是临时 token)');
      }
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 提示:\n');
    console.log('1. 所有用户现在都使用 .env 里的永久 token');
    console.log('2. 所有用户都使用相同的 WABA 和 Phone Number');
    console.log('3. 现在可以用任何账号登录并发送消息');
    console.log('4. 不需要再手动修改 .env 文件');
    console.log('\n🔄 请重启服务器: pm2 restart whatsapp\n');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAllUsersToken();
