const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function checkUserToken() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Query the user
    const [results] = await sequelize.query(`
      SELECT 
        id, 
        email, 
        name,
        facebook_id,
        CASE 
          WHEN access_token IS NULL THEN 'NULL'
          WHEN access_token = '' THEN 'EMPTY'
          ELSE SUBSTRING(access_token, 1, 50) || '...'
        END as access_token_preview,
        LENGTH(access_token) as token_length
      FROM users 
      WHERE email = 'test@whatsapp-platform.com'
    `);

    if (results.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = results[0];
    console.log('📋 User Information:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Facebook ID:', user.facebook_id);
    console.log('Access Token Preview:', user.access_token_preview);
    console.log('Token Length:', user.token_length);
    console.log('');

    if (!user.token_length || user.token_length === 0) {
      console.log('⚠️  WARNING: User has no access_token!');
      console.log('This is why the 401 error occurs.');
      console.log('');
      console.log('Solution: Update the user with a valid access token:');
      console.log(`UPDATE users SET access_token = 'YOUR_META_ACCESS_TOKEN' WHERE id = '${user.id}';`);
    } else {
      console.log('✅ User has access token');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserToken();
