require('dotenv').config();
const { Sequelize } = require('sequelize');
const axios = require('axios');

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

async function fixTestUserToken() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. 检查当前用户配置
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
      console.log(`Access Token: ${user.access_token ? 'SET (' + user.access_token.length + ' chars)' : 'NULL'}`);
      console.log(`WABA ID: ${user.whatsapp_account_id || 'NULL'}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. 检查环境变量
    console.log('🔧 Environment Variables (.env):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ NOT SET'}`);
    console.log(`WHATSAPP_ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET (' + process.env.WHATSAPP_ACCESS_TOKEN.length + ' chars)' : '❌ NOT SET'}`);
    console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ NOT SET'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. 验证环境变量
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || 
        !process.env.WHATSAPP_ACCESS_TOKEN || 
        !process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      console.log('❌ ERROR: Environment variables are not properly configured!\n');
      console.log('⚠️  Please set these in .env file:');
      console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id');
      console.log('   WHATSAPP_ACCESS_TOKEN=your_permanent_token');
      console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id\n');
      return;
    }

    // 4. 测试环境变量 token
    console.log('🧪 Testing environment variables token...\n');
    
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
          }
        }
      );
      console.log('✅ Environment token is VALID!');
      console.log(`   Phone: ${response.data.display_phone_number}`);
      console.log(`   Name: ${response.data.verified_name}\n`);
    } catch (error) {
      console.log('❌ Environment token test FAILED!');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}\n`);
      } else {
        console.log(`   Error: ${error.message}\n`);
      }
      console.log('⚠️  Cannot proceed with invalid environment token.\n');
      return;
    }

    // 5. 只清除 Test User 的配置
    console.log('🔄 Clearing Test User WhatsApp configuration...\n');
    
    const [result] = await sequelize.query(`
      UPDATE users
      SET 
        phone_number_id = NULL,
        access_token = NULL,
        whatsapp_account_id = NULL
      WHERE 
        email = 'test@whatsapp-platform.com';
    `);

    console.log(`✅ Cleared Test User WhatsApp config\n`);

    // 6. 验证更改
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
      
      if (user.email === 'test@whatsapp-platform.com') {
        console.log(`Phone Number ID: ${user.phone_number_id || '✅ NULL (will use .env)'}`);
        console.log(`Access Token: ${user.access_token || '✅ NULL (will use .env)'}`);
        console.log(`WABA ID: ${user.whatsapp_account_id || '✅ NULL (will use .env)'}`);
      } else {
        console.log(`Phone Number ID: ${user.phone_number_id || 'NULL'}`);
        console.log(`Access Token: ${user.access_token ? 'SET (' + user.access_token.length + ' chars)' : 'NULL'}`);
        console.log(`WABA ID: ${user.whatsapp_account_id || 'NULL'}`);
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 7. 总结
    console.log('✅ SUCCESS! Test User will now use environment variables.\n');
    console.log('📝 Configuration:');
    console.log('   • WhatsApp Business User: Uses own token (Embedded Signup)');
    console.log('   • Test User: Uses .env token (Meta test number)\n');
    
    console.log('🎯 Test User will use:');
    console.log(`   Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    console.log(`   Access Token: ${process.env.WHATSAPP_ACCESS_TOKEN.substring(0, 20)}...`);
    console.log(`   WABA ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}\n`);

    console.log('🔄 Next Steps:');
    console.log('   1. Restart the server: pm2 restart whatsapp-server');
    console.log('   2. Login as Test User');
    console.log('   3. Test sending messages');
    console.log('   4. Test User should now be able to send messages\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixTestUserToken();
