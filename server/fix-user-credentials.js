const sequelize = require('./dist/config/database').default;
const User = require('./dist/models/User').default;

const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
const WABA_ID = '673274279136021';
const PHONE_NUMBER_ID = '803320889535856';

async function fixCredentials() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const user = await User.findByPk(USER_ID);
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('📝 Updating user credentials...');
    
    user.waba_id = WABA_ID;
    user.phone_number_id = PHONE_NUMBER_ID;
    await user.save();

    console.log('✅ User credentials updated!');
    console.log('');
    console.log('📋 Updated Credentials:');
    console.log('WABA ID:', user.waba_id);
    console.log('Phone Number ID:', user.phone_number_id);
    console.log('');
    console.log('✅ Ready to test authentication templates!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixCredentials();
