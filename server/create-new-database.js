const { Client } = require('pg');
require('dotenv').config();

async function createNewDatabase() {
  // 配置 - 根据需要修改这些值
  const config = {
    dbName: 'whatsapp_platform_new',
    dbUser: 'whatsapp_user',
    dbPassword: 'change_this_password_123!@#',
    adminUser: 'postgres',
    adminPassword: '', // 如果postgres用户有密码，在这里填写
    host: 'localhost',
    port: 5432,
  };

  console.log('🔧 Starting database creation process...\n');

  // 连接到postgres数据库（默认数据库）
  const client = new Client({
    host: config.host,
    port: config.port,
    database: 'postgres',
    user: config.adminUser,
    password: config.adminPassword,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // 检查数据库是否已存在
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.dbName]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`\n⚠️  Database '${config.dbName}' already exists!`);
      console.log('   If you want to recreate it, please drop it first:');
      console.log(`   DROP DATABASE ${config.dbName};`);
      await client.end();
      return;
    }

    // 创建数据库
    console.log(`\n📊 Creating database '${config.dbName}'...`);
    await client.query(`CREATE DATABASE ${config.dbName}`);
    console.log(`✅ Database '${config.dbName}' created successfully!`);

    // 检查用户是否已存在
    const userCheck = await client.query(
      `SELECT 1 FROM pg_user WHERE usename = $1`,
      [config.dbUser]
    );

    if (userCheck.rows.length === 0) {
      // 创建用户
      console.log(`\n👤 Creating user '${config.dbUser}'...`);
      await client.query(
        `CREATE USER ${config.dbUser} WITH PASSWORD '${config.dbPassword}'`
      );
      console.log(`✅ User '${config.dbUser}' created successfully!`);
    } else {
      console.log(`\nℹ️  User '${config.dbUser}' already exists, skipping creation`);
    }

    // 授予数据库权限
    console.log(`\n🔐 Granting privileges...`);
    await client.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${config.dbName} TO ${config.dbUser}`
    );
    console.log(`✅ Database privileges granted to '${config.dbUser}'`);

    await client.end();

    // 连接到新数据库设置schema权限
    console.log(`\n🔧 Setting up schema permissions...`);
    const newDbClient = new Client({
      host: config.host,
      port: config.port,
      database: config.dbName,
      user: config.adminUser,
      password: config.adminPassword,
    });

    await newDbClient.connect();
    
    // 授予schema权限
    await newDbClient.query(`GRANT ALL ON SCHEMA public TO ${config.dbUser}`);
    await newDbClient.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${config.dbUser}`
    );
    await newDbClient.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${config.dbUser}`
    );
    
    console.log(`✅ Schema permissions configured`);
    
    await newDbClient.end();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database setup complete!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:\n');
    console.log('1. Update your server/.env file with:');
    console.log(`   DB_HOST=${config.host}`);
    console.log(`   DB_PORT=${config.port}`);
    console.log(`   DB_NAME=${config.dbName}`);
    console.log(`   DB_USER=${config.dbUser}`);
    console.log(`   DB_PASSWORD=${config.dbPassword}`);
    console.log('\n2. Initialize database tables:');
    console.log('   node create-blocked-users-table.js');
    console.log('   node init-admin-system.js');
    console.log('\n3. Test the connection:');
    console.log('   node test-db-connection.js');
    console.log('\n4. Restart your application');
    console.log('');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check if you have permission to create databases');
    console.error('3. Verify the admin credentials are correct');
    console.error('4. Check pg_hba.conf for connection permissions');
    process.exit(1);
  }
}

// 运行脚本
createNewDatabase();
