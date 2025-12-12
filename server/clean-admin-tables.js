const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function cleanAdminTables() {
  console.log('🧹 Cleaning admin tables...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Drop tables in correct order (respecting foreign keys)
    const tables = [
      'audit_logs',
      'role_permissions',
      'account_users',
      'accounts',
    ];

    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} doesn't exist or error:`, error.message);
      }
    }

    // Drop ENUM types
    const enums = [
      'enum_accounts_type',
      'enum_accounts_status',
      'enum_users_role',
      'enum_users_status',
      'enum_account_users_role',
      'enum_role_permissions_role',
    ];

    for (const enumType of enums) {
      try {
        await sequelize.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`✅ Dropped enum: ${enumType}`);
      } catch (error) {
        // Ignore errors
      }
    }

    console.log('\n✅ Cleanup complete!');
    console.log('Now run: node init-admin-system.js');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

cleanAdminTables();
