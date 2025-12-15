const sequelize = require('./dist/config/database').default;
const User = require('./dist/models/User').default;

const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';

async function checkCredentials() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const user = await User.findByPk(USER_ID);
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('📋 User Credentials:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Facebook ID:', user.facebook_id);
    console.log('');
    console.log('Access Token:', user.access_token ? `✅ ${user.access_token.substring(0, 50)}...` : '❌ Missing');
    console.log('WABA ID:', user.waba_id || '❌ Missing');
    console.log('Phone Number ID:', user.phone_number_id || '❌ Missing');
    console.log('');

    if (!user.access_token) {
      console.log('❌ Missing access_token - Cannot make API calls');
    }
    if (!user.waba_id) {
      console.log('❌ Missing waba_id - Cannot create templates');
    }
    if (!user.phone_number_id) {
      console.log('❌ Missing phone_number_id - Cannot send messages');
    }

    if (user.access_token && user.waba_id && user.phone_number_id) {
      console.log('✅ All credentials present!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkCredentials();
