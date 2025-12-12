const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function updateSuperAdmin() {
  console.log('🔧 Updating Super Admin role...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Update admin user to super_admin
    await sequelize.query(`
      UPDATE users 
      SET role = 'super_admin' 
      WHERE email = 'admin@whatsapp-platform.com';
    `);

    console.log('✅ Updated Super Admin role\n');

    // Show user
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, status 
      FROM users
      WHERE email = 'admin@whatsapp-platform.com';
    `);

    console.log('📋 Super Admin:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}): ${user.role} - ${user.status}`);
    });

    console.log('\n✅ Update complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateSuperAdmin();
