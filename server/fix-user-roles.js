const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function fixUserRoles() {
  console.log('🔧 Fixing user roles...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Update NULL roles to 'admin'
    await sequelize.query(`
      UPDATE users 
      SET role = 'admin', status = 'active' 
      WHERE role IS NULL OR status IS NULL;
    `);

    console.log('✅ Updated user roles\n');

    // Show all users
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, status 
      FROM users;
    `);

    console.log('📋 Current users:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}): ${user.role} - ${user.status}`);
    });

    console.log('\n✅ Fix complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixUserRoles();
