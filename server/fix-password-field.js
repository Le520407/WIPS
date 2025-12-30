const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: console.log
  }
);

async function fixPasswordField() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Add password_hash field if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    `);
    
    console.log('✅ password_hash field added');

    // Copy password to password_hash for test user
    await sequelize.query(`
      UPDATE users 
      SET password_hash = password 
      WHERE email = 'test@whatsapp-platform.com' AND password IS NOT NULL;
    `);
    
    console.log('✅ Password copied to password_hash field');
    console.log('');
    console.log('Now you can login with:');
    console.log('📧 Email: test@whatsapp-platform.com');
    console.log('🔑 Password: test123456');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPasswordField();
