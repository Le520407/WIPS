const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || 5432}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log('');

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );

  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    console.log(`📊 Connected to: ${process.env.DB_NAME}\n`);

    // 获取数据库版本
    const [versionResult] = await sequelize.query('SELECT version()');
    console.log('PostgreSQL Version:');
    console.log(`  ${versionResult[0].version.split(',')[0]}\n`);

    // 列出所有表
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tables.length === 0) {
      console.log('📋 No tables found in database');
      console.log('   Run initialization scripts to create tables:');
      console.log('   - node create-blocked-users-table.js');
      console.log('   - node init-admin-system.js');
    } else {
      console.log(`📋 Tables in database (${tables.length}):`);
      tables.forEach((t) => console.log(`  ✓ ${t.table_name}`));
    }

    // 获取数据库大小
    const [sizeResult] = await sequelize.query(`
      SELECT pg_size_pretty(pg_database_size($1)) as size
    `, {
      bind: [process.env.DB_NAME]
    });
    console.log(`\n💾 Database size: ${sizeResult[0].size}`);

    // 检查连接数
    const [connections] = await sequelize.query(`
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE datname = $1
    `, {
      bind: [process.env.DB_NAME]
    });
    console.log(`🔌 Active connections: ${connections[0].count}`);

    await sequelize.close();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error(`Error: ${error.message}\n`);
    console.error('Troubleshooting:');
    console.error('1. Check if PostgreSQL is running:');
    console.error('   sudo systemctl status postgresql');
    console.error('2. Verify .env file has correct credentials');
    console.error('3. Check if database exists:');
    console.error(`   psql -U postgres -c "\\l" | grep ${process.env.DB_NAME}`);
    console.error('4. Test manual connection:');
    console.error(`   psql -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c "SELECT 1"`);
    process.exit(1);
  }
}

testConnection();
