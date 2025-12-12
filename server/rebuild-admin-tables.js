const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function rebuildAdminTables() {
  console.log('🔨 Rebuilding admin tables with force...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Define models
    const Permission = sequelize.define('permissions', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      category: DataTypes.STRING,
    }, { timestamps: true });

    const RolePermission = sequelize.define('role_permissions', {
      role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'agent'),
        primaryKey: true,
      },
      permission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    }, { timestamps: true });

    const Account = sequelize.define('accounts', {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: DataTypes.STRING,
      type: DataTypes.ENUM('business', 'website'),
      whatsapp_business_account_id: DataTypes.STRING,
      phone_number_id: DataTypes.STRING,
      access_token: DataTypes.TEXT,
      status: DataTypes.ENUM('active', 'suspended', 'inactive'),
      settings: DataTypes.JSON,
    }, { timestamps: true });

    const AccountUser = sequelize.define('account_users', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      account_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      role: DataTypes.ENUM('admin', 'manager', 'agent'),
      permissions: DataTypes.JSON,
    }, { timestamps: true });

    const AuditLog = sequelize.define('audit_logs', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: DataTypes.UUID,
      account_id: DataTypes.UUID,
      action: DataTypes.STRING,
      resource_type: DataTypes.STRING,
      resource_id: DataTypes.STRING,
      details: DataTypes.JSON,
      ip_address: DataTypes.STRING,
      user_agent: DataTypes.TEXT,
    }, { timestamps: true, updatedAt: false });

    // Sync with force
    console.log('🔄 Syncing models with force: true...');
    await Permission.sync({ force: true });
    await RolePermission.sync({ force: true });
    await Account.sync({ force: true });
    await AccountUser.sync({ force: true });
    await AuditLog.sync({ force: true });
    console.log('✅ Models synced\n');

    console.log('✅ Rebuild complete!');
    console.log('Now run: node init-admin-system.js');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

rebuildAdminTables();
