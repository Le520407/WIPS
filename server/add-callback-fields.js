/**
 * Add callback fields to calls table
 * Run this to add callback_sent and callback_completed fields
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'whatsapp_user',
  process.env.DB_PASSWORD || '123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function addCallbackFields() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if columns exist
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'calls'
      AND column_name IN ('callback_sent', 'callback_sent_at', 'callback_completed', 'callback_completed_at')
    `);

    const existingColumns = results.map((r) => r.column_name);
    console.log('📋 Existing callback columns:', existingColumns);

    // Add callback_sent if not exists
    if (!existingColumns.includes('callback_sent')) {
      console.log('➕ Adding callback_sent column...');
      await sequelize.query(`
        ALTER TABLE calls 
        ADD COLUMN callback_sent BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log('✅ Added callback_sent column');
    } else {
      console.log('✓ callback_sent column already exists');
    }

    // Add callback_sent_at if not exists
    if (!existingColumns.includes('callback_sent_at')) {
      console.log('➕ Adding callback_sent_at column...');
      await sequelize.query(`
        ALTER TABLE calls 
        ADD COLUMN callback_sent_at DATETIME NULL
      `);
      console.log('✅ Added callback_sent_at column');
    } else {
      console.log('✓ callback_sent_at column already exists');
    }

    // Add callback_completed if not exists
    if (!existingColumns.includes('callback_completed')) {
      console.log('➕ Adding callback_completed column...');
      await sequelize.query(`
        ALTER TABLE calls 
        ADD COLUMN callback_completed BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log('✅ Added callback_completed column');
    } else {
      console.log('✓ callback_completed column already exists');
    }

     // Add callback_completed_at if not exists
     if (!existingColumns.includes('callback_completed_at')) {
      console.log('➕ Adding callback_completed_at column...');
      await sequelize.query(`
        ALTER TABLE calls 
        ADD COLUMN callback_completed_at DATETIME NULL
      `);
      console.log('✅ Added callback_completed_at column');
    } else {
      console.log('✓ callback_completed_at column already exists');
    }

    console.log('\n✅ All callback fields are ready!');
    console.log('\n📊 Current calls table structure:');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'calls'
      ORDER BY ordinal_position
    `);
    console.table(columns);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

addCallbackFields();
