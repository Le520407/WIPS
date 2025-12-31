const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
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

async function deleteUserAndSetupPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Step 1: Delete the problematic user
    const emailToDelete = 'whatsapp_1767086593038@business.com';
    
    const [deleteResult] = await sequelize.query(`
      DELETE FROM users 
      WHERE email = :email
      RETURNING id, name, email;
    `, {
      replacements: { email: emailToDelete }
    });

    if (deleteResult.length > 0) {
      console.log('✅ 已删除用户:', emailToDelete);
      console.log('');
    } else {
      console.log('⚠️  用户不存在:', emailToDelete);
      console.log('');
    }

    // Step 2: Set password for test user
    const testEmail = 'test@whatsapp-platform.com';
    const password = 'test123'; // 简单的测试密码
    const passwordHash = await bcrypt.hash(password, 10);

    const [updateResult] = await sequelize.query(`
      UPDATE users 
      SET 
        password_hash = :passwordHash,
        status = 'active',
        "updatedAt" = NOW()
      WHERE email = :email
      RETURNING id, name, email, whatsapp_account_id, phone_number_id;
    `, {
      replacements: {
        email: testEmail,
        passwordHash
      }
    });

    if (updateResult.length === 0) {
      console.error('❌ test 用户不存在');
      process.exit(1);
    }

    console.log('✅ test 用户密码已设置！\n');
    console.log('📊 用户信息：');
    console.log(`   Email: ${updateResult[0].email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${updateResult[0].name}`);
    console.log(`   WABA ID: ${updateResult[0].whatsapp_account_id}`);
    console.log(`   Phone Number ID: ${updateResult[0].phone_number_id}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ 完成！现在可以用以下信息登录：');
    console.log('');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('💡 这个账号有完整的 WhatsApp 配置，可以正常使用所有功能！');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteUserAndSetupPassword();
