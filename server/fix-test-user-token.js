const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function fixTestUserToken() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!accessToken) {
      console.log('❌ WHATSAPP_ACCESS_TOKEN not found in .env');
      return;
    }

    console.log('🔧 Updating test user with access token...');
    console.log('Access Token:', accessToken.substring(0, 50) + '...');
    console.log('WABA ID:', wabaId);
    console.log('');

    // Update the test user
    const [results] = await sequelize.query(`
      UPDATE users 
      SET 
        access_token = :accessToken,
        whatsapp_account_id = :wabaId,
        facebook_id = COALESCE(facebook_id, 'test_user_2024')
      WHERE email = 'test@whatsapp-platform.com'
      RETURNING id, email, name
    `, {
      replacements: { accessToken, wabaId }
    });

    if (results.length === 0) {
      console.log('❌ User not found or not updated');
      return;
    }

    console.log('✅ Test user updated successfully!');
    console.log('User:', results[0]);
    console.log('');
    console.log('🎉 Now you can use the Conversational Components feature!');
    console.log('Please refresh your browser and try again.');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixTestUserToken();
