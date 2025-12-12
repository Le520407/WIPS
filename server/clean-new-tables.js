const { Client } = require('pg');
require('dotenv').config();

async function cleanNewTables() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop tables in correct order (respecting foreign keys)
    const tables = ['contacts', 'contact_labels', 'auto_reply_rules'];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} doesn't exist or error:`, error.message);
      }
    }

    console.log('\n✅ All new tables cleaned up successfully!');
    console.log('You can now restart the server to recreate them with correct types.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanNewTables();
