/**
 * Add context fields to messages table for reply/quote functionality
 * 
 * Run this script to add the new fields:
 * node add-context-fields.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function addContextFields() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'whatsapp_platform'}' 
      AND TABLE_NAME = 'messages' 
      AND COLUMN_NAME IN ('context_message_id', 'context_message_content')
    `);

    if (results.length > 0) {
      console.log('⚠️  Context fields already exist. Skipping...');
      await sequelize.close();
      return;
    }

    console.log('📝 Adding context fields to messages table...\n');

    // Add context_message_id column
    await sequelize.query(`
      ALTER TABLE messages 
      ADD COLUMN context_message_id VARCHAR(255) NULL AFTER caption
    `);
    console.log('✅ Added context_message_id column');

    // Add context_message_content column
    await sequelize.query(`
      ALTER TABLE messages 
      ADD COLUMN context_message_content TEXT NULL AFTER context_message_id
    `);
    console.log('✅ Added context_message_content column');

    console.log('\n🎉 Context fields added successfully!');
    console.log('\nThese fields will store:');
    console.log('- context_message_id: The ID of the message being replied to');
    console.log('- context_message_content: The content of the original message');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addContextFields();
