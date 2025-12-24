const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function clearOldMessages() {
  try {
    console.log('🗑️  Clearing old messages...');
    
    // Clear messages table
    await pool.query('DELETE FROM messages');
    console.log('✅ Messages table cleared');
    
    // Clear conversations table
    await pool.query('DELETE FROM conversations');
    console.log('✅ Conversations table cleared');
    
    console.log('✅ All old messages cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearOldMessages();
