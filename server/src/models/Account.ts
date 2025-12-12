import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Account extends Model {
  public id!: string;
  public name!: string;
  public type!: 'business' | 'website';
  public whatsapp_business_account_id!: string;
  public phone_number_id!: string;
  public access_token!: string;
  public status!: 'active' | 'suspended' | 'inactive';
  public settings!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('business', 'website'),
      allowNull: false,
      defaultValue: 'business',
    },
    whatsapp_business_account_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone_number_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'accounts',
    timestamps: true,
  }
);

export default Account;
