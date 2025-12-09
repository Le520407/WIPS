/**
 * Add SDP field to calls table
 * This field stores the SDP offer from WhatsApp for incoming calls
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
  }
);

async function addSdpField() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    console.log('\n📝 Adding sdp field to calls table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='calls' AND column_name='sdp';
    `);

    if (results.length > 0) {
      console.log('⚠️  sdp field already exists');
    } else {
      // Add the column
      await sequelize.query(`
        ALTER TABLE calls 
        ADD COLUMN sdp TEXT;
      `);
      console.log('✅ sdp field added successfully');
    }

    console.log('\n✅ Migration completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addSdpField();
