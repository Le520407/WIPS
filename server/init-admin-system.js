const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Initialize database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function initAdminSystem() {
  console.log('🚀 Initializing Admin System...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Define models (simplified for script)
    const Permission = sequelize.define('permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: Sequelize.STRING,
      description: Sequelize.STRING,
      category: Sequelize.STRING,
    }, { timestamps: true });

    const RolePermission = sequelize.define('role_permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      role: Sequelize.ENUM('super_admin', 'admin', 'manager', 'agent'),
      permission_id: Sequelize.INTEGER,
    }, { timestamps: true });

    const User = sequelize.define('users', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      email: Sequelize.STRING,
      password_hash: Sequelize.STRING,
      name: Sequelize.STRING,
      role: Sequelize.ENUM('super_admin', 'admin', 'manager', 'agent'),
      status: Sequelize.ENUM('active', 'suspended', 'inactive'),
    }, { timestamps: true });

    const Account = sequelize.define('accounts', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      name: Sequelize.STRING,
      type: Sequelize.ENUM('business', 'website'),
      whatsapp_business_account_id: Sequelize.STRING,
      phone_number_id: Sequelize.STRING,
      access_token: Sequelize.TEXT,
      status: Sequelize.ENUM('active', 'suspended', 'inactive'),
      settings: Sequelize.JSON,
    }, { timestamps: true });

    const AccountUser = sequelize.define('account_users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      account_id: Sequelize.UUID,
      user_id: Sequelize.UUID,
      role: Sequelize.ENUM('admin', 'manager', 'agent'),
      permissions: Sequelize.JSON,
    }, { timestamps: true });

    // Sync models (skip sync, tables already created)
    console.log('✅ Using existing database models\n');

    // 1. Create Permissions
    console.log('📝 Creating permissions...');
    const permissions = [
      // Messages
      { name: 'messages.view', description: 'View messages', category: 'messages' },
      { name: 'messages.send', description: 'Send messages', category: 'messages' },
      { name: 'messages.delete', description: 'Delete messages', category: 'messages' },
      
      // Templates
      { name: 'templates.view', description: 'View templates', category: 'templates' },
      { name: 'templates.create', description: 'Create templates', category: 'templates' },
      { name: 'templates.edit', description: 'Edit templates', category: 'templates' },
      { name: 'templates.delete', description: 'Delete templates', category: 'templates' },
      
      // Contacts
      { name: 'contacts.view', description: 'View contacts', category: 'contacts' },
      { name: 'contacts.create', description: 'Create contacts', category: 'contacts' },
      { name: 'contacts.edit', description: 'Edit contacts', category: 'contacts' },
      { name: 'contacts.delete', description: 'Delete contacts', category: 'contacts' },
      
      // Calls
      { name: 'calls.view', description: 'View call records', category: 'calls' },
      { name: 'calls.make', description: 'Make calls', category: 'calls' },
      { name: 'calls.settings', description: 'Manage call settings', category: 'calls' },
      
      // Commerce
      { name: 'commerce.view', description: 'View orders', category: 'commerce' },
      { name: 'commerce.manage', description: 'Manage orders', category: 'commerce' },
      { name: 'commerce.settings', description: 'Manage commerce settings', category: 'commerce' },
      
      // Analytics
      { name: 'analytics.view', description: 'View analytics', category: 'analytics' },
      { name: 'analytics.export', description: 'Export data', category: 'analytics' },
      
      // Users
      { name: 'users.view', description: 'View users', category: 'users' },
      { name: 'users.create', description: 'Create users', category: 'users' },
      { name: 'users.edit', description: 'Edit users', category: 'users' },
      { name: 'users.delete', description: 'Delete users', category: 'users' },
      
      // Settings
      { name: 'settings.view', description: 'View settings', category: 'settings' },
      { name: 'settings.edit', description: 'Edit settings', category: 'settings' },
    ];

    for (const perm of permissions) {
      await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: perm,
      });
    }
    console.log(`✅ Created ${permissions.length} permissions\n`);

    // 2. Assign permissions to roles
    console.log('🔐 Assigning permissions to roles...');
    
    // Get all permissions
    const allPermissions = await Permission.findAll();
    
    // Agent permissions (basic)
    const agentPermissions = allPermissions.filter(p => 
      ['messages.view', 'messages.send', 'contacts.view', 'templates.view'].includes(p.name)
    );
    
    // Manager permissions (more access)
    const managerPermissions = allPermissions.filter(p => 
      p.category !== 'users' && p.name !== 'settings.edit'
    );
    
    // Admin permissions (almost all)
    const adminPermissions = allPermissions.filter(p => 
      p.name !== 'users.delete'
    );

    // Assign to roles
    for (const perm of agentPermissions) {
      await RolePermission.findOrCreate({
        where: { role: 'agent', permission_id: perm.id },
      });
    }
    
    for (const perm of managerPermissions) {
      await RolePermission.findOrCreate({
        where: { role: 'manager', permission_id: perm.id },
      });
    }
    
    for (const perm of adminPermissions) {
      await RolePermission.findOrCreate({
        where: { role: 'admin', permission_id: perm.id },
      });
    }

    console.log('✅ Agent permissions:', agentPermissions.length);
    console.log('✅ Manager permissions:', managerPermissions.length);
    console.log('✅ Admin permissions:', adminPermissions.length);
    console.log('✅ Super Admin: All permissions (no restrictions)\n');

    // 3. Create Super Admin user
    console.log('👤 Creating Super Admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@whatsapp-platform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const password_hash = await bcrypt.hash(adminPassword, 10);

    const [superAdmin, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        email: adminEmail,
        password_hash,
        name: 'Super Administrator',
        role: 'super_admin',
        status: 'active',
      },
    });

    if (created) {
      console.log('✅ Super Admin created');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log('   ⚠️  Please change the password after first login!\n');
    } else {
      console.log('✅ Super Admin already exists\n');
    }

    // 4. Create default account (from existing env)
    console.log('🏢 Creating default account...');
    const [defaultAccount, accountCreated] = await Account.findOrCreate({
      where: { phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID },
      defaults: {
        name: process.env.DEFAULT_ACCOUNT_NAME || 'Default Account',
        type: 'business',
        whatsapp_business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID,
        access_token: process.env.WHATSAPP_ACCESS_TOKEN,
        status: 'active',
        settings: {},
      },
    });

    if (accountCreated) {
      console.log('✅ Default account created');
      console.log(`   Name: ${defaultAccount.name}`);
      console.log(`   WABA ID: ${defaultAccount.whatsapp_business_account_id}`);
      console.log(`   Phone ID: ${defaultAccount.phone_number_id}\n`);
    } else {
      console.log('✅ Default account already exists\n');
    }

    // 5. Assign Super Admin to default account
    console.log('🔗 Assigning Super Admin to default account...');
    await AccountUser.findOrCreate({
      where: {
        account_id: defaultAccount.id,
        user_id: superAdmin.id,
      },
      defaults: {
        account_id: defaultAccount.id,
        user_id: superAdmin.id,
        role: 'admin',
        permissions: [],
      },
    });
    console.log('✅ Super Admin assigned to default account\n');

    // 6. Migrate existing users to default account
    console.log('👥 Migrating existing users...');
    const existingUsers = await User.findAll({
      where: {
        id: { [Sequelize.Op.ne]: superAdmin.id },
      },
    });

    for (const user of existingUsers) {
      // Update user role if not set
      if (!user.role || user.role === null) {
        await user.update({ role: 'admin', status: 'active' });
      }

      // Assign to default account
      await AccountUser.findOrCreate({
        where: {
          account_id: defaultAccount.id,
          user_id: user.id,
        },
        defaults: {
          account_id: defaultAccount.id,
          user_id: user.id,
          role: 'admin',
          permissions: [],
        },
      });
    }
    console.log(`✅ Migrated ${existingUsers.length} existing users\n`);

    console.log('🎉 Admin System initialization complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Permissions: ${permissions.length}`);
    console.log(`   - Super Admin: ${adminEmail}`);
    console.log(`   - Default Account: ${defaultAccount.name}`);
    console.log(`   - Total Users: ${existingUsers.length + 1}`);
    console.log('\n✅ You can now use the Admin System!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

initAdminSystem();
