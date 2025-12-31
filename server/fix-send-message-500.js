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

async function fixSendMessage500() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. Check all users and their token status
    console.log('📋 Checking all users...\n');
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
      console.log(`User ID: ${user.id}`);
      console.log(`Phone Number ID: ${user.phone_number_id || '❌ NOT SET'}`);
      console.log(`Access Token: ${user.access_token ? '✅ SET (' + user.access_token.substring(0, 30) + '...)' : '❌ NOT SET'}`);
      console.log(`WABA ID: ${user.whatsapp_account_id || '❌ NOT SET'}`);
      
      // Check if user has valid config
      const hasValidConfig = user.phone_number_id && user.access_token && user.whatsapp_account_id;
      console.log(`Status: ${hasValidConfig ? '✅ VALID CONFIG' : '⚠️ INCOMPLETE CONFIG'}`);
      console.log('');
    }

    // 2. Check environment variables
    console.log('\n🔧 Environment Variables:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ NOT SET'}`);
    console.log(`WHATSAPP_ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET (' + process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 30) + '...)' : '❌ NOT SET'}`);
    console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ NOT SET'}`);
    console.log('');

    // 3. Identify the problem
    console.log('\n🔍 Problem Analysis:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const hasEnvConfig = process.env.WHATSAPP_PHONE_NUMBER_ID && 
                         process.env.WHATSAPP_ACCESS_TOKEN && 
                         process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    if (!hasEnvConfig) {
      console.log('❌ CRITICAL: Environment variables are missing!');
      console.log('   The .env file needs to have:');
      console.log('   - WHATSAPP_PHONE_NUMBER_ID');
      console.log('   - WHATSAPP_ACCESS_TOKEN');
      console.log('   - WHATSAPP_BUSINESS_ACCOUNT_ID\n');
    }

    // Check if any user has valid config
    const usersWithValidConfig = users.filter(u => 
      u.phone_number_id && u.access_token && u.whatsapp_account_id
    );

    if (usersWithValidConfig.length === 0 && !hasEnvConfig) {
      console.log('❌ CRITICAL: No valid configuration found!');
      console.log('   Neither users nor environment variables have valid WhatsApp config.\n');
      console.log('💡 SOLUTION:');
      console.log('   1. Update server/.env file with your WhatsApp credentials');
      console.log('   2. Or run: node fix-all-users-token.js to update user tokens\n');
      return;
    }

    // 4. Test the configuration
    console.log('\n🧪 Testing Configuration...\n');
    const axios = require('axios');
    
    // Test env config if available
    if (hasEnvConfig) {
      console.log('Testing environment variables config...');
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
            }
          }
        );
        console.log('✅ Environment config is VALID!');
        console.log(`   Phone: ${response.data.display_phone_number}`);
        console.log(`   Name: ${response.data.verified_name}\n`);
      } catch (error) {
        console.log('❌ Environment config test FAILED!');
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
        } else {
          console.log(`   Error: ${error.message}\n`);
        }
      }
    }

    // Test user configs
    for (const user of usersWithValidConfig) {
      console.log(`Testing ${user.email}'s config...`);
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${user.phone_number_id}`,
          {
            headers: {
              'Authorization': `Bearer ${user.access_token}`
            }
          }
        );
        console.log(`✅ ${user.email}'s config is VALID!`);
        console.log(`   Phone: ${response.data.display_phone_number}`);
        console.log(`   Name: ${response.data.verified_name}\n`);
      } catch (error) {
        console.log(`❌ ${user.email}'s config test FAILED!`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
        } else {
          console.log(`   Error: ${error.message}\n`);
        }
      }
    }

    // 5. Provide fix recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!hasEnvConfig) {
      console.log('1. ⚠️ Update server/.env file with valid WhatsApp credentials');
      console.log('   Copy from your Meta App Dashboard:\n');
      console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id');
      console.log('   WHATSAPP_ACCESS_TOKEN=your_system_user_token');
      console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id\n');
    }

    if (usersWithValidConfig.length === 0) {
      console.log('2. ⚠️ Update user tokens in database');
      console.log('   Run: node fix-all-users-token.js\n');
    }

    console.log('3. 🔄 After fixing, restart the server:');
    console.log('   pm2 restart whatsapp-server\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixSendMessage500();
