const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('whatsapp_platform', 'whatsapp_user', '123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

async function addReactionFields() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('📋 Checking if reaction fields exist...');
    
    // Check if reaction_emoji column exists
    const [emojiResults] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name = 'reaction_emoji';
    `);

    if (emojiResults.length === 0) {
      console.log('➕ Adding reaction_emoji column...');
      await sequelize.query(`
        ALTER TABLE messages
        ADD COLUMN reaction_emoji VARCHAR(10);
      `);
      console.log('✅ reaction_emoji column added');
    } else {
      console.log('✅ reaction_emoji column already exists');
    }

    // Check if reaction_message_id column exists
    const [messageIdResults] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name = 'reaction_message_id';
    `);

    if (messageIdResults.length === 0) {
      console.log('➕ Adding reaction_message_id column...');
      await sequelize.query(`
        ALTER TABLE messages
        ADD COLUMN reaction_message_id VARCHAR(255);
      `);
      console.log('✅ reaction_message_id column added');
    } else {
      console.log('✅ reaction_message_id column already exists');
    }

    console.log('🎉 All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addReactionFields();
