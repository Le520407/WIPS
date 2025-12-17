require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whatsapp_platform', {
  logging: false
});

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check for auth_templates table
    const [authTemplates] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'auth_templates'
    `);

    console.log('\n📋 Auth Templates table:', authTemplates.length > 0 ? '✅ EXISTS' : '❌ MISSING');

    // Check for otp_codes table
    const [otpCodes] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'otp_codes'
    `);

    console.log('📋 OTP Codes table:', otpCodes.length > 0 ? '✅ EXISTS' : '❌ MISSING');

    if (authTemplates.length === 0 || otpCodes.length === 0) {
      console.log('\n⚠️  Missing tables detected. Creating them now...\n');
      
      // Import models to trigger table creation
      const AuthTemplate = require('./dist/models/AuthTemplate').default;
      const OTPCode = require('./dist/models/OTPCode').default;
      
      await sequelize.sync({ alter: true });
      console.log('✅ Tables created/updated successfully');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
