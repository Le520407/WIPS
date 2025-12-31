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

async function mergeDuplicateUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Find all users
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
        END as has_token,
        "createdAt"
      FROM users
      ORDER BY "createdAt" ASC;
    `);

    console.log('📊 所有用户：\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   WABA ID: ${user.waba_id}`);
      console.log(`   Phone Number ID: ${user.phone_number_id || '❌ 未设置'}`);
      console.log(`   Access Token: ${user.has_token}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // Find test@whatsapp-platform.com
    const testUser = users.find(u => u.email === 'test@whatsapp-platform.com');
    // Find whatsapp_1767145417305@business.com (duplicate)
    const duplicateUser = users.find(u => u.email === 'whatsapp_1767145417305@business.com');

    if (!testUser) {
      console.log('❌ 找不到 test@whatsapp-platform.com');
      await sequelize.close();
      return;
    }

    if (!duplicateUser) {
      console.log('✅ 没有重复用户需要删除');
      await sequelize.close();
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔄 合并计划：');
    console.log(`   保留: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`   删除: ${duplicateUser.email} (ID: ${duplicateUser.id})`);
    console.log('');

    // Update test user with the duplicate's phone_number_id and access_token
    console.log('📝 更新 test@whatsapp-platform.com 的配置...');
    await sequelize.query(`
      UPDATE users
      SET 
        phone_number_id = '${duplicateUser.phone_number_id}',
        access_token = (SELECT access_token FROM users WHERE id = '${duplicateUser.id}'),
        updated_at = NOW()
      WHERE id = '${testUser.id}';
    `);
    console.log('✅ 配置已更新');

    // Delete the duplicate user
    console.log('🗑️  删除重复用户...');
    await sequelize.query(`
      DELETE FROM users WHERE id = '${duplicateUser.id}';
    `);
    console.log('✅ 重复用户已删除');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 合并完成！\n');

    // Show final result
    const [finalUsers] = await sequelize.query(`
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
      ORDER BY "createdAt" ASC;
    `);

    console.log('📊 最终结果：\n');
    finalUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   WABA ID: ${user.waba_id}`);
      console.log(`   Phone Number ID: ${user.phone_number_id || '❌ 未设置'}`);
      console.log(`   Access Token: ${user.has_token}`);
      console.log('');
    });

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

mergeDuplicateUsers();
