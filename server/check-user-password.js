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

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const [results] = await sequelize.query(
      `SELECT id, email, password, password_hash FROM users WHERE email = 'test@whatsapp-platform.com'`
    );
    
    if (results.length === 0) {
      console.log('❌ User not found');
    } else {
      console.log('✅ User found:');
      console.log(JSON.stringify(results[0], null, 2));
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
