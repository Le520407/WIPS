const bcrypt = require('bcryptjs');
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

async function setTestUserPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'test@whatsapp-platform.com';
    const newPassword = 'test123456'; // 修改这里设置你想要的密码
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const [results] = await sequelize.query(
      `UPDATE users SET password = :password WHERE email = :email`,
      {
        replacements: { password: hashedPassword, email }
      }
    );
    
    if (results === 0) {
      console.log('❌ User not found');
    } else {
      console.log('✅ Password updated successfully!');
      console.log('');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', newPassword);
      console.log('');
      console.log('You can now login with these credentials.');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setTestUserPassword();
