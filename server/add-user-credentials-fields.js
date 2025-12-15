const sequelize = require('./dist/config/database').default;

async function addFields() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    console.log('📝 Adding waba_id and phone_number_id columns to users table...');
    
    // Add waba_id column
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN waba_id VARCHAR(255)
      `);
      console.log('✅ Added waba_id column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  waba_id column already exists');
      } else {
        throw error;
      }
    }

    // Add phone_number_id column
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN phone_number_id VARCHAR(255)
      `);
      console.log('✅ Added phone_number_id column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  phone_number_id column already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Database schema updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

addFields();
