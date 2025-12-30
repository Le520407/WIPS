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

async function addPhoneNumberIdField() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Add phone_number_id field if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(255);
    `);
    
    console.log('✅ phone_number_id field added to users table');
    console.log('');
    console.log('📝 This field will store each user\'s WhatsApp Phone Number ID');
    console.log('   after they complete Embedded Signup.');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPhoneNumberIdField();
