/**
 * Add WhatsApp Token to Password Login User
 * 
 * This script adds the access token from .env to the password login user
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function addTokenToUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const email = 'test@whatsapp-platform.com';
    
    // Get token from .env
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !wabaId || !phoneNumberId) {
      console.error('❌ Missing environment variables:');
      console.error('   WHATSAPP_ACCESS_TOKEN:', accessToken ? '✅' : '❌');
      console.error('   WHATSAPP_BUSINESS_ACCOUNT_ID:', wabaId ? '✅' : '❌');
      console.error('   WHATSAPP_PHONE_NUMBER_ID:', phoneNumberId ? '✅' : '❌');
      process.exit(1);
    }
    
    // Update user
    const [results] = await sequelize.query(`
      UPDATE users 
      SET 
        access_token = :accessToken,
        whatsapp_account_id = :wabaId,
        phone_number_id = :phoneNumberId,
        "updatedAt" = NOW()
      WHERE email = :email
      RETURNING id, name, email, whatsapp_account_id, phone_number_id;
    `, {
      replacements: { email, accessToken, wabaId, phoneNumberId }
    });
    
    if (results.length === 0) {
      console.error(`❌ User not found: ${email}`);
      console.log('\n💡 Run this first:');
      console.log('   node set-test-password.js');
      process.exit(1);
    }
    
    const user = results[0];
    
    console.log('✅ Token added to user!\n');
    console.log('📋 User Info:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   WABA ID:', user.whatsapp_account_id);
    console.log('   Phone Number ID:', user.phone_number_id);
    console.log('   Access Token:', accessToken.substring(0, 20) + '...');
    console.log('\n✅ You can now send messages with this user!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addTokenToUser();
