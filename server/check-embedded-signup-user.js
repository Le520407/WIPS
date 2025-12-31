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

async function checkEmbeddedSignupUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. 查找 Embedded Signup 用户
    console.log('🔍 Checking Embedded Signup User...\n');
    
    const [users] = await sequelize.query(`
      SELECT 
        id,
        email,
        name,
        phone_number_id,
        access_token,
        whatsapp_account_id,
        "createdAt"
      FROM users
      WHERE email LIKE '%@business.com'
      ORDER BY "createdAt" DESC;
    `);

    if (users.length === 0) {
      console.log('❌ No Embedded Signup users found\n');
      return;
    }

    console.log(`📋 Found ${users.length} Embedded Signup user(s):\n`);

    for (const user of users) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Phone Number ID: ${user.phone_number_id || 'NULL'}`);
      console.log(`Access Token: ${user.access_token ? 'SET (' + user.access_token.length + ' chars)' : 'NULL'}`);
      console.log(`WABA ID: ${user.whatsapp_account_id || 'NULL'}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 2. 测试用户的 token
      if (user.access_token && user.phone_number_id) {
        console.log('🧪 Testing user token...\n');
        
        try {
          const response = await axios.get(
            `https://graph.facebook.com/v18.0/${user.phone_number_id}`,
            {
              headers: {
                'Authorization': `Bearer ${user.access_token}`
              }
            }
          );
          
          console.log('✅ User token is VALID!');
          console.log(`   Phone: ${response.data.display_phone_number}`);
          console.log(`   Name: ${response.data.verified_name}`);
          console.log(`   Quality: ${response.data.quality_rating || 'UNKNOWN'}\n`);
        } catch (error) {
          console.log('❌ User token is INVALID!');
          if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error Code: ${error.response.data.error?.code}`);
            console.log(`   Error Message: ${error.response.data.error?.message}\n`);
          } else {
            console.log(`   Error: ${error.message}\n`);
          }
        }
      } else {
        console.log('⚠️  User has no token or phone number ID\n');
      }
    }

    // 3. 检查 Embedded Signup 配置
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Embedded Signup Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Required Environment Variables:');
    console.log(`   META_APP_ID: ${process.env.META_APP_ID || '❌ NOT SET'}`);
    console.log(`   META_APP_SECRET: ${process.env.META_APP_SECRET ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || '❌ NOT SET'}\n`);

    console.log('🔗 Embedded Signup URLs:');
    console.log(`   Redirect URI: ${process.env.CLIENT_URL}/auth/callback`);
    console.log(`   This must be configured in Meta App Settings\n`);

    // 4. 总结
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const validUsers = users.filter(u => u.access_token && u.phone_number_id);
    const invalidUsers = users.filter(u => !u.access_token || !u.phone_number_id);

    console.log(`✅ Valid Embedded Signup users: ${validUsers.length}`);
    console.log(`❌ Invalid/Incomplete users: ${invalidUsers.length}\n`);

    if (validUsers.length > 0) {
      console.log('✅ Embedded Signup user can send messages');
      console.log('   They use their own WhatsApp Business Account\n');
    }

    console.log('💡 Common Issues:\n');
    console.log('1. "Cannot call API for app X on behalf of user Y"');
    console.log('   → This happens during NEW user signup');
    console.log('   → Existing users with valid tokens are NOT affected\n');
    
    console.log('2. Token expired or invalid');
    console.log('   → User needs to go through Embedded Signup again');
    console.log('   → Or manually update token in database\n');

    console.log('3. New users cannot complete Embedded Signup');
    console.log('   → Check Meta App configuration');
    console.log('   → Verify redirect URI is correct');
    console.log('   → Check App Review status\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkEmbeddedSignupUser();
