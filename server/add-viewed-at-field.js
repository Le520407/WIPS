/**
 * Migration script to add viewed_at field to calls table
 * Run this to update existing database schema
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
  }
);

async function addViewedAtField() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('\n📋 Checking if viewed_at column exists...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'calls' 
      AND column_name = 'viewed_at';
    `);

    if (results.length > 0) {
      console.log('✅ viewed_at column already exists');
      return;
    }

    console.log('➕ Adding viewed_at column to calls table...');
    
    await sequelize.query(`
      ALTER TABLE calls 
      ADD COLUMN viewed_at TIMESTAMP WITH TIME ZONE;
    `);

    console.log('✅ viewed_at column added successfully');

    // Show current table structure
    console.log('\n📊 Current calls table structure:');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'calls'
      ORDER BY ordinal_position;
    `);
    console.table(columns);

    console.log('\n✅ Migration completed successfully!');
    console.log('💡 The viewed_at field will be used to track when users view missed calls');
    console.log('💡 Dashboard badge will only show for unviewed missed calls');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
addViewedAtField()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
