import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;
  public facebook_id!: string;
  public name!: string;
  public email!: string;
  public password_hash?: string;
  public role!: 'super_admin' | 'admin' | 'manager' | 'agent';
  public status!: 'active' | 'suspended' | 'inactive';
  public whatsapp_account_id!: string;
  public access_token!: string;
  public waba_id?: string;
  public phone_number_id?: string;
  public last_login?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    facebook_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'agent'),
      allowNull: false,
      defaultValue: 'agent',
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    whatsapp_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    waba_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
