const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'whatsapp_user',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
  }
);

async function addReactionFields() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Add reaction_emoji field
    try {
      await sequelize.query(`
        ALTER TABLE messages 
        ADD COLUMN reaction_emoji VARCHAR(10) NULL
      `);
      console.log('✅ Added reaction_emoji field');
    } catch (error) {
      if (error.message.includes('already exists') || error.original?.code === '42701') {
        console.log('ℹ️  reaction_emoji field already exists');
      } else {
        throw error;
      }
    }

    // Add reaction_message_id field
    try {
      await sequelize.query(`
        ALTER TABLE messages 
        ADD COLUMN reaction_message_id VARCHAR(255) NULL
      `);
      console.log('✅ Added reaction_message_id field');
    } catch (error) {
      if (error.message.includes('already exists') || error.original?.code === '42701') {
        console.log('ℹ️  reaction_message_id field already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All reaction fields added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addReactionFields();
