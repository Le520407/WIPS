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

async function updateToken() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const permanentToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!permanentToken) {
      console.log('❌ WHATSAPP_ACCESS_TOKEN not found in .env');
      process.exit(1);
    }
    
    await sequelize.query(
      `UPDATE users 
       SET access_token = :token 
       WHERE email = 'whatsapp_1767086593038@business.com'`,
      { replacements: { token: permanentToken } }
    );
    
    console.log('✅ Token updated successfully!');
    console.log('   User: whatsapp_1767086593038@business.com');
    console.log('   Token length:', permanentToken.length, 'chars');
    console.log('   Token preview:', permanentToken.substring(0, 50) + '...');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateToken();
