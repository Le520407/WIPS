const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

async function createBlockedUsersTable() {
  console.log('🔧 Creating blocked_users table...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check if table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blocked_users'
      );
    `);

    if (results[0].exists) {
      console.log('⚠️  Table blocked_users already exists');
      console.log('   Dropping and recreating...\n');
      await sequelize.query('DROP TABLE IF EXISTS blocked_users CASCADE;');
    }

    // Create table
    await sequelize.query(`
      CREATE TABLE blocked_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        phone_number_id VARCHAR(255) NOT NULL,
        blocked_phone_number VARCHAR(255) NOT NULL,
        wa_id VARCHAR(255) NOT NULL,
        reason TEXT,
        blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Table blocked_users created successfully');

    // Create indexes
    await sequelize.query(`
      CREATE INDEX idx_blocked_users_user_id ON blocked_users(user_id);
    `);
    await sequelize.query(`
      CREATE INDEX idx_blocked_users_phone_number_id ON blocked_users(phone_number_id);
    `);
    await sequelize.query(`
      CREATE INDEX idx_blocked_users_blocked_phone ON blocked_users(blocked_phone_number);
    `);

    console.log('✅ Indexes created successfully');

    // Verify table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'blocked_users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ blocked_users table is ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createBlockedUsersTable();
