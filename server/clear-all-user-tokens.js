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

async function clearAllUserTokens() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. Check current user configurations
    console.log('📋 Current User Configurations:\n');
    const [users] = await sequelize.query(`
      SELECT 
        id,
        email,
        phone_number_id,
        access_token,
        whatsapp_account_id
      FROM users
      ORDER BY "createdAt" DESC;
    `);

    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone Number ID: ${user.phone_number_id || 'NULL'}`);
      console.log(`Access Token: ${user.access_token ? 'SET (' + user.access_token.substring(0, 20) + '...)' : 'NULL'}`);
      console.log(`WABA ID: ${user.whatsapp_account_id || 'NULL'}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. Check environment variables
    console.log('🔧 Environment Variables (.env):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ NOT SET'}`);
    console.log(`WHATSAPP_ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET (' + process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 20) + '...)' : '❌ NOT SET'}`);
    console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ NOT SET'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. Verify environment variables are set
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || 
        !process.env.WHATSAPP_ACCESS_TOKEN || 
        !process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      console.log('❌ ERROR: Environment variables are not properly configured!');
      console.log('\n⚠️  Before clearing user tokens, you MUST set these in .env file:');
      console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id');
      console.log('   WHATSAPP_ACCESS_TOKEN=your_permanent_token');
      console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id\n');
      console.log('💡 After setting .env, run this script again.\n');
      return;
    }

    // 4. Test environment variables
    console.log('🧪 Testing environment variables...\n');
    const axios = require('axios');
    
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
          }
        }
      );
      console.log('✅ Environment variables are VALID!');
      console.log(`   Phone: ${response.data.display_phone_number}`);
      console.log(`   Name: ${response.data.verified_name}\n`);
    } catch (error) {
      console.log('❌ Environment variables test FAILED!');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
      } else {
        console.log(`   Error: ${error.message}\n`);
      }
      console.log('⚠️  Cannot proceed with invalid environment variables.\n');
      return;
    }

    // 5. Clear all user tokens
    console.log('🔄 Clearing all user WhatsApp configurations...\n');
    
    const [result] = await sequelize.query(`
      UPDATE users
      SET 
        phone_number_id = NULL,
        access_token = NULL,
        whatsapp_account_id = NULL
      WHERE 
        phone_number_id IS NOT NULL 
        OR access_token IS NOT NULL 
        OR whatsapp_account_id IS NOT NULL;
    `);

    console.log(`✅ Cleared WhatsApp config for all users\n`);

    // 6. Verify the changes
    console.log('📋 Updated User Configurations:\n');
    const [updatedUsers] = await sequelize.query(`
      SELECT 
        id,
        email,
        phone_number_id,
        access_token,
        whatsapp_account_id
      FROM users
      ORDER BY "createdAt" DESC;
    `);

    for (const user of updatedUsers) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone Number ID: ${user.phone_number_id || '✅ NULL (will use .env)'}`);
      console.log(`Access Token: ${user.access_token || '✅ NULL (will use .env)'}`);
      console.log(`WABA ID: ${user.whatsapp_account_id || '✅ NULL (will use .env)'}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 7. Summary
    console.log('✅ SUCCESS! All users will now use environment variables.\n');
    console.log('📝 Configuration Priority:');
    console.log('   1. User config (database) - ❌ Now cleared');
    console.log('   2. Environment variables (.env) - ✅ Will be used\n');
    
    console.log('🎯 All users will use:');
    console.log(`   Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    console.log(`   Access Token: ${process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 20)}...`);
    console.log(`   WABA ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}\n`);

    console.log('🔄 Next Steps:');
    console.log('   1. Restart the server: pm2 restart whatsapp-server');
    console.log('   2. Test sending messages');
    console.log('   3. All users should now be able to send messages\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

clearAllUserTokens();
