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

async function setPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const email = 'test@whatsapp-platform.com';
    const password = 'test123456';
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Update user
    const [result] = await sequelize.query(
      `UPDATE users 
       SET password_hash = :password_hash 
       WHERE email = :email
       RETURNING id, email`,
      {
        replacements: { email, password_hash }
      }
    );
    
    if (result.length > 0) {
      console.log('✅ Password set successfully!');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('\n💡 You can now login with:');
      console.log('   Email: test@whatsapp-platform.com');
      console.log('   Password: test123456');
    } else {
      console.log('❌ User not found');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setPassword();
