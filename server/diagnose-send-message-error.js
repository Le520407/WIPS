require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

async function diagnoseSendMessageError() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check test user
    const [users] = await sequelize.query(`
      SELECT 
        id,
        email,
        phone_number_id,
        access_token,
        whatsapp_account_id,
        "createdAt"
      FROM users
      WHERE email = 'test@test.com'
      LIMIT 1;
    `);

    if (users.length === 0) {
      console.log('❌ Test user not found');
      return;
    }

    const user = users[0];
    console.log('📋 Test User Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Phone Number ID: ${user.phone_number_id || '❌ NOT SET'}`);
    console.log(`Access Token: ${user.access_token ? '✅ SET (' + user.access_token.substring(0, 20) + '...)' : '❌ NOT SET'}`);
    console.log(`WABA ID: ${user.whatsapp_account_id || '❌ NOT SET'}`);
    console.log(`Created At: ${user.createdAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check environment variables
    console.log('🔧 Environment Variables:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ NOT SET'}`);
    console.log(`WHATSAPP_ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET (' + process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 20) + '...)' : '❌ NOT SET'}`);
    console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ NOT SET'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Determine which config will be used
    console.log('🎯 Configuration Priority:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const phoneNumberId = user.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = user.access_token || process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = user.whatsapp_account_id || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    console.log(`Phone Number ID: ${phoneNumberId} ${user.phone_number_id ? '(from user)' : '(from env)'}`);
    console.log(`Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : '❌ MISSING'} ${user.access_token ? '(from user)' : '(from env)'}`);
    console.log(`WABA ID: ${wabaId} ${user.whatsapp_account_id ? '(from user)' : '(from env)'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if token is valid
    if (!accessToken) {
      console.log('❌ CRITICAL: No access token available!');
      console.log('   This will cause 500 errors when sending messages.\n');
      return;
    }

    // Test the token
    console.log('🧪 Testing Access Token...');
    const axios = require('axios');
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      console.log('✅ Access token is valid!');
      console.log(`   Phone Number: ${response.data.display_phone_number}`);
      console.log(`   Verified Name: ${response.data.verified_name}\n`);
    } catch (error) {
      console.log('❌ Access token test failed!');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
      } else {
        console.log(`   Error: ${error.message}\n`);
      }
    }

    // Check recent messages
    const [messages] = await sequelize.query(`
      SELECT 
        id,
        type,
        status,
        content,
        "createdAt"
      FROM messages
      WHERE user_id = '${user.id}'
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `);

    console.log('📨 Recent Messages:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (messages.length === 0) {
      console.log('No messages found');
    } else {
      messages.forEach((msg, i) => {
        console.log(`${i + 1}. [${msg.type}] ${msg.status} - ${msg.content.substring(0, 50)}...`);
        console.log(`   Created: ${msg.createdAt}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

diagnoseSendMessageError();
